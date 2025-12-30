from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Q

from .models import Reservation
from .serializers import (
    ReservationSerializer,
    AcceptReservationSerializer,
    RejectReservationSerializer,
    LecturerNotesSerializer
)
from apps.users.permissions import IsLecturer, IsStudent


class StudentReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla studenta - może tworzyć, przeglądać i anulować swoje rezerwacje

    Endpoints:
    - GET /api/reservations/student/ - lista swoich rezerwacji
    - POST /api/reservations/student/ - nowa rezerwacja (status: pending) + załącznik
    - GET /api/reservations/student/{id}/ - szczegóły rezerwacji
    - PATCH /api/reservations/student/{id}/ - edytuj rezerwację (przed akceptacją)
    - DELETE /api/reservations/student/{id}/ - usuń rezerwację
    - POST /api/reservations/student/{id}/cancel/ - anuluj rezerwację
    """
    serializer_class = ReservationSerializer
    permission_classes = [IsStudent]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # WAŻNE dla upload plików

    def get_queryset(self):
        """Student widzi tylko swoje rezerwacje"""
        return Reservation.objects.filter(
            student=self.request.user
        ).select_related('slot', 'slot__lecturer', 'accepted_by')

    def perform_create(self, serializer):
        """Automatycznie przypisz studenta przy tworzeniu"""
        serializer.save(student=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        Edycja rezerwacji przez studenta
        Można edytować tylko rezerwacje ze statusem 'pending'
        """
        reservation = self.get_object()

        # Sprawdź czy można edytować
        if reservation.status != 'pending':
            return Response(
                {"detail": "Można edytować tylko oczekujące rezerwacje."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Edycja
        serializer = self.get_serializer(reservation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Anulowanie rezerwacji przez studenta
        Można anulować tylko rezerwacje ze statusem 'pending' lub 'accepted'
        """
        reservation = self.get_object()

        # Sprawdź uprawnienia
        if reservation.student != request.user:
            return Response(
                {"detail": "Nie masz uprawnień do anulowania tej rezerwacji."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Sprawdź czy można anulować
        if not reservation.can_be_cancelled():
            return Response(
                {
                    "detail": f"Nie można anulować rezerwacji o statusie: {reservation.get_status_display()}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Sprawdź czy nie jest za późno (np. 1h przed spotkaniem)
        if reservation.slot.start_time - timezone.now() < timezone.timedelta(hours=1):
            return Response(
                {"detail": "Nie można anulować rezerwacji na mniej niż 1 godzinę przed spotkaniem."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Anuluj rezerwację
        reservation.status = 'cancelled'
        reservation.save()

        # Wyślij powiadomienie do prowadzącego
        from .tasks import notify_lecturer_cancellation
        notify_lecturer_cancellation.delay(reservation.pk)

        return Response(
            {
                "status": "success",
                "message": "Rezerwacja została anulowana.",
                "reservation": ReservationSerializer(reservation, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )


class LecturerReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla prowadzącego - może przeglądać rezerwacje swoich slotów i zarządzać nimi

    Endpoints:
    - GET /api/reservations/lecturer/ - lista rezerwacji swoich slotów
    - GET /api/reservations/lecturer/{id}/ - szczegóły rezerwacji
    - POST /api/reservations/lecturer/{id}/accept/ - zaakceptuj rezerwację
    - POST /api/reservations/lecturer/{id}/reject/ - odrzuć rezerwację
    - POST /api/reservations/lecturer/{id}/add_notes/ - dodaj notatki po spotkaniu + załącznik
    - POST /api/reservations/lecturer/{id}/update_status/ - zmień status (completed, no-show, etc.)
    - GET /api/reservations/lecturer/statistics/ - statystyki
    """
    serializer_class = ReservationSerializer
    permission_classes = [IsLecturer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # WAŻNE dla upload plików
    http_method_names = ['get', 'post', 'head', 'options']  # Tylko GET i POST

    def get_queryset(self):
        """Prowadzący widzi rezerwacje tylko swoich slotów"""
        queryset = Reservation.objects.filter(
            slot__lecturer=self.request.user
        ).select_related('slot', 'student', 'accepted_by')

        # Filtrowanie po statusie przez query params
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    @action(detail=True, methods=['post'], serializer_class=AcceptReservationSerializer)
    def accept(self, request, pk=None):
        """
        Akceptacja rezerwacji przez prowadzącego

        Body: {} (puste)
        """
        reservation = self.get_object()

        # Sprawdź uprawnienia
        if reservation.slot.lecturer != request.user:
            return Response(
                {"detail": "Nie masz uprawnień do akceptacji tej rezerwacji."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Sprawdź czy można zaakceptować
        if not reservation.can_be_accepted():
            return Response(
                {
                    "detail": f"Nie można zaakceptować rezerwacji o statusie: {reservation.get_status_display()}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Sprawdź czy nie przekroczymy limitu miejsc
        accepted_count = Reservation.objects.filter(
            slot=reservation.slot,
            status='accepted'
        ).count()

        if accepted_count >= reservation.slot.max_attendees:
            return Response(
                {"detail": "Osiągnięto maksymalną liczbę zaakceptowanych rezerwacji dla tego slotu."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Zaakceptuj rezerwację
        reservation.status = 'accepted'
        reservation.accepted_at = timezone.now()
        reservation.accepted_by = request.user
        reservation.save()

        return Response(
            {
                "status": "success",
                "message": "Rezerwacja została zaakceptowana.",
                "reservation": ReservationSerializer(reservation, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], serializer_class=RejectReservationSerializer)
    def reject(self, request, pk=None):
        """
        Odrzucenie rezerwacji przez prowadzącego

        Body: {
            "reason": "opcjonalny powód odrzucenia"
        }
        """
        reservation = self.get_object()

        # Sprawdź uprawnienia
        if reservation.slot.lecturer != request.user:
            return Response(
                {"detail": "Nie masz uprawnień do odrzucenia tej rezerwacji."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Sprawdź czy można odrzucić
        if not reservation.can_be_rejected():
            return Response(
                {
                    "detail": f"Nie można odrzucić rezerwacji o statusie: {reservation.get_status_display()}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Pobierz powód odrzucenia
        serializer = RejectReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data.get('reason', 'Brak podanego powodu')

        # Odrzuć rezerwację
        reservation.status = 'rejected'
        reservation.rejection_reason = reason
        reservation.save()

        return Response(
            {
                "status": "success",
                "message": "Rezerwacja została odrzucona.",
                "reservation": ReservationSerializer(reservation, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], serializer_class=LecturerNotesSerializer,
            parser_classes=[MultiPartParser, FormParser])
    def add_notes(self, request, pk=None):
        """
        Dodawanie/edycja notatek prowadzącego po konsultacji

        Body (multipart/form-data):
        {
            "lecturer_notes": "Notatki...",
            "lecturer_attachment": <file>  (opcjonalnie)
        }
        """
        reservation = self.get_object()

        # Sprawdź uprawnienia
        if reservation.slot.lecturer != request.user:
            return Response(
                {"detail": "Nie masz uprawnień do dodawania notatek do tej rezerwacji."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Można dodawać notatki tylko do zaakceptowanych i zakończonych rezerwacji
        if reservation.status not in ['accepted', 'completed']:
            return Response(
                {"detail": "Można dodawać notatki tylko do zaakceptowanych lub zakończonych rezerwacji."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Walidacja danych
        serializer = LecturerNotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Zapisz notatki i załącznik
        if 'lecturer_notes' in serializer.validated_data:
            reservation.lecturer_notes = serializer.validated_data['lecturer_notes']

        if 'lecturer_attachment' in serializer.validated_data:
            # Usuń stary załącznik jeśli istnieje
            if reservation.lecturer_attachment:
                reservation.lecturer_attachment.delete(save=False)
            reservation.lecturer_attachment = serializer.validated_data['lecturer_attachment']

        reservation.save()

        return Response(
            {
                "status": "success",
                "message": "Notatki zostały zapisane.",
                "reservation": ReservationSerializer(reservation, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Zmiana statusu rezerwacji (np. completed, no_show_student, no_show_lecturer)
        Używane TYLKO dla zaakceptowanych rezerwacji po zakończeniu spotkania

        Body: {
            "status": "completed" | "no_show_student" | "no_show_lecturer"
        }
        """
        reservation = self.get_object()
        new_status = request.data.get('status')

        # Sprawdź uprawnienia
        if reservation.slot.lecturer != request.user:
            return Response(
                {"detail": "Nie masz uprawnień do zmiany tej rezerwacji."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Walidacja statusu
        allowed_statuses = ['completed', 'no_show_student', 'no_show_lecturer']
        if not new_status or new_status not in allowed_statuses:
            return Response(
                {
                    "detail": f"Nieprawidłowy status. Dozwolone: {', '.join(allowed_statuses)}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Można zmieniać status tylko zaakceptowanych rezerwacji
        if reservation.status != 'accepted':
            return Response(
                {
                    "detail": "Można zmienić status tylko zaakceptowanych rezerwacji."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Można oznaczać jako completed/no-show tylko po czasie spotkania
        if reservation.slot.end_time > timezone.now():
            return Response(
                {"detail": "Nie można zmienić statusu przed zakończeniem spotkania."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Zmień status
        reservation.status = new_status
        reservation.save()

        return Response(
            {
                "status": "success",
                "message": f"Status rezerwacji zmieniony na: {reservation.get_status_display()}",
                "reservation": ReservationSerializer(reservation, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Statystyki rezerwacji dla prowadzącego

        GET /api/reservations/lecturer/statistics/
        """
        reservations = self.get_queryset()

        stats = {
            'total': reservations.count(),
            'pending': reservations.filter(status='pending').count(),
            'accepted': reservations.filter(status='accepted').count(),
            'rejected': reservations.filter(status='rejected').count(),
            'cancelled': reservations.filter(status='cancelled').count(),
            'completed': reservations.filter(status='completed').count(),
            'no_show_student': reservations.filter(status='no_show_student').count(),
            'no_show_lecturer': reservations.filter(status='no_show_lecturer').count(),
        }

        return Response(stats, status=status.HTTP_200_OK)