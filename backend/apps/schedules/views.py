from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import AvailableSlot
from .serializers import AvailableSlotSerializer

from apps.users.permissions import IsLecturer, IsStudent

class LecturerSlotViewSet(viewsets.ModelViewSet):

    serializer_class = AvailableSlotSerializer
    permission_classes = [IsLecturer]

    def get_queryset(self):
        #Prowadzacy widzi tylko swoje sloty
        return AvailableSlot.objects.filter(lecturer=self.request.user).order_by('start_time')

    def perform_create(self, serializer):
        #Podczas tworzenia nowego terminu, automatycznie przypisz prowadzacego
        serializer.save(lecturer=self.request.user)

class PublicAvailableSlotViewSet(viewsets.ReadOnlyModelViewSet):
    #dostep do publicznych slotow dla studentow i nie zalogowanych uzytkownikow
    serializer_class = AvailableSlotSerializer
    permission_classes = [IsStudent]

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