from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Reservation
from .serializers import ReservationSerializer
from apps.users.permissions import IsLecturer, IsStudent
from django.core.exceptions import PermissionDenied
from django.utils import timezone


class StudentReservationViewSet(viewsets.ModelViewSet):
    #Student moze tworzyc, przegladac, anulowac swoje rezerwacje
    #post, get , delete
    serializer_class = ReservationSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        #student widzi tylko swoje rezerwacje
        return Reservation.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()

        if reservation.student!=request.user:
            return Response({"detail":"Nie masz uprawnień do anulowania tej rezerwacji."}, status=status.HTTP_403_FORBIDDEN)

        if reservation.status in ('Completed', 'Cancelled', 'No-Show Student', 'No-Show Lecturer'):
            return Response({"detail":"Nie można anulować tej rezerwacji."}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = 'Cancelled'
        reservation.save()

        #Tu powiadomienie
        return Response({"status": "Rezerwacja anulowana."}, status=status.HTTP_200_OK)

class LecturerReservationViewSet(viewsets.ModelViewSet):
    #Prowadzacy moze przegladac rezerwacje swoich slotow i zmieniac ich status

    serializer_class = ReservationSerializer
    permission_classes = [IsLecturer]

    def get_queryset(self):
        #Prowadzacy widzi rezerwacje tylko swoich slotow
        return Reservation.objects.filter(slot__lecturer=self.request.user)

    #Metoda do zmiany statusu rezerwacji (np zakonczona / nieobecnosc)
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        reservation = self.get_object()
        new_status=request.data.get('status') #oczekujemy na completed

        if not new_status or new_status not in dict(Reservation.STATUS_CHOICES):
            return Response({"detail":"Nieprawidłowy status."}, status=status.HTTP_400_BAD_REQUEST)

        #sprawdzenie czy rezerwacja nalezy do prowadzacego
        if reservation.slot.lecturer != request.user:
            return Response({"detail":"Nie masz uprawnień do zmiany tej rezerwacji."}, status=status.HTTP_403_FORBIDDEN)

        reservation.status = new_status
        reservation.save()

        #powiadomienie
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)