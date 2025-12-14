from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentReservationViewSet, LecturerReservationViewSet

router = DefaultRouter()
router.register(r'student', StudentReservationViewSet, basename='student-reservations')
router.register(r'lecturer', LecturerReservationViewSet, basename='lecturer-reservations')

urlpatterns = [
    path('', include(router.urls)),
]
