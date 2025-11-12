from django.db import models
from django.conf import settings
from apps.schedules.models import AvailableSlot

class Reservation(models.Model):
    #Statusy rezerwacji
    STATUS_CHOICES = [
        ('Pending', 'Oczekująca'),
        ('Confirmed', 'Potwierdzona'),
        ('Cancelled', 'Anulowana'),
        ('Completed', 'Zakończona'),
        ('No-Show Student', 'Nieobecność Studenta'),
        ('No-Show Lecturer', 'Nieobecność Prowadzącego'),
    ]

    #relacje
    slot = models.ForeignKey(
        AvailableSlot,
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name='Zarezerwowany slot'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='my_reservations',
        verbose_name='Rezerwujący student'
    )

    #szczegóły rezerwacji
    topic = models.TextField(
        verbose_name="Temat spotkania",
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Confirmed',
        verbose_name='Status rezerwacji'
    )
    #metadane
    booked_at=models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data utworzenia rezerwacji'
    )
    class Meta:
        #unikalnosc rezerwacji na slot dla studenta
        ordering=['slot__start_time']
        verbose_name='Rezerwacja'
        verbose_name_plural='Rezerwacje'
    def __str__(self):
        return f"Rezerwacja dla {self.student.get_full_name()} u {self.slot.lecturer.get_full_name()}na slot {self.slot} - Status: {self.status}"