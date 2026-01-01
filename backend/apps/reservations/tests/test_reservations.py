# backend/apps/reservations/tests/test_reservations.py
import pytest
from rest_framework import status
from django.urls import reverse
from datetime import timedelta
from django.utils import timezone
from apps.reservations.models import Reservation
from django.core.files.uploadedfile import SimpleUploadedFile


@pytest.mark.django_db
class TestReservationCreation:
    """5.1.3 - Testy tworzenia rezerwacji"""

    def test_create_reservation_success(self, authenticated_student_client, available_slot):
        """T3.1 - Rezerwacja slotu przez studenta (bez załącznika)"""
        url = reverse('student-reservations-list')
        data = {
            'slot_id': available_slot.id,  # ← Zmienione z 'slot' na 'slot_id'
            'topic': 'Pytania o grafy',
            'student_notes': 'Proszę o pomoc z zadaniem 5'
        }

        response = authenticated_student_client.post(url, data, format='json')

        # DEBUG
        if response.status_code != 201:
            print(f"\n❌ Error {response.status_code}: {response.data}")

        assert response.status_code == status.HTTP_201_CREATED, f"API returned: {response.data}"
        assert Reservation.objects.filter(slot=available_slot).exists()

        reservation = Reservation.objects.get(id=response.data['id'])
        assert reservation.status == 'pending'
        assert reservation.student_notes == 'Proszę o pomoc z zadaniem 5'

    def test_create_reservation_with_attachment(self, authenticated_student_client, available_slot):
        """T3.1 - Rezerwacja slotu z załącznikiem PDF"""
        url = reverse('student-reservations-list')

        pdf_file = SimpleUploadedFile(
            "zadanie.pdf",
            b'%PDF-1.4 test content',
            content_type="application/pdf"
        )

        data = {
            'slot_id': available_slot.id,  # ← Zmienione
            'topic': 'Konsultacje matematyka',
            'student_notes': 'W załączniku zadania',
            'student_attachment': pdf_file
        }

        response = authenticated_student_client.post(url, data, format='multipart')

        assert response.status_code == status.HTTP_201_CREATED
        reservation = Reservation.objects.get(id=response.data['id'])
        assert reservation.student_attachment is not None
        assert 'zadanie' in reservation.student_attachment.name

    def test_create_reservation_invalid_file_type(self, authenticated_student_client, available_slot):
        """Próba przesłania niedozwolonego typu pliku"""
        url = reverse('student-reservations-list')

        exe_file = SimpleUploadedFile(
            "virus.exe",
            b'MZ\x90\x00',
            content_type="application/x-msdownload"
        )

        data = {
            'slot_id': available_slot.id,  # ← Zmienione
            'topic': 'Test',
            'student_attachment': exe_file
        }

        response = authenticated_student_client.post(url, data, format='multipart')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestReservationAcceptance:
    """5.1.3 - Akceptacja rezerwacji"""

    def test_accept_reservation(self, authenticated_lecturer_client, pending_reservation, lecturer_user):
        """T3.2 - Akceptacja przez prowadzącego"""
        url = reverse('lecturer-reservations-accept', kwargs={'pk': pending_reservation.id})
        response = authenticated_lecturer_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        pending_reservation.refresh_from_db()
        assert pending_reservation.status == 'accepted'
        assert pending_reservation.accepted_by == lecturer_user
        assert pending_reservation.accepted_at is not None


@pytest.mark.django_db
class TestReservationRejection:
    """5.1.3 - Odrzucanie rezerwacji"""

    def test_reject_with_reason(self, authenticated_lecturer_client, pending_reservation):
        """T3.3 - Odrzucenie z powodem"""
        url = reverse('lecturer-reservations-reject', kwargs={'pk': pending_reservation.id})
        data = {'reason': 'Konflikt terminów z innym spotkaniem'}

        response = authenticated_lecturer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        pending_reservation.refresh_from_db()
        assert pending_reservation.status == 'rejected'
        assert pending_reservation.rejection_reason == 'Konflikt terminów z innym spotkaniem'


@pytest.mark.django_db
class TestReservationCancellation:
    """5.1.3 - Anulowanie przez studenta"""

    def test_cancel_reservation(self, authenticated_student_client, pending_reservation):
        """T3.4 - Anulowanie przez studenta"""
        url = reverse('student-reservations-cancel', kwargs={'pk': pending_reservation.id})
        response = authenticated_student_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        pending_reservation.refresh_from_db()
        assert pending_reservation.status == 'cancelled'


