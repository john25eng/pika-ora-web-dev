from django.urls import path
from . import views

app_name = 'clinic'

urlpatterns = [
    path('', views.redirect_after_login, name='redirect_after_login'),
    path('doctors/', views.doctor_list, name='doctor_list'),
    path('doctors/<int:doctor_id>/schedule/', views.doctor_schedule, name='doctor_schedule'),
    path('book/<int:slot_id>/', views.book_appointment, name='book_appointment'),
    path('my-appointments/', views.my_appointments, name='my_appointments'),
    path('appointments/<int:pk>/edit/', views.edit_appointment, name='edit_appointment'),
    path('appointments/<int:pk>/cancel/', views.cancel_appointment, name='cancel_appointment'),
]
