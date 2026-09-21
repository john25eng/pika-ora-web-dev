from django.contrib import admin
from .models import Doctor, AppointmentSlot, Appointment

# dev/testing only - not the marked administrator interface
admin.site.register(Doctor)
admin.site.register(AppointmentSlot)
admin.site.register(Appointment)
