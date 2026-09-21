from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'api'

router = DefaultRouter()
router.register('admin/doctors', views.AdminDoctorViewSet, basename='admin-doctor')
router.register('admin/slots', views.AdminAppointmentSlotViewSet, basename='admin-slot')
router.register('admin/appointments', views.AdminAppointmentViewSet, basename='admin-appointment')
router.register('admin/patients', views.AdminPatientViewSet, basename='admin-patient')

urlpatterns = [
    # auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.MeView.as_view(), name='me'),

    # patient-facing
    path('doctors/', views.PatientDoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:doctor_id>/slots/', views.PatientDoctorScheduleView.as_view(), name='doctor-schedule'),
    path('book/<int:slot_id>/', views.BookAppointmentView.as_view(), name='book-appointment'),
    path('appointments/', views.MyAppointmentsView.as_view(), name='my-appointments'),
    path('appointments/<int:pk>/', views.AppointmentNoteUpdateView.as_view(), name='appointment-update'),
    path('appointments/<int:pk>/cancel/', views.CancelAppointmentView.as_view(), name='appointment-cancel'),

    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', include(router.urls)),
]
