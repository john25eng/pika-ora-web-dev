from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.shortcuts import render, redirect, get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from accounts.decorators import patient_required
from .models import Doctor, AppointmentSlot, Appointment
from .forms import AppointmentNoteForm


@login_required
def redirect_after_login(request):
    if request.user.is_admin_user():
        return redirect('dashboard:home')
    return redirect('clinic:doctor_list')


@patient_required
def doctor_list(request):
    doctors = Doctor.objects.filter(is_active=True)
    return render(request, 'clinic/doctor_list.html', {'doctors': doctors})


@patient_required
def doctor_schedule(request, doctor_id):
    doctor = get_object_or_404(Doctor, pk=doctor_id, is_active=True)
    slots = doctor.slots.filter(
        is_booked=False, date__gte=timezone.localdate()
    ).order_by('date', 'start_time')
    return render(request, 'clinic/doctor_schedule.html', {'doctor': doctor, 'slots': slots})


@patient_required
def book_appointment(request, slot_id):
    if request.method != 'POST':
        return redirect('clinic:doctor_list')

    with transaction.atomic():
        # lock the row so two patients can't book the same slot at once
        slot = get_object_or_404(AppointmentSlot.objects.select_for_update(), pk=slot_id)

        if slot.is_booked:
            messages.error(request, 'Sorry, that slot has just been booked by someone else. Please choose another.')
            return redirect('clinic:doctor_schedule', doctor_id=slot.doctor_id)

        appointment = Appointment.objects.create(patient=request.user, slot=slot)
        slot.is_booked = True
        slot.save(update_fields=['is_booked'])

    send_confirmation_email(appointment)
    messages.success(
        request,
        f'Appointment confirmed with {slot.doctor.full_name} on {slot.date} at {slot.start_time.strftime("%H:%M")}.'
    )
    return redirect('clinic:my_appointments')


def send_confirmation_email(appointment):
    """best-effort email confirmation - console backend in dev, real SMTP in production."""
    try:
        send_mail(
            subject='Piki Ora Medical Centre - Appointment Confirmed',
            message=(
                f'Hi {appointment.patient.first_name or appointment.patient.username},\n\n'
                f'Your appointment with {appointment.slot.doctor.full_name} is confirmed for '
                f'{appointment.slot.date} at {appointment.slot.start_time.strftime("%H:%M")}.\n\n'
                f'You can view or cancel this appointment anytime from "My Appointments".\n\n'
                f'Piki Ora Medical Centre'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else None,
            recipient_list=[appointment.patient.email] if appointment.patient.email else [],
            fail_silently=True,
        )
    except Exception:
        pass


@patient_required
def my_appointments(request):
    appointments = request.user.appointments.select_related('slot', 'slot__doctor').order_by('-slot__date')
    return render(request, 'clinic/my_appointments.html', {'appointments': appointments})


@patient_required
def edit_appointment(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk, patient=request.user, status=Appointment.Status.CONFIRMED)
    if request.method == 'POST':
        form = AppointmentNoteForm(request.POST, instance=appointment)
        if form.is_valid():
            form.save()
            messages.success(request, 'Appointment updated.')
            return redirect('clinic:my_appointments')
    else:
        form = AppointmentNoteForm(instance=appointment)
    return render(request, 'clinic/edit_appointment.html', {'form': form, 'appointment': appointment})


@patient_required
def cancel_appointment(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk, patient=request.user, status=Appointment.Status.CONFIRMED)
    if request.method == 'POST':
        appointment.cancel()
        messages.success(request, 'Appointment cancelled. The slot is now available for other patients.')
        return redirect('clinic:my_appointments')
    return render(request, 'clinic/cancel_appointment.html', {'appointment': appointment})
