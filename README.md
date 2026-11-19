# Piki Ora Medical Centre - Appointment System

A full-stack clinic appointment system. Patients register, browse doctors and book, reschedule or cancel appointments. Administrators manage doctors, slots, appointments and patient accounts from a dashboard built into the React app (the built-in Django Admin is not used as the dashboard).

- **Frontend (React):** https://pika-ora-web-dev-1.onrender.com
- **Backend (Django REST Framework API):** https://pika-ora-web-dev.onrender.com/api/

Login credentials for the demo admin account are supplied with the submission.

## Project stages

- **Assessment 1 - Django MVT (server-rendered templates):** branch `assessment-1-mvt-deploy`
  https://github.com/john25eng/pika-ora-web-dev/tree/assessment-1-mvt-deploy
- **Assessment 2 - Django REST Framework API + React frontend:** this branch (`main`)

Assessment 2 extends and refactors the Assessment 1 system: the server-rendered pages were replaced by REST API endpoints that a React user interface consumes.

## Architecture

```
React (Create React App, Axios, React Router)  --HTTPS + token-->  Django REST Framework API  -->  PostgreSQL
   Render Static Site                                                 Render Web Service            Neon
```

- The React app talks to the API only through Axios (`frontend/src/api/`).
- Authentication uses DRF token authentication. The token is stored in `localStorage` and sent as `Authorization: Token <key>`.
- Two roles, `patient` and `admin`, are enforced on the server by custom permission classes (`api/permissions.py`) and in the UI by protected routes.
- Doctors are profiles managed by the admin. They do not log in.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, Django 6, Django REST Framework, django-cors-headers, WhiteNoise, Gunicorn |
| Frontend | React 18 (JavaScript), Create React App, React Router 6, Axios, Bootstrap 5 |
| Database | PostgreSQL on Neon in production (`DATABASE_URL`), SQLite locally |
| Hosting | Render (Web Service + Static Site) |

## Features

**Patients**
- Register and log in
- View doctors and their open appointment slots
- Book an appointment (double booking is prevented)
- View their own appointments
- Edit the note on an appointment, reschedule it to another open slot, or cancel it

**Administrators** (React dashboard, `/admin`)
- Dashboard summary (doctors, confirmed appointments, patients, open slots)
- Add, edit and delete doctor profiles
- Create, filter and delete appointment slots (booked slots cannot be deleted)
- View all appointments, search them, reschedule or cancel any of them
- View and edit patient accounts, including disabling an account

## Project structure

```
accounts/    custom user model (role field) and the create_admin command
clinic/      models: Doctor, AppointmentSlot, Appointment
api/         serializers, views/viewsets, permissions and urls for the REST API
piki_ora/    Django project settings and root urls
frontend/    React app
build.sh     Render build script for the backend
Procfile     Gunicorn start command
```

**Frontend (`frontend/src`)**

```
api/          client.js (Axios instance, token and error handling), endpoints.js (all API calls)
context/      AuthContext (logged-in user and role)
hooks/        useFetch (loads data, tracks loading and error state)
components/   reusable components used to build the pages
pages/        patient pages, admin pages, login and register
```

Reusable components: `PageLayout`, `LoadState`, `AlertMessage`, `StatusBadge`, `StatCard`, `DoctorCard`, `SlotItem`, `AppointmentCard`, `RescheduleForm`, `DoctorForm`, `SlotForm`, `Navbar` and `ProtectedRoute`.

## API endpoints

