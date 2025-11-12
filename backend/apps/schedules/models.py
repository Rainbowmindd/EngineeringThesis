from django.db import models
from django.conf import settings

class AvailableSlot(models.Model):
    #relacja dla prowadzacego ktory utworzyl ten slot
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='available_slots',
    )

    #data i czas dostepnego slotu
    start_time=models.DateTimeField(
        verbose_name="Początek slotu"
    )
    end_time=models.DateTimeField(
        verbose_name="Koniec slotu"
    )

    #Szczegoly spotkania
    meeting_location=models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Miejsce spotkania (np. Budynek B5, pokój 410)"
    )

    #Rezerwacje grupowe -> narazie 1
    max_attendees= models.PositiveSmallIntegerField(
        default=1,
        verbose_name="Maksymalna liczba studentów na slot"
    )

    #czy slot jest aktywny
    is_activee=models.BooleanField(
        default=True,
        verbose_name="Czy slot jest aktywny/moze byc rezerwowany"
    )

    class Meta:
        ordering = ['start_time']
        verbose_name = "Dostępny slot"
        verbose_name_plural = "Dostępne sloty"
    def __str__(self):
        return f"Slot {self.lecturer.get_full_name()} od {self.start_time.strftime('%Y-%m-%d %H:%M')} do {self.end_time.strftime('%H:%M')} - {self.end_tim.strfgtime('%H:%M')}"