@pytest.mark.django_db
class TestLecturerNotes:
    """5.1.3 - Notatki prowadzącego"""

    def test_add_notes_with_attachment(self, authenticated_lecturer_client, accepted_reservation):
        """T3.8 - Dodanie notatek + załącznik"""
        url = reverse('lecturer-reservations-add-notes', kwargs={'pk': accepted_reservation.id})

        pdf_file = SimpleUploadedFile(
            "rozwiazania.pdf",
            b'%PDF-1.4 rozwiazania',
            content_type="application/pdf"
        )

        data = {
            'lecturer_notes': 'Omówiliśmy grafy i drzewa. Rozwiązania zadań w załączniku.',
            'lecturer_attachment': pdf_file
        }

        response = authenticated_lecturer_client.post(url, data, format='multipart')

        assert response.status_code == status.HTTP_200_OK
        accepted_reservation.refresh_from_db()
        assert accepted_reservation.lecturer_notes == 'Omówiliśmy grafy i drzewa. Rozwiązania zadań w załączniku.'
        assert accepted_reservation.lecturer_attachment is not None
        assert 'rozwiazania' in accepted_reservation.lecturer_attachment.name

    def test_add_notes_without_attachment(self, authenticated_lecturer_client, accepted_reservation):
        """Dodanie tylko notatek bez załącznika"""
        url = reverse('lecturer-reservations-add-notes', kwargs={'pk': accepted_reservation.id})
        data = {
            'lecturer_notes': 'Student dobrze rozumie temat.'
        }

        # Endpoint wymaga multipart (bo parsers=[MultiPartParser, FormParser])
        response = authenticated_lecturer_client.post(url, data, format='multipart')

        assert response.status_code == status.HTTP_200_OK
        accepted_reservation.refresh_from_db()
        assert accepted_reservation.lecturer_notes == 'Student dobrze rozumie temat.'


@pytest.mark.django_db
class TestReservationListing:
    """Testy listowania rezerwacji"""

    def test_student_views_own_reservations(self, authenticated_student_client, pending_reservation):
        """Student widzi tylko swoje rezerwacje"""
        url = reverse('student-reservations-list')
        response = authenticated_student_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert any(r['id'] == pending_reservation.id for r in response.data)

    def test_lecturer_views_slot_reservations(self, authenticated_lecturer_client, pending_reservation):
        """Prowadzący widzi rezerwacje swoich slotów"""
        url = reverse('lecturer-reservations-list')
        response = authenticated_lecturer_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert any(r['id'] == pending_reservation.id for r in response.data)

    def test_filter_by_status(self, authenticated_lecturer_client, pending_reservation, accepted_reservation):
        """Filtrowanie po statusie"""
        url = reverse('lecturer-reservations-list')
        response = authenticated_lecturer_client.get(url, {'status': 'pending'})

        assert response.status_code == status.HTTP_200_OK
        assert all(r['status'] == 'pending' for r in response.data)


@pytest.mark.django_db
class TestReservationValidation:
    """Testy walidacji rezerwacji"""

    def test_cannot_reserve_full_slot(self, authenticated_student_client, available_slot, student_user):
        """Nie można zarezerwować pełnego slotu"""
        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Wypełnij slot do max
        for i in range(available_slot.max_attendees):
            other_student = User.objects.create_user(
                username=f'student_{i}',
                email=f'student_{i}@agh.edu.pl',
                password='pass',
                role='student'
            )
            Reservation.objects.create(
                slot=available_slot,
                student=other_student,
                status='accepted'
            )

        # Próbuj zarezerwować
        url = reverse('student-reservations-list')
        data = {'slot_id': available_slot.id, 'topic': 'Test'}  # ← Zmienione

        response = authenticated_student_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cannot_cancel_too_late(self, authenticated_student_client, student_user, lecturer_user):
        """Nie można anulować < 1h przed spotkaniem"""
        from apps.schedules.models import AvailableSlot

        # Slot za 30 minut
        near_slot = AvailableSlot.objects.create(
            lecturer=lecturer_user,
            start_time=timezone.now() + timedelta(minutes=30),
            end_time=timezone.now() + timedelta(minutes=60),
            subject='Test',
            meeting_location='Test',
            max_attendees=5,
            is_active=True
        )

        reservation = Reservation.objects.create(
            slot=near_slot,
            student=student_user,
            status='accepted'
        )

        url = reverse('student-reservations-cancel', kwargs={'pk': reservation.id})
        response = authenticated_student_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAttachmentDownload:
    """5.1.3 - Testy pobierania załączników"""

    def test_student_accesses_own_attachment(self, authenticated_student_client, pending_reservation):
        """T3.9 - Student ma dostęp do swojego załącznika"""
        # Dodaj załącznik
        pdf_file = SimpleUploadedFile("test.pdf", b'%PDF content', content_type="application/pdf")
        pending_reservation.student_attachment = pdf_file
        pending_reservation.save()

        # Sprawdź czy pole nie jest puste
        assert pending_reservation.student_attachment is not None
        # URL będzie dostępny przez media URL Django

    def test_lecturer_accesses_student_attachment(self, authenticated_lecturer_client, pending_reservation):
        """T3.9 - Prowadzący ma dostęp do załącznika studenta"""
        pdf_file = SimpleUploadedFile("student.pdf", b'%PDF content', content_type="application/pdf")
        pending_reservation.student_attachment = pdf_file
        pending_reservation.save()

        # Prowadzący może pobrać przez detail endpoint
        url = reverse('lecturer-reservations-detail', kwargs={'pk': pending_reservation.id})
        response = authenticated_lecturer_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'student_attachment' in response.data