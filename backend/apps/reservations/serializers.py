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
            'accepted_reservations_count',
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

    # Załączniki - URL do pobierania
    student_attachment_url = serializers.SerializerMethodField()
    lecturer_attachment_url = serializers.SerializerMethodField()

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
            'student_notes',  # NOWE
            'student_attachment',  # NOWE
            'student_attachment_url',  # NOWE
            'lecturer_notes',  # NOWE
            'lecturer_attachment',  # NOWE
            'lecturer_attachment_url',  # NOWE
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
            'rejection_reason',
            'lecturer_notes',  # Student nie może edytować notatek prowadzącego
            'lecturer_attachment',  # Student nie może edytować załącznika prowadzącego
        )

    def get_student_attachment_url(self, obj):
        """Zwraca URL do załącznika studenta"""
        if obj.student_attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.student_attachment.url)
        return None

    def get_lecturer_attachment_url(self, obj):
        """Zwraca URL do załącznika prowadzącego"""
        if obj.lecturer_attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.lecturer_attachment.url)
        return None

    def validate_student_attachment(self, value):
        """Walidacja załącznika studenta"""
        if value:
            # Sprawdź rozmiar pliku (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Plik jest za duży. Maksymalny rozmiar: 5MB")

            # Sprawdź typ pliku
            allowed_types = ['application/pdf', 'text/plain',
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Nieprawidłowy typ pliku. Dozwolone: PDF, TXT, DOCX"
                )

        return value

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
            student_notes=validated_data.get('student_notes', ''),
            student_attachment=validated_data.get('student_attachment', None),
            status='pending'
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


class LecturerNotesSerializer(serializers.Serializer):
    """Serializer dla dodawania notatek prowadzącego"""
    lecturer_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Notatki prowadzącego po konsultacji"
    )
    lecturer_attachment = serializers.FileField(
        required=False,
        allow_null=True,
        help_text="Załącznik prowadzącego (PDF, TXT, DOCX - max 5MB)"
    )

    def validate_lecturer_attachment(self, value):
        """Walidacja załącznika prowadzącego"""
        if value:
            # Sprawdź rozmiar pliku (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Plik jest za duży. Maksymalny rozmiar: 5MB")

            # Sprawdź typ pliku
            allowed_types = ['application/pdf', 'text/plain',
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Nieprawidłowy typ pliku. Dozwolone: PDF, TXT, DOCX"
                )

        return value