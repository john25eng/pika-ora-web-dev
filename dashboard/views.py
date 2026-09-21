from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q

from accounts.decorators import admin_required
from accounts.models import CustomUser
from clinic.models import Doctor, AppointmentSlot, Appointment
from .forms import DoctorForm, AppointmentSlotForm, PatientAccountForm


@admin_required
def home(request):
    context = {
        'doctor_count': Doctor.objects.filter(is_active=True).count(),
        'upcoming_appointments': Appointment.objects.filter(status=Appointment.Status.CONFIRMED).count(),
        'patient_count': CustomUser.objects.filter(role=CustomUser.Role.PATIENT).count(),
        'open_slots': AppointmentSlot.objects.filter(is_booked=False).count(),
    }
    return render(request, 'dashboard/home.html', context)


# ---- doctors ----

@admin_required
def doctor_list(request):
    doctors = Doctor.objects.all()
    return render(request, 'dashboard/doctor_list.html', {'doctors': doctors})


@admin_required
def doctor_create(request):
    if request.method == 'POST':
        form = DoctorForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Doctor profile added.')
            return redirect('dashboard:doctor_list')
    else:
        form = DoctorForm()
    return render(request, 'dashboard/doctor_form.html', {'form': form, 'title': 'Add Doctor'})


@admin_required
def doctor_edit(request, pk):
    doctor = get_object_or_404(Doctor, pk=pk)
    if request.method == 'POST':
        form = DoctorForm(request.POST, request.FILES, instance=doctor)
        if form.is_valid():
            form.save()
            messages.success(request, 'Doctor profile updated.')
            return redirect('dashboard:doctor_list')
    else:
        form = DoctorForm(instance=doctor)
    return render(request, 'dashboard/doctor_form.html', {'form': form, 'title': f'Edit {doctor.full_name}'})


@admin_required
def doctor_delete(request, pk):
    doctor = get_object_or_404(Doctor, pk=pk)
    if request.method == 'POST':
        doctor.delete()
        messages.success(request, 'Doctor profile removed.')
        return redirect('dashboard:doctor_list')
    return render(request, 'dashboard/doctor_confirm_delete.html', {'doctor': doctor})


# ---- appointment slots ----

@admin_required
def slot_list(request):
    slots = AppointmentSlot.objects.select_related('doctor').all()
    doctor_id = request.GET.get('doctor')
    if doctor_id:
        slots = slots.filter(doctor_id=doctor_id)
    return render(request, 'dashboard/slot_list.html', {
        'slots': slots,
        'doctors': Doctor.objects.all(),
        'selected_doctor': doctor_id,
    })


@admin_required
def slot_create(request):
    if request.method == 'POST':
        form = AppointmentSlotForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Appointment slot created.')
                return redirect('dashboard:slot_list')
            except Exception:
                messages.error(request, 'That slot already exists for this doctor at this date/time.')
    else:
        form = AppointmentSlotForm()
    return render(request, 'dashboard/slot_form.html', {'form': form, 'title': 'Add Appointment Slot'})


@admin_required
def slot_delete(request, pk):
    slot = get_object_or_404(AppointmentSlot, pk=pk)
    if request.method == 'POST':
        if slot.is_booked:
            messages.error(request, 'Cannot delete a booked slot. Cancel the appointment first.')
        else:
            slot.delete()
            messages.success(request, 'Slot removed.')
        return redirect('dashboard:slot_list')
    return render(request, 'dashboard/slot_confirm_delete.html', {'slot': slot})


# ---- appointments ----

@admin_required
def appointment_list(request):
    appointments = Appointment.objects.select_related('patient', 'slot', 'slot__doctor').all()
    query = request.GET.get('q')
    if query:
        appointments = appointments.filter(
            Q(patient__username__icontains=query) |
            Q(patient__first_name__icontains=query) |
            Q(patient__last_name__icontains=query) |
            Q(slot__doctor__first_name__icontains=query) |
            Q(slot__doctor__last_name__icontains=query)
        )
    return render(request, 'dashboard/appointment_list.html', {'appointments': appointments, 'query': query or ''})


@admin_required
def appointment_cancel(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.method == 'POST':
        if appointment.status == Appointment.Status.CONFIRMED:
            appointment.cancel()
            messages.success(request, 'Appointment cancelled by administrator.')
        return redirect('dashboard:appointment_list')
    return render(request, 'dashboard/appointment_confirm_cancel.html', {'appointment': appointment})


# ---- patient accounts ----

@admin_required
def patient_list(request):
    patients = CustomUser.objects.filter(role=CustomUser.Role.PATIENT)
    return render(request, 'dashboard/patient_list.html', {'patients': patients})


@admin_required
def patient_edit(request, pk):
    patient = get_object_or_404(CustomUser, pk=pk, role=CustomUser.Role.PATIENT)
    if request.method == 'POST':
        form = PatientAccountForm(request.POST, instance=patient)
        if form.is_valid():
            form.save()
            messages.success(request, 'Patient account updated.')
            return redirect('dashboard:patient_list')
    else:
        form = PatientAccountForm(instance=patient)
    return render(request, 'dashboard/patient_form.html', {'form': form, 'patient': patient})
