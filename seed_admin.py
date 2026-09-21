"""
one-off script to create the first admin account.
run with: python manage.py shell < seed_admin.py
"""
from accounts.models import CustomUser

if not CustomUser.objects.filter(username='admin').exists():
    CustomUser.objects.create_user(
        username='admin',
        password='ChangeMe123!',
        role='admin',
        first_name='Clinic',
        last_name='Admin',
        email='admin@pikiora.example.com',
        is_staff=True,
    )
    print('admin created - username: admin / password: ChangeMe123!')
else:
    print('admin already exists')
