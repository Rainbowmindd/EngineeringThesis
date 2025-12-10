#serializator tylko do odczytu poniewaz powiadomienia sa tworzone przez logike
# systemu a nie przez uzytkownika
#mozna tylko odcyztac albo oznaczyc jako przeczytane
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):

    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'id',
            'recipient',
            'message',
            'notification_type',
            'is_seen',
            'created_at_formatted'
        )
        read_only_fields = fields

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%d.%m.%Y %H:%M')