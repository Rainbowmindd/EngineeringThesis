
from rest_framework import serializers
from .models import Reservation
from apps.schedules.models import AvailableSlot
from django.utils import timezone


class SlotDetailsSerializer(serializers.ModelSerializer):
    lecturer_details = serializers.CharField(source='lecturer.get_full_name', read_only=True)
    reservations_count = serializers.SerializerMethodField()

    class Meta:
        model = AvailableSlot
        fields = (
            'id',
            'start_time',
            'end_time',
            'lecturer_details',
            'subject',
            'meeting_location',
            'max_attendees',
            'reservations_count',
            'is_active'
        )
        read_only_fields = ('lecturer_details',)

    def get_reservations_count(self, obj):
        return obj.reservations.exclude(
            status__in=['Cancelled', 'No-Show Student', 'No-Show Lecturer']
        ).count()


class ReservationSerializer(serializers.ModelSerializer):
    slot = SlotDetailsSerializer(read_only=True)
    slot_id = serializers.IntegerField(write_only=True, required=True)  # ← Zmień required=True

    class Meta:
        model = Reservation
        fields = ('id', 'slot', 'slot_id', 'student', 'topic', 'status', 'booked_at')
        read_only_fields = ('student', 'status', 'booked_at')

    def create(self, validated_data):
        print("🔍 validated_data:", validated_data)  # Debug
        print("🔍 initial_data:", self.initial_data)  # Debug

        slot_id = validated_data.get('slot_id')  # ← Użyj get() zamiast pop()

        if not slot_id:
            raise serializers.ValidationError({"slot_id": "Slot jest wymagany."})

        try:
            slot = AvailableSlot.objects.get(id=slot_id)
        except AvailableSlot.DoesNotExist:
            raise serializers.ValidationError({"slot_id": "Ten slot nie istnieje."})

        # Walidacje
        if not slot.is_active:
            raise serializers.ValidationError({"slot_id": "Ten slot jest nieaktywny."})

        # Utwórz rezerwację
        reservation = Reservation.objects.create(
            slot=slot,
            student=self.context['request'].user,
            topic=validated_data.get('topic', ''),
            status='Pending'
        )

        return reservation

    def validate_slot_id(self, value):
        try:
            AvailableSlot.objects.get(id=value)
        except AvailableSlot.DoesNotExist:
            raise serializers.ValidationError("Ten slot nie istnieje.")
        return value

    def validate(self, data):
        # Tylko waliduj gdy tworzymy rezerwację (POST)
        if self.instance is None:
            slot_id = self.initial_data.get('slot_id')
            if not slot_id:
                raise serializers.ValidationError("Slot jest wymagany.")

            try:
                slot = AvailableSlot.objects.get(id=slot_id)
            except AvailableSlot.DoesNotExist:
                raise serializers.ValidationError("Ten slot nie istnieje.")

            if slot.start_time <= timezone.now():
                raise serializers.ValidationError("Nie można rezerwować terminów z przeszłości")

            if not slot.is_active:
                raise serializers.ValidationError("Ten slot został tymczasowo wyłączony przez prowadzącego.")

            confirmed_reservations = Reservation.objects.filter(
                slot=slot,
                status='Confirmed'
            ).count()

            if confirmed_reservations >= slot.max_attendees:
                raise serializers.ValidationError("Wybrany termin osiągnął maksymalną liczbę rezerwacji.")

        return data