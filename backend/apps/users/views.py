from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer, AdminUserSerializer, AdminReservationSerializer
import logging
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from datetime import timedelta
from apps.reservations.models import Reservation
from apps.schedules.models import AvailableSlot
import json

from ..reservations.serializers import ReservationSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.info(f"Raw request body: {request.body}")
        logger.info(f"Request data type: {type(request.data)}")
        logger.info(f"Request data: {request.data}")

        email = request.data.get("email")
        password = request.data.get("password")

        logger.info(f"Email extracted: {email}")
        logger.info(f"Password extracted: {password}")

        if not email or not password:
            logger.warning("Email or password missing")
            return Response(
                {"detail": "Email and password are required."},
                status=HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            logger.info(f"User found: {user.username}")
        except User.DoesNotExist:
            logger.warning(f"User with email {email} not found")
            return Response(
                {"detail": "Invalid email or password."},
                status=HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=user.username, password=password)

        if user is None:
            logger.warning(f"Authentication failed")
            return Response(
                {"detail": "Invalid email or password."},
                status=HTTP_400_BAD_REQUEST,
            )

        logger.info(f"User authenticated: {user.username}")

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            },
        })


class IsAdmin(IsAdminUser):
    """Tylko administratorzy"""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


# =========================
# STATS
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_stats(request):
    """Statystyki systemu"""
    now = timezone.now()
    last_month = now - timedelta(days=30)

    active_users = User.objects.filter(is_active=True).count()
    total_lecturers = User.objects.filter(role='lecturer', is_active=True).count()
    total_reservations = Reservation.objects.count()

    # Średnia ocena (TODO: implement rating system)
    average_rating = 4.8

    return Response({
        'active_users': active_users,
        'total_lecturers': total_lecturers,
        'total_reservations': total_reservations,
        'average_rating': average_rating
    })


# =========================
# LECTURERS MANAGEMENT
# =========================
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def admin_lecturers_list(request):
    """Lista wykładowców / Dodaj wykładowcę"""
    if request.method == 'GET':
        lecturers = User.objects.filter(role='lecturer').order_by('-date_joined')
        serializer = AdminUserSerializer(lecturers, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Dodaj nowego wykładowcę
        data = request.data.copy()
        data['role'] = 'lecturer'
        serializer = AdminUserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def admin_lecturer_detail(request, pk):
    """Szczegóły / Edycja / Usunięcie wykładowcy"""
    try:
        lecturer = User.objects.get(pk=pk, role='lecturer')
    except User.DoesNotExist:
        return Response({'error': 'Wykładowca nie istnieje'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminUserSerializer(lecturer)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = AdminUserSerializer(lecturer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Soft delete
        lecturer.is_active = False
        lecturer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def admin_lecturer_toggle_status(request, pk):
    """Toggle aktywności wykładowcy"""
    try:
        lecturer = User.objects.get(pk=pk, role='lecturer')
        lecturer.is_active = not lecturer.is_active
        lecturer.save()
        return Response({'is_active': lecturer.is_active})
    except User.DoesNotExist:
        return Response({'error': 'Wykładowca nie istnieje'}, status=status.HTTP_404_NOT_FOUND)


# =========================
# STUDENTS MANAGEMENT
# =========================
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def admin_students_list(request):
    """Lista studentów / Dodaj studenta"""
    if request.method == 'GET':
        students = User.objects.filter(role='student').order_by('-date_joined')
        serializer = AdminUserSerializer(students, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['role'] = 'student'
        serializer = AdminUserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def admin_student_detail(request, pk):
    """Szczegóły / Edycja / Usunięcie studenta"""
    try:
        student = User.objects.get(pk=pk, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student nie istnieje'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminUserSerializer(student)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = AdminUserSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        student.is_active = False
        student.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def admin_student_toggle_status(request, pk):
    """Toggle aktywności studenta"""
    try:
        student = User.objects.get(pk=pk, role='student')
        student.is_active = not student.is_active
        student.save()
        return Response({'is_active': student.is_active})
    except User.DoesNotExist:
        return Response({'error': 'Student nie istnieje'}, status=status.HTTP_404_NOT_FOUND)


# =========================
# RESERVATIONS MANAGEMENT
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_reservations_list(request):
    reservations = Reservation.objects.all().order_by('-booked_at')  # <-- tutaj zmiana
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def admin_reservation_detail(request, pk):
    """Szczegóły / Edycja / Usunięcie rezerwacji"""
    try:
        reservation = Reservation.objects.select_related(
            'student', 'time_window', 'time_window__lecturer'
        ).get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'error': 'Rezerwacja nie istnieje'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminReservationSerializer(reservation)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        # Zmiana statusu rezerwacji
        new_status = request.data.get('status')
        if new_status and new_status in dict(Reservation.STATUS_CHOICES):
            reservation.status = new_status
            reservation.save()
            return Response(AdminReservationSerializer(reservation).data)
        return Response({'error': 'Nieprawidłowy status'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        reservation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# =========================
# SYSTEM LOGS
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_logs(request):
    """Dziennik systemowy (mockup - zaimplementuj logowanie później)"""
    # TODO: Implement proper logging system
    logs = [
        {
            'id': 1,
            'action': 'Nowa rezerwacja',
            'user': 'Anna Kowalska',
            'timestamp': timezone.now().isoformat(),
            'status': 'success'
        },
        {
            'id': 2,
            'action': 'Edycja slotu',
            'user': 'Prof. Nowak',
            'timestamp': (timezone.now() - timedelta(minutes=25)).isoformat(),
            'status': 'success'
        }
    ]
    return Response(logs)


# =========================
# SYSTEM HEALTH
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_system_health(request):
    """Status systemu"""
    return Response({
        'uptime': 99.9,
        'response_time': 142,
        'active_connections': User.objects.filter(
            is_active=True,
            last_login__gte=timezone.now() - timedelta(hours=1)
        ).count()
    })