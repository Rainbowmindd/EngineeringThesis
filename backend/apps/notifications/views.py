from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class IsRecipient(permissions.BasePermission):
    #dostep tylko do wlasnych powiadomien
    def has_object_permission(self, request, view, obj):
        return obj.recipient == request.user

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    #odczyt i zaznaczanie jako przeczytane (wlasnych powiadomien)
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecipient]

    def get_queryset(self):
        #zwracaj powiadomienia tylko dla zalogowanego uzytkownika
        return self.queryset.filter(recipient=self.request.user)

    @action(detail=True, methods=['patch'])
    def mark_as_read(self,request, pk=None):
        #oznacz konkretne powiadomienie jako przeczytane
        notification = self.get_object()

        if not notification.is_seen:
            notification.is_seen = True
            notification.save()
            return Response({'status': 'Oznaczone jako przeczytane'}, status=status.HTTP_200_OK)

        return Response({'status': 'Już przeczytane'}, status=status.HTTP_200_OK)

