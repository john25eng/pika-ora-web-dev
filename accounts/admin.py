from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# registered for development/testing only, per assignment brief -
# this is NOT used as the marked administrator interface.
admin.site.register(CustomUser, UserAdmin)
