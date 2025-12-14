from rest_framework import viewsets, permissions
from django.utils import timezone
from ..reservations.models import Reservation
from ..reservations.serializers import ReservationSerializer
from rest_framework.response import Response
from .models import AvailableSlot, BlockedTime
from .serializers import AvailableSlotSerializer, BlockedTimeSerializer, AvailableSlotCreateSerializer, BlockedTimeCreateSerializer
from django.http import HttpResponse
import csv
import io
from django.db import transaction
from rest_framework import status
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.views import APIView

from apps.users.permissions import IsLecturer, IsStudent

class LecturerSlotViewSet(viewsets.ModelViewSet):

    serializer_class = AvailableSlotSerializer
    permission_classes = [permissions.IsAuthenticated,IsLecturer]

    def get_queryset(self):
        #Prowadzacy widzi tylko swoje sloty
        return AvailableSlot.objects.filter(lecturer=self.request.user).order_by('start_time')

    def perform_create(self, serializer):
        #Podczas tworzenia nowego terminu, automatycznie przypisz prowadzacego
        serializer.save(lecturer=self.request.user)

    #soft-delete
    @action(detail=True, methods=['post'])
    def deactivate(self,request,pk=None):
        slot=self.get_object()
        slot.is_active=False
        slot.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PublicAvailableSlotViewSet(viewsets.ReadOnlyModelViewSet):
    #dostep do publicznych slotow dla studentow i nie zalogowanych uzytkownikow
    serializer_class = AvailableSlotSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        #Student widzi aktywne sloty w przyszlosci
        queryset = AvailableSlot.objects.filter(
            #aktywny
            is_active=True,
            #w przyszlosci
            start_time__gte=timezone.now(),
        ).select_related('lecturer').order_by('start_time')

        #Filtrowanie dla studentow zeby znalezc konkretnego prowadzacego
        lecturer_id = self.request.query_params.get('lecturer_id')
        if lecturer_id:
            #tylko sloty danego prowadzacego
            queryset =queryset.filter(lecturer__id=lecturer_id)
        return queryset


class LecturerCalendarViewSet(viewsets.ViewSet):
    """
    Zarządza danymi kalendarza prowadzącego za pomocą niestandardowych akcji.
    Bazowy URL: /api/schedules/calendar/
    """
    permission_classes = [permissions.IsAuthenticated, IsLecturer]

    @action(detail=False, methods=['get', 'post'], url_path='time-windows')
    def time_windows(self, request):
        user = request.user

        # --- GET (fetchTimeWindows) ---
        if request.method == 'GET':
            time_windows = AvailableSlot.objects.filter(lecturer=user, is_active=True).order_by('start_time')
            serializer = AvailableSlotSerializer(time_windows, many=True)
            return Response(serializer.data)

        # --- POST (addTimeWindow) ---
        elif request.method == 'POST':
            # Używamy dedykowanego serializer'a do tworzenia
            serializer = AvailableSlotCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                # Automatyczne przypisanie prowadzącego
                serializer.save(lecturer=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # ************************************************************
    # AKCJE DLA ZABLOKOWANYCH OKRESÓW (BLOCKED TIMES)
    # Endpoint: /api/schedules/calendar/blocked-times/
    # ************************************************************

    @action(detail=False, methods=['get', 'post'], url_path='blocked-times')
    def blocked_times(self, request):
        user = request.user

        # --- GET (fetchBlockedTimes) ---
        if request.method == 'GET':
            blocked_times = BlockedTime.objects.filter(lecturer=user).order_by('date', 'start_time')
            serializer = BlockedTimeSerializer(blocked_times, many=True)
            return Response(serializer.data)

        # --- POST (addBlockedTime) ---
        elif request.method == 'POST':
            serializer = BlockedTimeCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(lecturer=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=['get'], url_path='reservations')
    def reservations(self, request):
        user = request.user
        # Filtrujemy rezerwacje powiązane ze slotami tego prowadzącego
        reservations = Reservation.objects.filter(slot__lecturer=user).order_by('date', 'time')

        # Używamy zaimportowanego ReservationSerializer
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)


class ScheduleExportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsLecturer]

    def get(self, request, *args, **kwargs):
        """Eksportuje okna dostępności i zablokowane okresy do pliku CSV."""

        # 1. Pobieranie danych dla zalogowanego prowadzącego
        user = request.user
        time_windows = AvailableSlot.objects.filter(lecturer=user)
        blocked_times = BlockedTime.objects.filter(lecturer=user)

        # 2. Tworzenie odpowiedzi HTTP z nagłówkami
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="harmonogram_agh_{}.csv"'.format(user.username)

        writer = csv.writer(response, delimiter=';')  # Użycie średnika ułatwia obsługę polskiego CSV

        # Nagłówek dla Okien Dostępności
        writer.writerow(['TYP', 'DZIEŃ', 'GODZINA_START', 'GODZINA_KONIEC', 'POJEMNOSC', 'POWTAZALNE'])

        # 3. Zapis Okien Dostępności
        for tw in time_windows:
            writer.writerow([
                'DOSTEPNOSC',
                tw.day,
                tw.start_time.strftime("%H:%M"),
                tw.end_time.strftime("%H:%M"),
                tw.capacity,
                'TAK' if tw.is_recurring else 'NIE'
            ])

        # Pusta linia dla separacji
        writer.writerow([])

        # Nagłówek dla Zablokowanych Okresów
        writer.writerow(['TYP', 'DATA', 'GODZINA_START', 'GODZINA_KONIEC', 'POWOD'])

        # 4. Zapis Zablokowanych Okresów
        for bt in blocked_times:
            writer.writerow([
                'BLOKADA',
                bt.date.strftime("%Y-%m-%d"),
                bt.start_time.strftime("%H:%M"),
                bt.end_time.strftime("%H:%M"),
                bt.reason
            ])

        return response


# --- 2. WIDOK IMPORTU (POST) ---
# Endpoint: /api/schedules/import/
class ScheduleImportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsLecturer]

    def post(self, request, *args, **kwargs):
        """Importuje dane z pliku CSV."""

        if 'file' not in request.FILES:
            return Response({"error": "Brak pliku 'file' w żądaniu."}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        decoded_file = csv_file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)

        # Używamy ';' jako separatora, aby dopasować się do eksportu
        reader = csv.reader(io_string, delimiter=';')
        next(reader)  # Pomiń pierwszy wiersz (nagłówek)

        imported_count = 0

        try:
            with transaction.atomic():
                for row in reader:
                    if not row or row[0].upper() not in ['DOSTEPNOSC', 'BLOKADA']:
                        continue  # Pomiń puste wiersze lub nieznany typ

                    row_type = row[0].upper()

                    if row_type == 'DOSTEPNOSC' and len(row) >= 6:
                        # [TYP, DZIEŃ, GODZINA_START, GODZINA_KONIEC, POJEMNOSC, POWTAZALNE]
                        data = {
                            'lecturer': request.user.pk,
                            'day': row[1],
                            'start_time': row[2],
                            'end_time': row[3],
                            'capacity': int(row[4]),
                            'is_recurring': row[5].upper() == 'TAK',
                            'location': 'Imported Location'  # Domyślna lokalizacja dla importowanych slotów
                        }
                        serializer = AvailableSlotSerializer(data=data)
                        if serializer.is_valid(raise_exception=True):
                            serializer.save(lecturer=request.user)
                            imported_count += 1

                    elif row_type == 'BLOKADA' and len(row) >= 5:
                        # [TYP, DATA, GODZINA_START, GODZINA_KONIEC, POWOD]
                        data = {
                            'lecturer': request.user.pk,
                            'date': row[1],
                            'start_time': row[2],
                            'end_time': row[3],
                            'reason': row[4],
                        }
                        serializer = BlockedTimeSerializer(data=data)
                        if serializer.is_valid(raise_exception=True):
                            serializer.save(lecturer=request.user)
                            imported_count += 1

        except Exception as e:
            return Response({"error": f"Błąd przetwarzania pliku CSV: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": f"Pomyślnie zaimportowano {imported_count} pozycji."},
                        status=status.HTTP_201_CREATED)

