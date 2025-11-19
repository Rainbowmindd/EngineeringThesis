from django.contrib import admin
from .models import Reservation

class ReservationAdmin(admin.ModelAdmin):
    list_display = ('student', 'slot_detail', 'status', 'booked_at')
    list_filter = ('status', 'booked_at', 'slot__lecturer')
    search_fields = ('student__username', 'topic', 'slot__lecturer__username')
    readonly_fields = ('booked_at', 'slot_detail_readonly')
    fieldsets = (
        (None, {'fields': ('student', 'slot', 'topic', 'status')}),
        ('Informacje o czasie', {'fields': ('booked_at', 'slot_detail_readonly')}),
    )

    #wyswietlaj informacje o slocie w liscie i formularzu
    @admin.display(description='Termin i Prowadzacy')
    def slot_detail(self,obj):
        return f"{obj.slot.lecturer.get_full_name()} ({obj.slot.start_time.strftime('%Y-%m-%d %H:%M')})"

    #readonly dla formualrza edycji
    def slot_detail_readonly(self,obj):
        return self.slot_detail(obj)
    slot_detail_readonly.short_description='Szczegoly terminu'

admin.site.register(Reservation, ReservationAdmin)