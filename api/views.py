from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from clinic.models import Doctor, AppointmentSlot, Appointment

from .permissions import IsAdminRole, IsPatientRole
from .serializers import (
    DoctorSerializer, AppointmentSlotSerializer,
    AppointmentSerializer, AppointmentNoteSerializer,
)

User = get_user_model()


def send_confirmation_email(appointment):
    from django.core.mail import send_mail
    from django.conf import settings
    try:
        send_mail(
            subject='Piki Ora Medical Centre - Appointment Confirmed',
            message=(
                f'Hi {appointment.patient.first_name or appointment.patient.username},\n\n'
                f'Your appointment with {appointment.slot.doctor.full_name} is confirmed for '
                f'{appointment.slot.date} at {appointment.slot.start_time.strftime("%H:%M")}.'
            ),
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
            recipient_list=[appointment.patient.email] if appointment.patient.email else [],
            fail_silently=True,
        )
    except Exception:
        pass


def reschedule_appointment(appointment_id, slot_id, patient=None):
    """moves a confirmed appointment to another open slot inside one transaction.
    returns (appointment, None) on success or (None, error_response) on failure.
    pass patient to restrict the lookup to that patient's own appointments."""
    try:
        slot_id = int(slot_id)
    except (TypeError, ValueError):
        return None, Response({'detail': 'A valid slot_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        appointments = Appointment.objects.select_for_update()
        if patient is not None:
            appointments = appointments.filter(patient=patient)
        try:
            appointment = appointments.get(pk=appointment_id, status=Appointment.Status.CONFIRMED)
        except Appointment.DoesNotExist:
            return None, Response({'detail': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            new_slot = AppointmentSlot.objects.select_for_update().get(pk=slot_id)
        except AppointmentSlot.DoesNotExist:
            return None, Response({'detail': 'Slot not found.'}, status=status.HTTP_404_NOT_FOUND)

        if new_slot.pk == appointment.slot_id:
            return None, Response({'detail': 'That is already your current slot.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_slot.is_booked:
            return None, Response({'detail': 'Sorry, that slot is already booked.'}, status=status.HTTP_409_CONFLICT)
        if new_slot.date < timezone.localdate():
            return None, Response({'detail': 'You cannot move an appointment to a past date.'}, status=status.HTTP_400_BAD_REQUEST)

        old_slot = appointment.slot
        old_slot.is_booked = False
        old_slot.save(update_fields=['is_booked'])
        new_slot.is_booked = True
        new_slot.save(update_fields=['is_booked'])
        appointment.slot = new_slot
        appointment.save(update_fields=['slot', 'updated_at'])

    return appointment, None


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


class RescheduleAppointmentView(APIView):
    """Lets a patient move their own confirmed appointment to another open slot."""
    permission_classes = [IsPatientRole]

    def post(self, request, pk):
        appointment, error = reschedule_appointment(pk, request.data.get('slot_id'), patient=request.user)
        if error:
            return error
        send_confirmation_email(appointment)
        return Response(AppointmentSerializer(appointment).data)


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