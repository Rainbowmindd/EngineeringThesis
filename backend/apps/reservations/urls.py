from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentReservationViewSet, LecturerReservationViewSet

router_student = DefaultRouter()
#/api/reservations/student-reservations/
router_student.register(r'student-reservations', StudentReservationViewSet, basename='student-reservations')

router_lecturer = DefaultRouter()
router_lecturer.register(r'lecturer-reservations', LecturerReservationViewSet, basename='slots')


urlpatterns=[
    path('', include(router_student.urls)),
    path('', include(router_lecturer.urls)),
]