from django.contrib.auth import get_user_model
from django.db import IntegrityError, models, transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from clinic.models import Doctor, AppointmentSlot, Appointment

from .permissions import IsAdminRole
from .serializers import (
    PatientAccountSerializer, DoctorSerializer,
    AppointmentSlotSerializer, AppointmentSerializer,
)
from .views import reschedule_appointment, send_confirmation_email

User = get_user_model()


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

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        appointment, error = reschedule_appointment(pk, request.data.get('slot_id'))
        if error:
            return error
        send_confirmation_email(appointment)
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=False, methods=['post'], url_path='book')
    def book(self, request):
        try:
            patient_id = int(request.data.get('patient_id'))
            slot_id = int(request.data.get('slot_id'))
        except (TypeError, ValueError):
            return Response(
                {'detail': 'patient_id and slot_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            patient = User.objects.get(pk=patient_id, role=User.Role.PATIENT)
        except User.DoesNotExist:
            return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            try:
                slot = AppointmentSlot.objects.select_for_update().get(pk=slot_id)
            except AppointmentSlot.DoesNotExist:
                return Response({'detail': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)
            if slot.is_booked:
                return Response({'detail': 'Sorry, that slot is already booked.'}, status=status.HTTP_409_CONFLICT)
            if slot.date < timezone.localdate():
                return Response({'detail': 'You cannot book a slot in the past.'}, status=status.HTTP_400_BAD_REQUEST)
            appointment = Appointment.objects.create(patient=patient, slot=slot)
            slot.is_booked = True
            slot.save(update_fields=['is_booked'])

        send_confirmation_email(appointment)
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class AdminPatientViewSet(viewsets.ModelViewSet):
    """Admins can list, edit and delete patient accounts (patients self-register;
    admins are created via the create_admin management command)."""
    http_method_names = ['get', 'patch', 'put', 'delete', 'head', 'options']
    permission_classes = [IsAdminRole]
    serializer_class = PatientAccountSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.Role.PATIENT)

    def destroy(self, request, *args, **kwargs):
        patient = self.get_object()
        with transaction.atomic():
            # free the slots held by this patient's confirmed appointments
            held_slot_ids = list(
                Appointment.objects.filter(
                    patient=patient, status=Appointment.Status.CONFIRMED
                ).values_list('slot_id', flat=True)
            )
            AppointmentSlot.objects.filter(pk__in=held_slot_ids).update(is_booked=False)
            Appointment.objects.filter(patient=patient).delete()
            patient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)