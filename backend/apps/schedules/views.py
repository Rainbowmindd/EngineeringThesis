from rest_framework import viewsets, permissions
from django.utils import timezone
from ..reservations.models import Reservation
from ..reservations.serializers import ReservationSerializer
from rest_framework.response import Response
from .models import AvailableSlot, BlockedTime, TimeWindow, ScheduleItem
from .serializers import AvailableSlotSerializer, ScheduleItemSerializer,BlockedTimeSerializer, ScheduleItemCreateSerializer, AvailableSlotCreateSerializer,TimeWindowSerializer, BlockedTimeCreateSerializer
from django.http import HttpResponse
import csv
import io
from django.db import transaction
from rest_framework import status
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404


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


class TimeWindowViewSet(viewsets.ModelViewSet):
    """
    CRUD dla TimeWindow - CYKLICZNE okna dostępności (np. każdy poniedziałek 10-12)
    Używane w kalendarzu prowadzącego
    """
    serializer_class = TimeWindowSerializer
    permission_classes = [permissions.IsAuthenticated, IsLecturer]

    def get_queryset(self):
        return TimeWindow.objects.filter(
            lecturer=self.request.user,
            is_active=True
        ).order_by('day', 'start_time')

    def perform_create(self, serializer):
        serializer.save(lecturer=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Soft delete - oznacz jako nieaktywne"""
        instance = get_object_or_404(TimeWindow, id=kwargs['pk'], lecturer=request.user)
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Import wielu TimeWindows z ICS"""
        windows_data = request.data
        created = []
        for window in windows_data:
            serializer = self.get_serializer(data=window)
            if serializer.is_valid():
                serializer.save(lecturer=request.user)
                created.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(created, status=status.HTTP_201_CREATED)


class BlockedTimeViewSet(viewsets.ModelViewSet):
    """
    CRUD dla BlockedTime - jednorazowe blokady
    """
    serializer_class = BlockedTimeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BlockedTime.objects.filter(lecturer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(lecturer=self.request.user)


class ScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student schedules
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ScheduleItemSerializer

    def get_queryset(self):
        """
        Return schedule items only for the authenticated user
        """
        return ScheduleItem.objects.filter(student=self.request.user)

    def get_serializer_class(self):
        """
        Use different serializer for create/update actions
        """
        if self.action in ['create', 'update', 'partial_update']:
            return ScheduleItemCreateSerializer
        return ScheduleItemSerializer

    def perform_create(self, serializer):
        """
        Save the schedule item with the current user
        """
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Upload schedule from CSV file

        Expected CSV format:
        subject,day,time,location
        Matematyka dyskretna,Poniedziałek,10:00-12:00,Bud. A pok. 215
        """
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        csv_file = request.FILES['file']

        # Validate file extension
        if not csv_file.name.endswith('.csv'):
            return Response(
                {'error': 'File must be a CSV'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Decode the file
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)

            created_items = []
            errors = []

            with transaction.atomic():
                for row_number, row in enumerate(reader, start=2):
                    try:
                        # Validate required fields
                        required_fields = ['subject', 'day', 'time']
                        missing_fields = [
                            field for field in required_fields
                            if field not in row or not row[field].strip()
                        ]

                        if missing_fields:
                            errors.append(
                                f"Row {row_number}: Missing required fields: {', '.join(missing_fields)}"
                            )
                            continue

                        # Create schedule item
                        schedule_item = ScheduleItem.objects.create(
                            student=request.user,
                            subject=row['subject'].strip(),
                            day=row['day'].strip(),
                            time=row['time'].strip(),
                            location=row.get('location', '').strip() or None
                        )
                        created_items.append(schedule_item)

                    except Exception as e:
                        errors.append(f"Row {row_number}: {str(e)}")

            # Serialize created items
            serializer = ScheduleItemSerializer(created_items, many=True)

            response_data = {
                'message': f'Successfully imported {len(created_items)} schedule items',
                'items': serializer.data
            }

            if errors:
                response_data['errors'] = errors

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Error processing CSV file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def upload_ics(self, request):
        """
        Upload schedule from Google Calendar ICS file
        """
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ics_file = request.FILES['file']

        # Validate file extension
        if not ics_file.name.endswith('.ics'):
            return Response(
                {'error': 'File must be an ICS file'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from icalendar import Calendar
            import datetime

            # Parse ICS file
            ics_content = ics_file.read().decode('utf-8')
            cal = Calendar.from_ical(ics_content)

            created_items = []
            errors = []

            # Day mapping
            day_mapping = {
                0: 'Poniedziałek',
                1: 'Wtorek',
                2: 'Środa',
                3: 'Czwartek',
                4: 'Piątek',
                5: 'Sobota',
                6: 'Niedziela'
            }

            with transaction.atomic():
                for component in cal.walk():
                    if component.name == "VEVENT":
                        try:
                            summary = str(component.get('summary', 'Bez tytułu'))
                            dtstart = component.get('dtstart').dt
                            dtend = component.get('dtend').dt
                            location = str(component.get('location', ''))

                            # Convert to datetime if date only
                            if isinstance(dtstart, datetime.date) and not isinstance(dtstart, datetime.datetime):
                                continue  # Skip all-day events

                            # Get day and time
                            day = day_mapping.get(dtstart.weekday(), 'Poniedziałek')
                            time = f"{dtstart.strftime('%H:%M')}-{dtend.strftime('%H:%M')}"

                            # Create schedule item
                            schedule_item = ScheduleItem.objects.create(
                                student=request.user,
                                subject=summary,
                                day=day,
                                time=time,
                                location=location if location else None
                            )
                            created_items.append(schedule_item)

                        except Exception as e:
                            errors.append(f"Error processing event '{summary}': {str(e)}")
                            continue

            # Serialize created items
            serializer = ScheduleItemSerializer(created_items, many=True)

            response_data = {
                'message': f'Successfully imported {len(created_items)} events from Google Calendar',
                'items': serializer.data
            }

            if errors:
                response_data['errors'] = errors

            return Response(response_data, status=status.HTTP_201_CREATED)

        except ImportError:
            return Response(
                {'error': 'icalendar library not installed. Run: pip install icalendar'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'error': f'Error processing ICS file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )