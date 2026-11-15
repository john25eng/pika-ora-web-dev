# Piki Ora Medical Centre - Appointment System

Django web app (MVT architecture) for patient appointment booking and clinic administration.

## Live demo
https://pika-ora-web-dev-mvt.onrender.com/

- Admin login: `admin` / `Colgate123`
- Register a new account on the site to test the patient flow.
- The site runs on Render's free plan, so the first load may take up to a minute.

## Apps
- `accounts` - custom user model (patient/admin role), registration, login
- `clinic` - patient-facing: browse doctors, book/view/edit/cancel appointments
- `dashboard` - custom admin interface (doctors, slots, appointments, patients).
  Django Admin (`/django-admin/`) is wired up for dev/testing only, per the assignment brief.

## Architecture (MVT)
- **Models** - `CustomUser`, `Doctor`, `AppointmentSlot`, `Appointment` (Django ORM, SQLite)
- **Views** - function and class-based views with role checks for patients and admins
- **Templates** - server-rendered HTML with role-based navigation
- Double booking is prevented when a slot is booked.

## Deployment
Deployed on Render as a Web Service from the `assessment-1-mvt-deploy` branch.
The admin account is created on each deploy from environment variables.
