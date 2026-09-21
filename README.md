# Piki Ora Medical Centre - Appointment System

Django web app for patient appointment booking and clinic administration.

## Apps
- `accounts` - custom user model (patient/admin role), registration, login
- `clinic` - patient-facing: browse doctors, book/view/edit/cancel appointments
- `dashboard` - custom admin interface (doctors, slots, appointments, patients).
  Django Admin (`/django-admin/`) is wired up for dev/testing only, per the assignment brief.

## Local setup (PyCharm)
1. Open this folder as a PyCharm project.
2. Create a virtual environment: `File > Settings > Project > Python Interpreter > Add Interpreter > venv`.
3. Open the PyCharm terminal and run:
   ```
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py shell < seed_admin.py
   python manage.py runserver
   ```
4. Visit http://127.0.0.1:8000/
   - Admin login: `admin` / `Colgate123` 
   - Register a new account to test the patient flow.