All endpoints are under `/api/`. Everything except register and login requires a token.

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `auth/register/` | public | Create a patient account, returns a token |
| POST | `auth/login/` | public | Log in, returns a token and the user |
| POST | `auth/logout/` | any user | Delete the token |
| GET | `auth/me/` | any user | Current user |
| GET | `doctors/` | patient | List active doctors |
| GET | `doctors/<id>/slots/` | patient | Open, upcoming slots for a doctor |
| POST | `book/<slot_id>/` | patient | Book a slot |
| GET | `appointments/` | patient | My appointments |
| PATCH | `appointments/<id>/` | patient | Edit the note on my appointment |
| POST | `appointments/<id>/reschedule/` | patient | Move to another open slot (`{"slot_id": 5}`) |
| POST | `appointments/<id>/cancel/` | patient | Cancel my appointment |
| GET | `admin/dashboard/` | admin | Summary counts |
| GET, POST, PATCH, DELETE | `admin/doctors/` | admin | Doctor CRUD |
| GET, POST, PATCH, DELETE | `admin/slots/` | admin | Slot management (`?doctor=<id>` filter) |
| GET | `admin/appointments/` | admin | All appointments (`?q=` search) |
| POST | `admin/appointments/<id>/cancel/` | admin | Cancel any appointment |
| POST | `admin/appointments/<id>/reschedule/` | admin | Reschedule any appointment |
| GET, PATCH | `admin/patients/` | admin | View and edit patient accounts |

Error handling: `400` validation error, `401` missing or invalid token, `403` wrong role, `404` not found, `409` slot already booked.

## Running locally

Requires Python 3.12+ and Node 20+.

**Backend** (from the project root, PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate

# create the admin account (the command reads real environment variables)
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="choose-a-password"
python manage.py create_admin

python manage.py runserver
```

The API runs at http://127.0.0.1:8000/api/. Without `DATABASE_URL` it uses a local SQLite file.

**Frontend** (second terminal):

```powershell
cd frontend
npm install
copy .env.example .env
npm start
```

The app runs at http://localhost:5173 (the port is set in `frontend/.env.development`). The default CORS settings allow this address.

## Environment variables

**Backend**

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` locally, `False` in production |
| `ALLOWED_HOSTS` | Comma-separated hosts, e.g. the Render backend hostname |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins allowed to call the API |
| `DATABASE_URL` | PostgreSQL connection URL (Neon in production). Without it the app uses SQLite |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` | Used by `create_admin`, which runs on every deploy |

See `.env.example` for a template. Real `.env` files are never committed.

**Frontend**

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Base URL of the API, e.g. `https://pika-ora-web-dev.onrender.com/api` |

## Deployment on Render

**Backend, Web Service**
- Build command: `./build.sh` (installs packages, collects static files, migrates, creates the admin)
- Start command: `gunicorn piki_ora.wsgi:application`
- Environment: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (the frontend URL), `DATABASE_URL` (Neon PostgreSQL), `ADMIN_USERNAME`, `ADMIN_PASSWORD`

**Frontend, Static Site**
- Root directory: `frontend`
- Build command: `npm install && CI=false npm run build`
- Publish directory: `build`
- Environment: `REACT_APP_API_URL` (the backend URL plus `/api`)
- Rewrite rule `/*` to `/index.html` so React Router pages still load when refreshed

Render redeploys on every push to `main`.

## Design notes

- **Double booking:** booking and rescheduling run inside a database transaction using `select_for_update()` on the slot, and the model enforces one confirmed appointment per slot. A second attempt returns `409`.
- **Cancelled appointments** are kept as history, and their slot becomes bookable again.
- **Role-based access** is enforced on the server, so hiding a button in the UI is never the only protection.
- **Admin accounts** cannot be created through public registration. They are provisioned by the `create_admin` command.
- **Persistent data:** Render's free web services reset their local disk whenever they restart, so production uses an external PostgreSQL database on Neon instead of SQLite.
- **Reusable components:** pages are built from small shared components (cards, forms, alerts, loading and error states) and one `useFetch` hook, so loading, error and retry behaviour is the same on every screen.

## Testing the API

A Postman collection covering every endpoint, including permission checks, is submitted with the project. Import it, set the `admin_password` collection variable, and run it with the Collection Runner. It creates its own test data and cleans up after itself.

The API calls in `frontend/src/api/endpoints.js` follow the Axios code snippets that Postman generates for the same requests. Each function keeps the method, path and body of the Postman snippet, while the base URL and the token header come from the shared Axios client in `client.js`.