from django.contrib import admin
from .models import AvailableSlot

class  AvailableSlotAdmin(admin.ModelAdmin):
    list_display = ('lecturer', 'start_time', 'end_time', 'max_attendees', 'is_active', 'is_reserved')
    list_filter = ('lecturer', 'is_active', 'start_time')
    search_fields = ('lecturer__username', 'meeting_location')
    ordering = ('start_time',)

    #czy slot ma rezerwacje
    def is_reserved(self, obj):
        return obj.reservations.exists()
    is_reserved.boolean = True
    is_reserved.short_description = 'Reserved'
admin.site.register(AvailableSlot, AvailableSlotAdmin)