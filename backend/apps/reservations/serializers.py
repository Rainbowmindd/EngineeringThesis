from rest_framework import serializers
from .models import Reservation
from apps.schedules.models import AvailableSlot
from django.utils import timezone


class SlotDetailsSerializer(serializers.ModelSerializer):
    lecturer_details = serializers.CharField(source='lecturer.get_full_name', read_only=True)
    lecturer_email = serializers.EmailField(source='lecturer.email', read_only=True)
    reservations_count = serializers.SerializerMethodField()
    accepted_reservations_count = serializers.SerializerMethodField()

    class Meta:
        model = AvailableSlot
        fields = (
            'id',
            'start_time',
            'end_time',
            'lecturer_details',
            'lecturer_email',
            'subject',
            'meeting_location',
            'max_attendees',
            'reservations_count',
            'accepted_reservations_count',  # ← NOWE
            'is_active'
        )
        read_only_fields = ('lecturer_details', 'lecturer_email')

    def get_reservations_count(self, obj):
        """Zwraca liczbę WSZYSTKICH aktywnych rezerwacji (pending + accepted)"""
        return obj.reservations.filter(
            status__in=['pending', 'accepted']
        ).count()

    def get_accepted_reservations_count(self, obj):
        """Zwraca tylko zaakceptowane rezerwacje"""
        return obj.reservations.filter(status='accepted').count()


class ReservationSerializer(serializers.ModelSerializer):
    slot = SlotDetailsSerializer(read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    slot_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = Reservation
        fields = (
            'id',
            'slot',
            'slot_id',
            'student',
            'student_name',
            'student_email',
            'topic',
            'status',
            'status_display',
            'rejection_reason',
            'booked_at',
            'updated_at',
            'accepted_at',
            'accepted_by',
        )
        read_only_fields = (
            'student',
            'status',
            'booked_at',
            'updated_at',
            'accepted_at',
            'accepted_by',
            'rejection_reason'
        )

    def create(self, validated_data):
        print("Creating reservation with data:", validated_data)

        slot_id = validated_data.pop('slot_id')

        try:
            slot = AvailableSlot.objects.get(id=slot_id)
        except AvailableSlot.DoesNotExist:
            raise serializers.ValidationError({"slot_id": "Ten slot nie istnieje."})

        if not slot.is_active:
            raise serializers.ValidationError({
                "slot_id": "Ten slot jest nieaktywny."
            })

        existing_reservation = Reservation.objects.filter(
            slot=slot,
            student=self.context['request'].user,
            status__in=['pending', 'accepted']
        ).first()

        if existing_reservation:
            raise serializers.ValidationError({
                "slot_id": f"Masz już rezerwację na ten termin (status: {existing_reservation.get_status_display()})"
            })

        reservation = Reservation.objects.create(
            slot=slot,
            student=self.context['request'].user,
            topic=validated_data.get('topic', ''),
            status='pending'  # ← Zawsze pending na starcie
        )

        print(f"Rezerwacja #{reservation.pk} utworzona ze statusem: pending")
        return reservation

    def validate_slot_id(self, value):
        try:
            slot = AvailableSlot.objects.get(id=value)
        except AvailableSlot.DoesNotExist:
            raise serializers.ValidationError("Ten slot nie istnieje.")

        if slot.start_time <= timezone.now():
            raise serializers.ValidationError(
                "Nie można rezerwować terminów z przeszłości."
            )

        return value

    def validate(self, data):

        if self.instance is None:
            slot_id = self.initial_data.get('slot_id')

            if not slot_id:
                raise serializers.ValidationError({
                    "slot_id": "Slot jest wymagany."
                })

            try:
                slot = AvailableSlot.objects.get(id=slot_id)
            except AvailableSlot.DoesNotExist:
                raise serializers.ValidationError({
                    "slot_id": "Ten slot nie istnieje."
                })

            if not slot.is_active:
                raise serializers.ValidationError({
                    "slot": "Ten slot został tymczasowo wyłączony przez prowadzącego."
                })

            active_reservations = Reservation.objects.filter(
                slot=slot,
                status__in=['pending', 'accepted']
            ).count()

            if active_reservations >= slot.max_attendees:
                raise serializers.ValidationError({
                    "slot": "Wybrany termin osiągnął maksymalną liczbę rezerwacji."
                })

        return data


class AcceptReservationSerializer(serializers.Serializer):
    pass


class RejectReservationSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text="Powód odrzucenia rezerwacji (opcjonalny)"
    )