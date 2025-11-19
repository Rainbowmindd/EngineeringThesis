from rest_framework import serializers
from .models import Reservation
from apps.schedules.models import AvailableSlot
from django.utils import timezone

class ReservationSerializer(serializers.ModelSerializer):
    #informacje o slocie w odp GET
    slot_details = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ('id','slot', 'student', 'topic', 'status', 'booked_at', 'slot_details')
        read_only_fields=('student', 'status', 'booked_at')

    def create(self, validated_data):
        validated_data['status']='Pending' #domyslny status nowej rezerwacji
        reservation=Reservation.objects.create(**validated_data)
        return reservation


    def get_slot_details(self, obj):
        return{
            'start_time': obj.slot.start_time,
            'lecturer': obj.slot.lecturer.get_full_name()
        }

    #glowna waldacja dla NOWEJ rezerwacji (POST)
    def validate(self,data):
        slot=data.get('slot')

        #sprawdz czy slot/termin jest w przyszlosci
        if slot.start_time<=timezone.now():
            raise serializers.ValidationError("Nie można rezerwować terminów z przeszłości")

        #sprawdz czy termin jest aktywny
        if not slot.is_active:
            raise serializers.ValidationError("Ten slot został tymczasowo wyłączony przez prowadzącego.")

        #sprawdz czy slot nie jest pelny
        confirmed_reservations = Reservation.objects.filter(
            slot=slot,
            status='Confirmed'
        ).count()

        if confirmed_reservations >=slot.max_attendees:
            raise serializers.ValidationError("Wybrany termin osiągną maksymalną liczbę rezerwacji.")

        return data
