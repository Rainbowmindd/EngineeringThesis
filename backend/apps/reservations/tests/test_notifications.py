# backend/apps/reservations/tests/test_notifications.py
import pytest
from unittest.mock import patch
from apps.reservations.models import Reservation


# @pytest.mark.django_db
# class TestEmailNotifications:
#     """5.1.4 - Testy email"""
#
#     def test_email_on_creation(self, authenticated_student_client, available_slot, mailoutbox):
#         """T4.1 - Email do prowadzącego"""
#         from django.urls import reverse
#         url = reverse('student-reservations-list')
#         data = {'slot_id': available_slot.id}
#
#         response = authenticated_student_client.post(url, data, format='json')
#
#         assert response.status_code == 201
#         assert len(mailoutbox) >= 1
#         assert available_slot.lecturer.email in mailoutbox[0].to
#
#
# @pytest.mark.django_db
# class TestSMSNotifications:
#     """5.1.4 - Testy SMS"""
#
#     @patch('apps.reservations.sms_utils.send_sms')
#     def test_sms_on_creation(self, mock_sms, authenticated_student_client, available_slot):
#         """T4.2 - SMS do prowadzącego"""
#         from django.urls import reverse
#         url = reverse('student-reservations-list')
#
#         response = authenticated_student_client.post(url, {'slot_id': available_slot.id}, format='json')
#
#         assert response.status_code == 201
#         assert mock_sms.called