from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    extends django's built-in user with a role field so we can
    tell patients and clinic administrators apart without touching
    is_staff / is_superuser (those stay reserved for django admin access).
    """

    class Role(models.TextChoices):
        PATIENT = 'patient', 'Patient'
        ADMIN = 'admin', 'Administrator'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)
    phone_number = models.CharField(max_length=20, blank=True)

    def is_admin_user(self):
        return self.role == self.Role.ADMIN

    def is_patient_user(self):
        return self.role == self.Role.PATIENT

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.get_role_display()})'
