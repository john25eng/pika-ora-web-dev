# Piki Ora Medical Centre – Appointment System

A full-stack clinic appointment system where patients can register, browse doctors, and book, reschedule, or cancel appointments. Administrators manage doctors, appointment slots, bookings, and patient accounts through a React dashboard instead of Django Admin.

- **Frontend:** https://pika-ora-web-dev-1.onrender.com
- **Backend API:** https://pika-ora-web-dev.onrender.com/api/

Demo admin login credentials are provided with the submission.

## Architecture

```text
React (Vite, Axios, React Router)
          |
     HTTPS + Token
          |
Django REST Framework API
          |
   SQLite / PostgreSQL
```

- React communicates with the API through Axios (`frontend/src/api/`).
- Authentication uses DRF tokens stored in `localStorage`.
- Patient and admin roles are enforced through backend permissions and protected frontend routes.
- Doctors are managed by administrators and do not log in.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django 6, Django REST Framework |
| Frontend | React 19, Vite, Axios, React Router, Bootstrap 5 |
| Database | SQLite / PostgreSQL |
| Hosting | Render |

## Features

**Patients**
- Register and log in.
- Browse doctors and available appointment slots.
- Book appointments without double booking.
- View, edit, reschedule, or cancel appointments.

**Administrators** (`/admin`)
- View dashboard statistics.
- Add, edit, and delete doctors.
- Create, filter, and manage appointment slots.
- Search and manage all appointments.
- View, edit, and disable patient accounts.

## Project Structure

```text
accounts/    Custom user model and admin creation
clinic/      Doctor, AppointmentSlot, Appointment models
api/         Serializers, views, permissions, and URLs
piki_ora/    Django settings and root URLs
frontend/    React application
build.sh     Render backend build script
Procfile     Gunicorn start command
```

## API Endpoints

All endpoints use `/api/`. Authentication is required except for registration and login.

| Method | Endpoint | Access |
|---|---|---|
| POST | `auth/register/` | Public |
| POST | `auth/login/` | Public |
| POST | `auth/logout/` | All users |
| GET | `auth/me/` | All users |
| GET | `doctors/` | Patient |
| GET | `doctors/<id>/slots/` | Patient |
| POST | `book/<slot_id>/` | Patient |
| GET | `appointments/` | Patient |
| PATCH | `appointments/<id>/` | Patient |
| POST | `appointments/<id>/reschedule/` | Patient |
| POST | `appointments/<id>/cancel/` | Patient |
| GET | `admin/dashboard/` | Admin |
| GET, POST, PATCH, DELETE | `admin/doctors/` | Admin |
| GET, POST, PATCH, DELETE | `admin/slots/` | Admin |
| GET | `admin/appointments/` | Admin |
| POST | `admin/appointments/<id>/cancel/` | Admin |
| POST | `admin/appointments/<id>/reschedule/` | Admin |
| GET, PATCH | `admin/patients/` | Admin |

Common error responses: `400` validation error, `401` authentication error, `403` permission denied, `404` not found, and `409` slot already booked.

## Running Locally

Requirements: Python 3.12+ and Node 20+.

**Backend (PowerShell)**

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate

$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="choose-a-password"
python manage.py create_admin

python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`

**Frontend (second terminal)**

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

## Environment Variables

**Backend**

| Variable | Purpose |
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Debug mode |
| `ALLOWED_HOSTS` | Allowed backend hosts |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend URLs |
| `DATABASE_URL` | Optional PostgreSQL connection |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` | Admin account creation |

**Frontend**

| Variable | Purpose |
| `VITE_API_URL` | Backend API URL |

See `.env.example` for configuration. Real environment files are not committed.

## Deployment on Render

**Backend (Web Service)**
- Build: `./build.sh`
- Start: `gunicorn piki_ora.wsgi: application`
- Configure the required backend environment variables.

**Frontend (Static Site)**
- Root directory: `frontend`
- Build: `npm install && npx vite build`
- Publish directory: `dist`
- Set `VITE_API_URL` to the backend API URL.
- Add rewrite rule `/*` → `/index.html`.

Both services redeploy automatically when changes are pushed to `main`.

## Design Notes

- **Double booking prevention:** Transactions and `select_for_update()` protect appointment slots during booking and rescheduling. Duplicate bookings return `409`.
- **Cancelled appointments:** Retained as history, with their slots becoming available again.
- **Security:** Backend permissions enforce role restrictions independently of frontend controls.
- **Admin accounts:** Created through the `create_admin` command, not public registration.
- **Database limitation:** SQLite on Render's free tier may lose data after redeployment. PostgreSQL is recommended for persistent storage.

## API Testing

A Postman collection covering all endpoints and permission checks is included. Set the `admin_password` collection variable and run it using Collection Runner. It creates test data and cleans up afterward.
