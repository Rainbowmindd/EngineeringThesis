from django.db import models
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from django.utils import timezone

# Importy z Twoich aplikacji
from apps.schedules.models import AvailableSlot


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Oczekująca'),
        ('accepted', 'Zaakceptowana'),
        ('rejected', 'Odrzucona'),
        ('cancelled', 'Anulowana'),
        ('completed', 'Zakończona'),
        ('no_show_student', 'Nieobecność Studenta'),
        ('no_show_lecturer', 'Nieobecność Prowadzącego'),
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

    topic = models.TextField(
        verbose_name="Temat spotkania",
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Status rezerwacji'
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="Powód odrzucenia rezerwacji"
    )

    accepted_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Data zaakceptowania"
    )

    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_reservations',
        verbose_name="Zaakceptowane przez"
    )

    booked_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data utworzenia rezerwacji'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Data ostatniej aktualizacji'
    )

    class Meta:
        ordering = ['-booked_at']
        verbose_name = 'Rezerwacja'
        verbose_name_plural = 'Rezerwacje'
        indexes = [
            models.Index(fields=['status', 'slot']),
            models.Index(fields=['student', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['slot', 'student'],
                condition=models.Q(status__in=['pending', 'accepted']),
                name='unique_active_reservation_per_slot'
            )
        ]

    def __str__(self):
        return (
            f"Rezerwacja: {self.student.get_full_name()} "
            f"→ {self.slot.lecturer.get_full_name()} "
            f"({self.get_status_display()}) "
            f"[{self.slot.start_time.strftime('%Y-%m-%d %H:%M')}]"
        )

    def can_be_cancelled(self):
        """Sprawdza czy rezerwację można anulować"""
        return self.status in ['pending', 'accepted']

    def can_be_accepted(self):
        """Sprawdza czy rezerwację można zaakceptować"""
        return self.status == 'pending'

    def can_be_rejected(self):
        """Sprawdza czy rezerwację można odrzucić"""
        return self.status == 'pending'

    def is_active(self):
        """Sprawdza czy rezerwacja jest aktywna"""
        return self.status in ['pending', 'accepted']


# ============= SIGNALS =============

@receiver(post_save, sender=Reservation)
def handle_reservation_creation(sender, instance, created, **kwargs):
    """
    Signal uruchamiany po zapisaniu rezerwacji
    Obsługuje TWORZENIE nowej rezerwacji
    """
    if created:
        # NOWA REZERWACJA - wysyłamy powiadomienia (EMAIL + SMS)
        from .tasks import (
            notify_lecturer_new_reservation,
            send_reservation_confirmation_email,
            send_sms_lecturer_new_reservation,
            send_sms_student_reservation_confirmed
        )

        print(f"Nowa rezerwacja #{instance.pk} utworzona (status: {instance.status})")

        # EMAIL dla prowadzącego
        transaction.on_commit(
            lambda: notify_lecturer_new_reservation.delay(instance.pk)
        )

        # EMAIL potwierdzenia dla studenta
        transaction.on_commit(
            lambda: send_reservation_confirmation_email.delay(instance.pk)
        )

        # SMS dla prowadzącego
        transaction.on_commit(
            lambda: send_sms_lecturer_new_reservation.delay(instance.pk)
        )

        # SMS potwierdzenia dla studenta
        transaction.on_commit(
            lambda: send_sms_student_reservation_confirmed.delay(instance.pk)
        )


@receiver(post_save, sender=Reservation)
def schedule_auto_reject(sender, instance, created, **kwargs):
    """
    Planuje automatyczne odrzucenie rezerwacji po 24h jeśli nie zostanie zaakceptowana
    """
    if created and instance.status == 'pending':
        from .tasks import auto_reject_expired_reservation

        eta = timezone.now() + timezone.timedelta(hours=24)

        transaction.on_commit(
            lambda: auto_reject_expired_reservation.apply_async(
                args=[instance.pk],
                eta=eta
            )
        )

        print(f"Zaplanowano auto-reject dla rezerwacji #{instance.pk} na {eta}")


@receiver(pre_save, sender=Reservation)
def handle_status_change(sender, instance, **kwargs):
    """
    Signal uruchamiany PRZED zapisaniem rezerwacji
    Sprawdza czy status się zmienił i wysyła powiadomienia
    """
    if instance.pk:  # Tylko dla istniejących rezerwacji (nie nowych)
        try:
            old_instance = Reservation.objects.get(pk=instance.pk)

            # Sprawdź czy status się zmienił na accepted lub rejected
            if old_instance.status != instance.status and instance.status in ['accepted', 'rejected']:
                from .tasks import (
                    notify_student_status_change,
                    send_sms_student_status_change
                )

                print(f"Status rezerwacji #{instance.pk} zmieniony: {old_instance.status} -> {instance.status}")

                # Wyślij EMAIL i SMS PO zapisaniu (transaction.on_commit)
                transaction.on_commit(
                    lambda: notify_student_status_change.delay(instance.pk)
                )

                transaction.on_commit(
                    lambda: send_sms_student_status_change.delay(instance.pk)
                )

        except Reservation.DoesNotExist:
            # Nowa rezerwacja - obsługiwane przez post_save
            pass