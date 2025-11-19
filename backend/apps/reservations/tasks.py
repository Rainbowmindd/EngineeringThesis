#logika wykonywana w tle
from celery import shared_task
from django.template.loader import render_to_string
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import get_user_model
from apps.reservations.models import Reservation
from apps.notifications.models import Notification
from apps.schedules.models import AvailableSlot

@shared_task(name='reservations.create_notifications', max_retries=3)
def create_reservation_notifications_task(reservation_id):
    #tworzenie obiektow notification asynchro dla celery
    try:
        reservation=Reservation.objects.select_related('slot', 'student', 'slot__lecturer').get(pk=reservation_id)

        #Tworzenie notyfikacji - lecturer
        Notification.objects.create(
            recipient=reservation.slot.lecturer,
            message=f"Masz nowa rezerwacje od {reservation.student.get_full_name()} w terminie {reservation.slot.start_time.strftime('%H:%M')}.",
            notification_type='NEW_RESERVATION',
            reservation=reservation
        )

        #student
        Notification.objects.create(
            recipient=reservation.student,
            message=f"Twoja rezerwacja u {reservation.slot.lecturer.get_full_name()} na dzień {reservation.slot.start_time.strftime('%Y-%m-%d')} została potwierdzona.",
            notification_type='RESERVATION_CONFIRMED',
            reservation=reservation
        )

        print(f"Utworzono powiadomienia dla rezerwacji ID: {reservation_id}")

    except Reservation.DoesNotExist:
        print(f"Zadanie celery - nie znaleziono rezerwacji do powiadomienia ID: {reservation_id} Anulowano zadanie")
        return

@shared_task(bind=True, name='reservations.send_confirmation_email',max_retries=3)
def send_reservation_confirmation_email(self,reservation_id):
    #async taask celery to send confirmation emails

    try:
        reservation=Reservation.objects.select_related('slot','student','slot__lecturer').get(pk=reservation_id)
        slot=reservation.slot
        student=reservation.student
        lecturer=slot.lecturer

        context ={
            'student_name': student.get_full_name() or student.username,
            'lecturer_name': lecturer.get_full_name() or lecturer.username,
            'start_time': slot.start_time.strftime('%Y-%m-%d %H:%M'),
            'end_time': slot.end_time.strftime('%H:%M'),
            'topic': reservation.topic if reservation.topic else "Brak tematu",
            'status': reservation.get_status_display(),
        }
        #email to student
        student_subject=f"Potwierdzenie rezerwacji: {context['start_time']}"
        student_body= render_to_string('email_templates/student_confirmation.txt',context)

        EmailMultiAlternatives(
            subject=student_subject,
            body=student_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[student.email],
        ).send(fail_silently=False)

        #email do prowadzacego
        lecturer_subject = f"NOWA Rezerwacja: {context['student_name']} w terminie {context['start_time']}"
        lecturer_body = render_to_string('email_templates/lecturer_confirmation.txt',context)

        EmailMultiAlternatives(
            subject=lecturer_subject,
            body=lecturer_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[lecturer.email],
        ).send(fail_silently=False)


    except Reservation.DoesNotExist:
        print(f"Zadanie celery - nie znaleziono rezerwacji o ID: {reservation_id} Anulowano zadanie")
        return
    except Exception as exc:
        print(f"Zadane Celery - błąd wysłania email dla id {reservation_id}: {exc}")
        raise self.retry(exc=exc, countdown=10)

