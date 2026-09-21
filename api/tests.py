from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from clinic.models import Doctor, AppointmentSlot, Appointment

User = get_user_model()


def tomorrow():
    return date.today() + timedelta(days=1)


class AuthTests(APITestCase):
    def test_register_creates_patient_and_returns_token(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'newpatient', 'first_name': 'New', 'last_name': 'Patient',
            'email': 'n@example.com', 'password': 'StrongPass123', 'password2': 'StrongPass123',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', resp.data)
        self.assertEqual(resp.data['user']['role'], 'patient')

    def test_register_rejects_mismatched_passwords(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'x', 'first_name': 'A', 'last_name': 'B',
            'email': 'a@example.com', 'password': 'StrongPass123', 'password2': 'Different123',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_token(self):
        User.objects.create_user(username='bob', password='Passw0rd123', role='patient')
        resp = self.client.post('/api/auth/login/', {'username': 'bob', 'password': 'Passw0rd123'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('token', resp.data)

    def test_unauthenticated_request_is_rejected(self):
        resp = self.client.get('/api/doctors/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class RolePermissionTests(APITestCase):
    def setUp(self):
        self.patient = User.objects.create_user(username='pat', password='Passw0rd123', role='patient')
        self.admin = User.objects.create_user(username='adm', password='Passw0rd123', role='admin', is_staff=True)

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_patient_cannot_access_admin_endpoints(self):
        self.auth(self.patient)
        resp = self.client.get('/api/admin/doctors/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_access_patient_endpoints(self):
        self.auth(self.admin)
        resp = self.client.get('/api/doctors/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_doctor(self):
        self.auth(self.admin)
        resp = self.client.post('/api/admin/doctors/', {
            'first_name': 'Jane', 'last_name': 'Smith', 'specialty': 'GP',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Doctor.objects.count(), 1)


class BookingTests(APITestCase):
    def setUp(self):
        self.patient = User.objects.create_user(username='pat', password='Passw0rd123', role='patient')
        self.other_patient = User.objects.create_user(username='pat2', password='Passw0rd123', role='patient')
        self.doctor = Doctor.objects.create(first_name='Jane', last_name='Smith', specialty='GP')
        self.slot = AppointmentSlot.objects.create(
            doctor=self.doctor, date=tomorrow(), start_time=time(9, 0), end_time=time(9, 30)
        )
        self.client.force_authenticate(user=self.patient)

    def test_book_appointment_marks_slot_booked(self):
        resp = self.client.post(f'/api/book/{self.slot.id}/')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.slot.refresh_from_db()
        self.assertTrue(self.slot.is_booked)
        self.assertEqual(Appointment.objects.count(), 1)

    def test_cannot_double_book_same_slot(self):
        self.client.post(f'/api/book/{self.slot.id}/')
        self.client.force_authenticate(user=self.other_patient)
        resp = self.client.post(f'/api/book/{self.slot.id}/')
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(Appointment.objects.count(), 1)

    def test_patient_cannot_cancel_someone_elses_appointment(self):
        self.client.post(f'/api/book/{self.slot.id}/')
        appointment = Appointment.objects.first()
        self.client.force_authenticate(user=self.other_patient)
        resp = self.client.post(f'/api/appointments/{appointment.id}/cancel/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_cancel_frees_the_slot(self):
        self.client.post(f'/api/book/{self.slot.id}/')
        appointment = Appointment.objects.first()
        resp = self.client.post(f'/api/appointments/{appointment.id}/cancel/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.slot.refresh_from_db()
        self.assertFalse(self.slot.is_booked)
