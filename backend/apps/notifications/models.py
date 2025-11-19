from django.db import models
from django.conf import settings
from apps.users.models import User

class Notification(models.Model):

    #Odbiorca -> student/prowadzacy
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Odbiorca'
    )
    #tresc i typ powiadomienia
    message = models.TextField(verbose_name="Tresc powiadomienia")

    TYPE_CHOICES= [
        ('RESERVATION_CONFIRMATION', 'Potwierdzenie rezerwacji'),
        ('RESERVATION_CANCELLATION', 'Anulowanie rezerwacji'),
        ('SLOT_UPDATE', 'Aktualizacja terminu'),
        ('NEW_RESERVATION', 'Nowa rezerwacja'),
    ]
    notification_type=models.CharField(
        max_length=255,
        choices=TYPE_CHOICES,
        default='NEW_RESERVATION',
        verbose_name='Typ powiadomienia'
    )
    #status odczytu
    is_seen= models.BooleanField(default=False,verbose_name='Czy odczytane?')

    #data utworzenia
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Powiadomienie'
        verbose_name_plural = 'Powiadomienia'

    def __str__(self):
        return f"Dla {self.recipient.username}: {self.message[:30]}..."
