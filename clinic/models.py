from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError


class Doctor(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='doctors/', blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text='Inactive doctors are hidden from patients.')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f'Dr. {self.first_name} {self.last_name} ({self.specialty})'

    @property
    def full_name(self):
        return f'Dr. {self.first_name} {self.last_name}'


class AppointmentSlot(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ('doctor', 'date', 'start_time')

    def __str__(self):
        return f'{self.doctor.full_name} - {self.date} {self.start_time.strftime("%H:%M")}'

    def clean(self):
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError('Start time must be before end time.')


class Appointment(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Confirmed'
        CANCELLED = 'cancelled', 'Cancelled'

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments'
    )
    slot = models.OneToOneField(AppointmentSlot, on_delete=models.CASCADE, related_name='appointment')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.CONFIRMED)
    notes = models.TextField(blank=True, help_text='Optional note from the patient about this visit.')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.patient.username} with {self.slot.doctor.full_name} on {self.slot.date}'

    def cancel(self):
        """cancel this appointment and free the slot back up for booking."""
        self.status = self.Status.CANCELLED
        self.save(update_fields=['status', 'updated_at'])
        self.slot.is_booked = False
        self.slot.save(update_fields=['is_booked'])
