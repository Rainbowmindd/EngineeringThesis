from django.urls import path
from . import views

urlpatterns = [
    # Stats
    path('stats/', views.admin_stats, name='admin-stats'),

    # Lecturers
    path('lecturers/', views.admin_lecturers_list, name='admin-lecturers-list'),
    path('lecturers/<int:pk>/', views.admin_lecturer_detail, name='admin-lecturer-detail'),
    path('lecturers/<int:pk>/toggle-status/', views.admin_lecturer_toggle_status, name='admin-lecturer-toggle'),

    # Students
    path('students/', views.admin_students_list, name='admin-students-list'),
    path('students/<int:pk>/', views.admin_student_detail, name='admin-student-detail'),
    path('students/<int:pk>/toggle-status/', views.admin_student_toggle_status, name='admin-student-toggle'),

    # Reservations
    path('reservations/', views.admin_reservations_list, name='admin-reservations-list'),
    path('reservations/<int:pk>/', views.admin_reservation_detail, name='admin-reservation-detail'),

    # System
    path('logs/', views.admin_logs, name='admin-logs'),
    path('system/health/', views.admin_system_health, name='admin-system-health'),
]
