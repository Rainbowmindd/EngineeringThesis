from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction

# Importy z Twoich aplikacji
from apps.schedules.models import AvailableSlot


class Reservation(models.Model):
    # Statusy rezerwacji
    STATUS_CHOICES = [
        ('Pending', 'Oczekująca'),
        ('Confirmed', 'Potwierdzona'),
        ('Cancelled', 'Anulowana'),
        ('Completed', 'Zakończona'),
        ('No-Show Student', 'Nieobecność Studenta'),
        ('No-Show Lecturer', 'Nieobecność Prowadzącego'),
    ]

    # Relacje
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

    # Szczegóły rezerwacji
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

    # Metadane
    booked_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data utworzenia rezerwacji'
    )

    class Meta:
        # Unikalność rezerwacji na slot dla studenta (opcjonalnie, ale dobra praktyka)
        # Możesz chcieć dodać tu: unique_together = (('slot', 'student'),)
        ordering = ['slot__start_time']
        verbose_name = 'Rezerwacja'
        verbose_name_plural = 'Rezerwacje'

    def __str__(self):
        return (
            f"Rezerwacja dla {self.student.get_full_name()} "
            f"u {self.slot.lecturer.get_full_name()} "
            f"na slot {self.slot.start_time.strftime('%Y-%m-%d %H:%M')} - Status: {self.status}"
        )


# --- LOGIKA SYGNAŁÓW CELERY (PO MODELU) ---

@receiver(post_save, sender=Reservation)
def handle_reservation_creation(sender, instance, created, **kwargs):
    """
    Podłączenie sygnału post_save do modelu Reservation.
    Wywołuje asynchroniczne zadania Celery, jeśli rezerwacja została utworzona.
    """

    # Sprawdzamy, czy obiekt został faktycznie utworzony (a nie zaktualizowany)
    if created:
        from .tasks import create_reservation_notifications_task, send_reservation_confirmation_email
        print("!!! SYGNAŁ POST_SAVE WYWOŁANY. Zadania Celery w kolejce (on_commit) !!!")

        reservation_pk = instance.pk

        # Używamy transaction.on_commit, aby zadania Celery wystartowały
        # TYLKO po tym, jak rezerwacja jest trwale zapisana (commit) w bazie danych.

        # a) Zadanie dla tworzenia obiektów Notification
        transaction.on_commit(
            lambda: create_reservation_notifications_task.delay(reservation_pk)
        )

        # b) Zadanie dla wysyłki e-maili
        transaction.on_commit(
            lambda: send_reservation_confirmation_email.delay(reservation_pk)
        )