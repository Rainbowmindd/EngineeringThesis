from rest_framework import serializers
from django.db import models
from .models import AvailableSlot
from apps.reservations.models import Reservation
from apps.users.serializers import UserSerializer

class AvailableSlotSerializer(serializers.ModelSerializer):
    #read only dla wyswietlenia nazwy wykladowcy
    lecturer_details = serializers.CharField(source='lecturer.get_full_name', read_only=True)
    #dynamic field - obliczanie aktualnej liczby rezerwacji
    class Meta:
        model = AvailableSlot
        fields=(
            'id',
            'lecturer_details',
            'start_time',
            'end_time',
            'meeting_location',
            'max_attendees',
            'is_active',
        )
        read_only_fields=('lecturer','lecturer_details')
