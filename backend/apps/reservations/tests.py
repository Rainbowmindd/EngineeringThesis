from oauthlib.uri_validate import userinfo
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta

#models
from apps.users.models import User
from apps.schedules.models import AvailableSlot
from apps.reservations.models import Reservation
from apps.notifications.models import Notification

class ReservationCreationtest(APITestCase):
    def setUp(self):
        #create users with roles
        self.lecturer = User.objects.create_user(
            username="prowadzacy",
            email="l@agh.pl",
            password="kochamAgh123$",
            role='lecturer'
        )
        self.student = User.objects.create_user(
            username="student",
            email="s@agh.pl",
            password="kochamAgh123$",
            role='student'
        )
        #api client
        self.client=APIClient()

        #tworzenie rezerwacji url
        self.reservation_list_url=reverse('student-reservations-list')

    def test_notification_is_created_on_reservation(self):
        print("\nTest: powiadomienie tworzone dla prowadzacego przy nowej rezerwacji")

        #tworzenie terminu
        slot = AvailableSlot.objects.create(
            lecturer=self.lecturer,
            start_time=timezone.now() + timedelta(days=2),
            end_time=timezone.now() + timedelta(days=2, hours=1),
            max_attendees=1,
            meeting_location='B5 sala 701',
            is_active=True,
        )

        initial_notification_count=Notification.objects.count()

        #tworzenie rezerwacji jako student
        self.client.force_authenticate(user=self.student)

        reservation_data ={
            'slot': slot.pk,
            # 'status': 'Pending',
            'notes': 'Potrzebuje konsultacji',
        }

        response = self.client.post(self.reservation_list_url, reservation_data,format='json')

        #czy rezerwacja sie powiodla
        if response.status_code != 201:
            print("Blad walidacji rezerwacji:",response.data)

        self.assertEqual(response.status_code, 201)

        #czy powstalo powiadomienie
        final_notification_count = Notification.objects.count()
        self.assertEqual(final_notification_count, initial_notification_count + 2,"Powinny powstać 2 nowe powiadomienia (dla prowadzącego i studenta).")
        # Powiadomienie dla PROWADZĄCEGO (o nowej rezerwacji)
        lecturer_notification = Notification.objects.filter(
            recipient=self.lecturer,
            notification_type='NEW_RESERVATION'
        ).first()

        self.assertIsNotNone(lecturer_notification, "Nie znaleziono powiadomienia NEW_RESERVATION dla prowadzącego.")
        self.assertIn(self.student.get_full_name(), lecturer_notification.message)

        # Powiadomienie dla STUDENTA (potwierdzenie rezerwacji)
        student_notification = Notification.objects.filter(
            recipient=self.student,
            notification_type='RESERVATION_CONFIRMATION'
        ).first()

        self.assertIsNotNone(student_notification,
                             "Nie znaleziono powiadomienia RESERVATION_CONFIRMATION dla studenta.")
        self.assertIn(self.lecturer.get_full_name(), student_notification.message)


