# backend/conftest.py
import os
import sys
import django
from pathlib import Path

# ============= SETUP DJANGO FIRST! =============
# Dodaj backend do sys.path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Ustaw Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django PRZED jakimkolwiek importem Django/DRF!
django.setup()

# ============= TERAZ MOŻEMY IMPORTOWAĆ =============
import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.schedules.models import AvailableSlot
from apps.reservations.models import Reservation
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()


# ============= FIXTURES =============

@pytest.fixture
def api_client():
    """REST API Client"""
    return APIClient()


@pytest.fixture
def student_user(db):
    """Tworzy użytkownika studenta"""
    return User.objects.create_user(
        username='student_test',
        email='student@agh.edu.pl',
        password='TestPass123!',
        first_name='Jan',
        last_name='Kowalski',
        role='student',
        phone='+48123456789'
    )


@pytest.fixture
def lecturer_user(db):
    """Tworzy użytkownika prowadzącego"""
    return User.objects.create_user(
        username='lecturer_test',
        email='lecturer@agh.edu.pl',
        password='TestPass123!',
        first_name='Anna',
        last_name='Nowak',
        role='lecturer',
        phone='+48987654321'
    )


@pytest.fixture
def admin_user(db):
    """Tworzy użytkownika admina"""
    return User.objects.create_superuser(
        username='admin_test',
        email='admin@agh.edu.pl',
        password='AdminPass123!',
        first_name='Admin',
        last_name='AGH',
        role='admin'
    )


@pytest.fixture
def authenticated_student_client(api_client, student_user):
    """API Client zalogowany jako student"""
    api_client.force_authenticate(user=student_user)
    return api_client


@pytest.fixture
def authenticated_lecturer_client(api_client, lecturer_user):
    """API Client zalogowany jako prowadzący"""
    api_client.force_authenticate(user=lecturer_user)
    return api_client


@pytest.fixture
def authenticated_admin_client(api_client, admin_user):
    """API Client zalogowany jako admin"""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def available_slot(db, lecturer_user):
    """Tworzy dostępny slot"""
    start_time = timezone.now() + timedelta(days=2)
    end_time = start_time + timedelta(minutes=30)

    return AvailableSlot.objects.create(
        lecturer=lecturer_user,
        start_time=start_time,
        end_time=end_time,
        subject='Matematyka dyskretna',
        meeting_location='Bud. A, pok. 215',
        max_attendees=5,
        is_active=True
    )


@pytest.fixture
def pending_reservation(db, student_user, available_slot):
    """Tworzy rezerwację oczekującą"""
    return Reservation.objects.create(
        slot=available_slot,
        student=student_user,
        topic='Pytania o grafy',
        student_notes='Proszę o pomoc z zadaniem 5',
        status='pending'
    )


@pytest.fixture
def accepted_reservation(db, student_user, lecturer_user):
    """Tworzy zaakceptowaną rezerwację (na INNYM slocie)"""
    from apps.schedules.models import AvailableSlot

    # Utwórz OSOBNY slot dla accepted reservation
    accepted_slot = AvailableSlot.objects.create(
        lecturer=lecturer_user,
        start_time=timezone.now() + timedelta(days=3),  # Inny dzień niż available_slot
        end_time=timezone.now() + timedelta(days=3, minutes=30),
        subject='Matematyka - Accepted',
        meeting_location='Bud. B, pok. 300',
        max_attendees=5,
        is_active=True
    )

    reservation = Reservation.objects.create(
        slot=accepted_slot,
        student=student_user,
        topic='Konsultacje',
        status='accepted',
        accepted_at=timezone.now(),
        accepted_by=lecturer_user
    )
    return reservation


# ============= HELPERS =============

@pytest.fixture
def create_multiple_slots(db, lecturer_user):
    """Helper do tworzenia wielu slotów"""

    def _create_slots(count=5):
        slots = []
        for i in range(count):
            start_time = timezone.now() + timedelta(days=i + 1, hours=10)
            end_time = start_time + timedelta(minutes=30)

            slot = AvailableSlot.objects.create(
                lecturer=lecturer_user,
                start_time=start_time,
                end_time=end_time,
                subject=f'Przedmiot {i + 1}',
                meeting_location=f'Sala {i + 1}',
                max_attendees=5,
                is_active=True
            )
            slots.append(slot)
        return slots

    return _create_slots


@pytest.fixture
def create_multiple_reservations(db, student_user):
    """Helper do tworzenia wielu rezerwacji"""

    def _create_reservations(slots, status='pending'):
        reservations = []
        for slot in slots:
            reservation = Reservation.objects.create(
                slot=slot,
                student=student_user,
                topic='Test',
                status=status
            )
            reservations.append(reservation)
        return reservations

    return _create_reservations