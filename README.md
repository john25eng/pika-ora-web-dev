# Piki Ora Medical Centre - Appointment System

Django web app for patient appointment booking and clinic administration.

## Apps
- `accounts` - custom user model (patient/admin role), registration, login
- `clinic` - patient-facing: browse doctors, book/view/edit/cancel appointments
- `dashboard` - custom admin interface (doctors, slots, appointments, patients).
  Django Admin (`/django-admin/`) is wired up for dev/testing only, per the
  assignment brief - it is not used as the marked interface.

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
   - Admin login: `admin` / `Colgate123` (change this immediately)
   - Register a new account to test the patient flow.

## Environment variables (.env, not committed)
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```

## Deploying to Render
1. Push this repo to GitHub.
2. On Render: New > Web Service > connect the GitHub repo.
3. Build command: `./build.sh`
4. Start command: `gunicorn piki_ora.wsgi:application`
5. Add a Render PostgreSQL database, then set env vars on the web service:
   - `SECRET_KEY` - generate a new random one
   - `DEBUG` - `False`
   - `ALLOWED_HOSTS` - your Render URL, e.g. `piki-ora.onrender.com`
   - `DATABASE_URL` - copy from the Render Postgres instance
6. Deploy. Then open the Render shell and run:
   ```
   python manage.py shell < seed_admin.py
   ```

## Notes
- Double-booking is prevented with a DB-level `unique_together` constraint plus
  `select_for_update()` inside an atomic transaction at booking time.
- Booking confirmations print to the console in dev (`EMAIL_BACKEND` = console).
  Swap in real SMTP settings via env vars for production email delivery.
