from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from apps.users.models import User
from apps.schedules.models import AvailableSlot
from django.utils import timezone
from datetime import timedelta

class AvailableSlotPermissionTest(APITestCase):
    def setUp(self):
        #Tworzenie uzytkownikow z rolami
        self.lecturer = User.objects.create_user(
            username='testowy_lecturer',
            email='l@agh.pl',
            password='password123',
            role='lecturer'
        )
        self.client=APIClient()
        self.client.force_authenticate(user=self.lecturer)

        self.student = User.objects.create_user(
            username='testowy_student',
            email='s@agh.pl',
            password='password123',
            role='student'
        )
        self.url=reverse('slots-list') #endpoiny dla prowadzącego

    def test_student_cannot_access_lecturer_slots(self):
        print("Test dostepu studenta do slotow prowadzacego")
        #Expected -> 403 forbidden dla studenta
        self.client.force_authenticate(user=self.student)

        slot_data={
            'start_time': (timezone.now() +timedelta(days=1)).isoformat(),
            'end_time': (timezone.now() +timedelta(days=1, hours=1)).isoformat(),
            'max_attendees':1,
            'meeting_location': 'test',
            'is_active': True,
        }

        response=self.client.post(self.url, slot_data, format='json')

        #Test uprawnien (Failure)
        self.assertEqual(response.status_code,403)

    def test_lecturer_can_create_slot(self):
        print("Test tworzenia slotu przez prowadzącego")
        #Expected -> 201 created dla prowadzącego
        self.client.force_authenticate(user=self.lecturer)

        slot_data={
            'start_time': (timezone.now() +timedelta(days=1)).isoformat(),
            'end_time': (timezone.now() +timedelta(days=1, hours=1)).isoformat(),
            'max_attendees':1,
            'meeting_location': 'test',
            'is_active': True,
        }


        response=self.client.post(self.url, slot_data,format='json')
        if response.status_code!= 201:
            print("Response data:", response.data)

        #Test uprawnien (Success)
        self.assertEqual(response.status_code,201)
        #test czy slot zostal poprawnie utworzony (do wlasciwego wykladowcy)
        self.assertEqual(AvailableSlot.objects.get().lecturer, self.lecturer)

