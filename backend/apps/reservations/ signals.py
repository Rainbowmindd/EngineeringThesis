from django.db.models.signals import post_save
from apps.notifications.models import Notification
from apps.reservations.models import Reservation
from django.conf import settings

def create_reservation_notification_on_new_reservation(sender, instance, created, **kwargs):
    print("!!! SYGNAŁ WYWOŁANY !!!")
    #tworzenie powiadomienia dla prowadzacego przy nowej rezerwacji
    if created:
        reservation = instance
        lecturer = reservation.slot.lecturer
        student = reservation.student

        message = (
            f"Nowa rezerwacja od studenta {student.get_full_name()} "
            f"na termin {reservation.slot.start_time.strftime('%d.%m.%Y %H:%M')}."
        )

        Notification.objects.create(
            recipient=lecturer,
            message=message,
            notification_type='NEW_RESERVATION'
        )

        #Tworzenie powiadomienia potwierdzajacego dla studenta
        Notification.objects.create(
            recipient=student,
            message=f"Twoja rezerwacja na termin {reservation.slot.start_time.strftime('%d.%m.%Y %H:%M')} do {lecturer.get_full_name()}została potwierdzona.",
            notification_type='RESERVATION_CONFIRMATION'
        )
post_save.connect(
    create_reservation_notification_on_new_reservation,
    sender=Reservation  # <-- Podłącz do swojego modelu Reservation
)