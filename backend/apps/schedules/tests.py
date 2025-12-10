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

    def test_student_can_list_public_slots(self):
        print("Student moze przegladac publiczne sloty")
        #Expected -> 200 OK dla studenta/anona przy przegladaniu publicznych slotow

        #Tworzenie publicznego slotu przez prowadzacego
        AvailableSlot.objects.create(
            lecturer=self.lecturer,
            start_time=timezone.now() + timedelta(days=1,hours=10),
            end_time=timezone.now() + timedelta(days=1, hours=11),
            max_attendees=1,
            meeting_location='Test Pokoj',
            is_active=True,
        )

        #klient bez uwierztelniania na potrzeby testu
        anon_client=APIClient()

        #Definicja url dla public endpoint
        public_url = reverse('public-slots-list')

        #get
        response = anon_client.get(public_url)

        #expected -> 200
        self.assertEqual(response.status_code,200)

        #weryfikacja czy jest widoczny slot
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['max_attendees'], 1)

    #Test crud
    def test_lecturer_can_update_own_slot(self):
        print("Test aktualizacji terminu przez prowadzacego")
        #expected -> 200 OK dla prowadzacego przy aktualizacji wlasnego slotu

        #Tworzenie slotu przez prowadzacego
        slot=AvailableSlot.objects.create(
            lecturer=self.lecturer,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
            max_attendees=1,
            meeting_location='Test Pokoj',
            is_active=True,
        )

        #To update
        update_data={
            'meeting_location': 'Nowy Pokoj',
            'max_attendees':2,
        }

        #PUT
        test_url=reverse('slots-detail', kwargs={'pk':slot.pk})
        response = self.client.patch(test_url, update_data, format='json')

        #200 OK
        self.assertEqual(response.status_code,200)

        #Weryfikacja aktualizacji (refresh i check)
        slot.refresh_from_db()
        self.assertEqual(slot.meeting_location, 'Nowy Pokoj')
        self.assertEqual(slot.max_attendees, 2)


