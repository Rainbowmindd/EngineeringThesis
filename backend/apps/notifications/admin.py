from django.contrib import admin
from .models import Notification

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'is_seen', 'created_at', 'message_snippet')
    list_filter = ('notification_type', 'is_seen', 'created_at')
    search_fields = ('recipient__username', 'message')
    readonly_fields = ('created_at',)

    #skrot wiadomosci
    @admin.display(description='Tresc (skrot)')
    def message_snippet(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message

admin.site.register(Notification, NotificationAdmin)

