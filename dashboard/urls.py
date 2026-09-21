from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.home, name='home'),

    path('doctors/', views.doctor_list, name='doctor_list'),
    path('doctors/add/', views.doctor_create, name='doctor_create'),
    path('doctors/<int:pk>/edit/', views.doctor_edit, name='doctor_edit'),
    path('doctors/<int:pk>/delete/', views.doctor_delete, name='doctor_delete'),

    path('slots/', views.slot_list, name='slot_list'),
    path('slots/add/', views.slot_create, name='slot_create'),
    path('slots/<int:pk>/delete/', views.slot_delete, name='slot_delete'),

    path('appointments/', views.appointment_list, name='appointment_list'),
    path('appointments/<int:pk>/cancel/', views.appointment_cancel, name='appointment_cancel'),

    path('patients/', views.patient_list, name='patient_list'),
    path('patients/<int:pk>/edit/', views.patient_edit, name='patient_edit'),
]
