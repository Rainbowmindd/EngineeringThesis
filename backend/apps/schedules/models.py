from django.db import models
from django.conf import settings
from datetime import date as datetime_date

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
    is_active=models.BooleanField(
        default=True,
        verbose_name="Czy slot jest aktywny/moze byc rezerwowany"
    )

    #kolumna przedmiot
    subject = models.CharField(max_length=255, blank=True, null=True, verbose_name="Przedmiot")

    class Meta:
        ordering = ['start_time']
        verbose_name = "Dostępny slot"
        verbose_name_plural = "Dostępne sloty"

        # backend/apps/schedules/models.py (Poprawka)

    def __str__(self):
        return (
            f"Slot {self.lecturer.get_full_name()} "
            f"({self.subject})"
            f"od {self.start_time.strftime('%Y-%m-%d %H:%M')} "
            f"do {self.end_time.strftime('%H:%M')}"
            )

class BlockedTime(models.Model):
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocked_times'
    )
    date = models.DateField(
        default=datetime_date.today,
        verbose_name="Data zablokowania",
        help_text="Konkretna data (YYYY-MM-DD)"
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['start_time']
        verbose_name = "Zablokowany czas"
        verbose_name_plural = "Zablokowane czasy"

    def __str__(self):
        return f"{self.lecturer.get_full_name()} blocked {self.start_time} - {self.end_time}"


class TimeWindow(models.Model):
    """
    Cykliczny szablon dostępności (np. 'każdy poniedziałek 8-11').
    Na podstawie tego będą generowane AvailableSlot.
    """
    DAY_CHOICES = [
        ('Poniedziałek', 'Poniedziałek'),
        ('Wtorek', 'Wtorek'),
        ('Środa', 'Środa'),
        ('Czwartek', 'Czwartek'),
        ('Piątek', 'Piątek'),
        ('Sobota', 'Sobota'),
        ('Niedziela', 'Niedziela'),
    ]

    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='time_windows'
    )

    # Dzień tygodnia (cykliczny)
    day = models.CharField(
        max_length=15,
        choices=DAY_CHOICES,
        verbose_name="Dzień tygodnia"
    )

    # Godziny (tylko czas, nie data)
    start_time = models.TimeField(verbose_name="Godzina rozpoczęcia")
    end_time = models.TimeField(verbose_name="Godzina zakończenia")

    # Szczegóły
    max_attendees = models.PositiveSmallIntegerField(
        default=5,
        verbose_name="Maksymalna liczba studentów"
    )
    meeting_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Miejsce spotkania"
    )
    subject = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Przedmiot"
    )

    # Status
    is_active = models.BooleanField(
        default=True,
        verbose_name="Czy aktywne"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['day', 'start_time']
        verbose_name = "Okno dostępności"
        verbose_name_plural = "Okna dostępności"

    def __str__(self):
        return f"{self.lecturer.get_full_name()} - {self.day} {self.start_time}-{self.end_time}"