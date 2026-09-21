import os
from django.core.management.base import BaseCommand
from accounts.models import CustomUser


class Command(BaseCommand):
    """
    creates (or updates) one admin account from environment variables.
    safe to run on every deploy - it won't duplicate or error if the
    account already exists. used because render's free tier has no
    shell access to run createsuperuser manually.
    """
    help = 'Creates an admin account from ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_EMAIL env vars.'

    def handle(self, *args, **options):
        username = os.environ.get('ADMIN_USERNAME')
        password = os.environ.get('ADMIN_PASSWORD')
        email = os.environ.get('ADMIN_EMAIL', '')

        if not username or not password:
            self.stdout.write(self.style.WARNING(
                'ADMIN_USERNAME / ADMIN_PASSWORD not set - skipping admin creation.'
            ))
            return

        user, created = CustomUser.objects.get_or_create(
            username=username,
            defaults={'email': email, 'role': CustomUser.Role.ADMIN, 'is_staff': True}
        )
        user.set_password(password)
        user.role = CustomUser.Role.ADMIN
        user.is_staff = True
        user.email = email
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Admin account "{username}" created.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Admin account "{username}" updated.'))