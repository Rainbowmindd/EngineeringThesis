from rest_framework import serializers
from django.db import models
from .models import AvailableSlot,  BlockedTime, TimeWindow, ScheduleItem
from apps.reservations.models import Reservation
from apps.users.serializers import UserSerializer

class AvailableSlotSerializer(serializers.ModelSerializer):
    #read only dla wyswietlenia nazwy wykladowcy
    lecturer_details = serializers.CharField(source='lecturer.get_full_name', read_only=True)
    reservations_count=serializers.SerializerMethodField()
    class Meta:
        model = AvailableSlot
        fields=(
            'id',
            'lecturer_details',
            'start_time',
            'end_time',
            'meeting_location',
            'max_attendees',
            'reservations_count',
            'is_active',
            'subject',
        )
        read_only_fields=('lecturer','lecturer_details')

    def get_reservations_count(self, obj):
        return obj.reservations.exclude(
            status__in=['Cancelled', 'No-Show Student', 'No-Show Lecturer']
        ).count()

class AvailableSlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model=AvailableSlot
        fields=(
            'start_time',
            'end_time',
            'meeting_location',
            'max_attendees',
            'is_active',
            'subject',
        )
class BlockedTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedTime
        start_time = serializers.TimeField(format='%H:%M', input_formats=['%H:%M', '%H:%M:%S'])
        end_time = serializers.TimeField(format='%H:%M', input_formats=['%H:%M', '%H:%M:%S'])
        fields = (
            'id',
            'date',
            'start_time',
            'end_time',
            'reason'
        )
        read_only_fields=['id'
        ]

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Godzina końcowa musi być późniejsza niż początkowa")
        return data

class BlockedTimeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedTime
        fields = (
            'id',
            'start_time',
            'end_time',
            'reason'
        )


class TimeWindowSerializer(serializers.ModelSerializer):
    """
    Serializer dla TimeWindow - cykliczne okresy dostępności
    """

    class Meta:
        model = TimeWindow
        fields = [
            'id',
            'lecturer',  # read-only, automatycznie przypisywany
            'day',
            'start_time',
            'end_time',
            'max_attendees',
            'meeting_location',
            'subject',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'lecturer', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Walidacja:
        - start_time musi być wcześniej niż end_time
        - day musi być prawidłowym dniem tygodnia
        """
        if 'start_time' in data and 'end_time' in data:
            # Jeśli to są stringi w formacie datetime
            start = data['start_time']
            end = data['end_time']

            # Dla datetime obiektów
            if hasattr(start, 'time') and hasattr(end, 'time'):
                if start.time() >= end.time():
                    raise serializers.ValidationError(
                        "Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia.")
            # Dla stringów czasu
            elif isinstance(start, str) and isinstance(end, str):
                if start >= end:
                    raise serializers.ValidationError(
                        "Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia.")

        # Walidacja dnia tygodnia
        valid_days = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
        if 'day' in data and data['day'] not in valid_days:
            raise serializers.ValidationError(f"Nieprawidłowy dzień tygodnia. Dozwolone: {', '.join(valid_days)}")

        return data
class ScheduleItemSerializer(serializers.ModelSerializer):
    """
    Serializer for ScheduleItem model
    """
    class Meta:
        model = ScheduleItem
        fields = [
            'id',
            'subject',
            'day',
            'time',
            'location',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_time(self, value):
        """
        Validate time format (should be like '10:00-12:00')
        """
        if '-' not in value:
            raise serializers.ValidationError(
                "Time should be in format 'HH:MM-HH:MM'"
            )
        return value


class ScheduleItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating schedule items
    """
    class Meta:
        model = ScheduleItem
        fields = ['subject', 'day', 'time', 'location']

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user  # ← Zmień user na student
        return super().create(validated_data)