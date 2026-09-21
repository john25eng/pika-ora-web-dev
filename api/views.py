from django.contrib.auth import get_user_model
from django.db import IntegrityError, models, transaction
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from clinic.models import Doctor, AppointmentSlot, Appointment
from clinic.views import send_confirmation_email

from .permissions import IsAdminRole, IsPatientRole
from .serializers import (
    RegisterSerializer, UserSerializer, PatientAccountSerializer,
    DoctorSerializer, AppointmentSlotSerializer,
    AppointmentSerializer, AppointmentNoteSerializer,
)

User = get_user_model()


# ============ auth ============

class RegisterView(generics.CreateAPIView):
    """Public registration - always creates a patient account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {'token': token.key, 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(ObtainAuthToken):
    """Returns an auth token plus basic user/role info on successful login."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ============ patient-facing ============

class PatientDoctorListView(generics.ListAPIView):
    """Active doctors a patient can book with."""
    serializer_class = DoctorSerializer
    permission_classes = [IsPatientRole]
    queryset = Doctor.objects.filter(is_active=True)


class PatientDoctorScheduleView(generics.ListAPIView):
    """Open, future slots for one doctor."""
    serializer_class = AppointmentSlotSerializer
    permission_classes = [IsPatientRole]

    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        return AppointmentSlot.objects.filter(
            doctor_id=doctor_id, doctor__is_active=True,
            is_booked=False, date__gte=timezone.localdate(),
        ).order_by('date', 'start_time')


class BookAppointmentView(APIView):
    """Books a slot for the logged-in patient. Uses select_for_update so two
    patients can't double-book the same slot in a race condition."""
    permission_classes = [IsPatientRole]

    def post(self, request, slot_id):
        with transaction.atomic():
            try:
                slot = AppointmentSlot.objects.select_for_update().get(pk=slot_id)
            except AppointmentSlot.DoesNotExist:
                return Response({'detail': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)

            if slot.is_booked:
                return Response(
                    {'detail': 'Sorry, that slot has just been booked by someone else.'},
                    status=status.HTTP_409_CONFLICT,
                )

            appointment = Appointment.objects.create(patient=request.user, slot=slot)
            slot.is_booked = True
            slot.save(update_fields=['is_booked'])

        send_confirmation_email(appointment)
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class MyAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsPatientRole]

    def get_queryset(self):
        return self.request.user.appointments.select_related(
            'slot', 'slot__doctor'
        ).order_by('-slot__date')


class AppointmentNoteUpdateView(generics.UpdateAPIView):
    """Lets a patient edit the note on their own confirmed appointment."""
    serializer_class = AppointmentNoteSerializer
    permission_classes = [IsPatientRole]
    http_method_names = ['patch', 'put']

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user, status=Appointment.Status.CONFIRMED
        )


class CancelAppointmentView(APIView):
    permission_classes = [IsPatientRole]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(
                pk=pk, patient=request.user, status=Appointment.Status.CONFIRMED
            )
        except Appointment.DoesNotExist:
            return Response({'detail': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

        appointment.cancel()
        return Response(AppointmentSerializer(appointment).data)


# ============ admin ============
class AdminDashboardView(APIView):
    """Summary counts for the admin dashboard home screen."""
    permission_classes = [IsAdminRole]

    def get(self, request):
        return Response({
            'doctor_count': Doctor.objects.filter(is_active=True).count(),
            'upcoming_appointments': Appointment.objects.filter(status=Appointment.Status.CONFIRMED).count(),
            'patient_count': User.objects.filter(role=User.Role.PATIENT).count(),
            'open_slots': AppointmentSlot.objects.filter(is_booked=False).count(),
        })

class AdminDoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminRole]


class AdminAppointmentSlotViewSet(viewsets.ModelViewSet):
    queryset = AppointmentSlot.objects.select_related('doctor').all()
    serializer_class = AppointmentSlotSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        doctor_id = self.request.query_params.get('doctor')
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        return qs

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'detail': 'That slot already exists for this doctor at this date/time.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        slot = self.get_object()
        if slot.is_booked:
            return Response(
                {'detail': 'Cannot delete a booked slot. Cancel the appointment first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class AdminAppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Appointment.objects.select_related('patient', 'slot', 'slot__doctor').all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        query = self.request.query_params.get('q')
        if query:
            qs = qs.filter(
                models.Q(patient__username__icontains=query) |
                models.Q(patient__first_name__icontains=query) |
                models.Q(patient__last_name__icontains=query) |
                models.Q(slot__doctor__first_name__icontains=query) |
                models.Q(slot__doctor__last_name__icontains=query)
            )
        return qs

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status == Appointment.Status.CONFIRMED:
            appointment.cancel()
        return Response(AppointmentSerializer(appointment).data)

class AdminPatientViewSet(viewsets.ModelViewSet):
    """Admins can list and edit patient accounts, but not create/delete them here
    (patients self-register; admins are created via the create_admin management command)."""
    http_method_names = ['get', 'patch', 'put', 'head', 'options']
    permission_classes = [IsAdminRole]
    serializer_class = PatientAccountSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.Role.PATIENT)
