# backend/apps/users/tests/test_auth.py
import pytest
from rest_framework import status
from django.urls import reverse


@pytest.mark.django_db
class TestRegistration:
    """5.1.1 - Testy rejestracji użytkowników"""

    def test_register_student_success(self, api_client):
        """T1.1 - Rejestracja nowego studenta"""
        from django.contrib.auth import get_user_model
        User = get_user_model()

        url = reverse('register')
        data = {
            'username': 'newstudent',  # ← TO BYŁO BRAKUJĄCE!
            'email': 'newstudent@agh.edu.pl',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'first_name': 'Piotr',
            'last_name': 'Nowak',
            'role': 'student'
        }

        response = api_client.post(url, data, format='json')

        # Debug output
        if response.status_code != 201:
            print(f"\n❌ Błąd {response.status_code}: {response.data}")

        assert response.status_code == status.HTTP_201_CREATED, \
            f"Oczekiwano 201, otrzymano {response.status_code}: {response.data}"

        assert User.objects.filter(email='newstudent@agh.edu.pl').exists()

        user = User.objects.get(email='newstudent@agh.edu.pl')
        assert user.role == 'student'
        assert user.first_name == 'Piotr'
        assert user.last_name == 'Nowak'
        assert user.username == 'newstudent'

    def test_register_with_existing_email(self, api_client, student_user):
        """T1.2 - Rejestracja z istniejącym emailem"""
        url = reverse('register')
        data = {
            'username': 'another_user',
            'email': student_user.email,  # Email już w systemie
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'student'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data or 'Email' in str(response.data)

    def test_register_with_weak_password(self, api_client):
        """T1.3 - Rejestracja ze słabym hasłem"""
        url = reverse('register')
        data = {
            'username': 'weakpass',
            'email': 'weak@agh.edu.pl',
            'password': '123',  # Za krótkie
            'password2': '123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'student'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # Może być w 'password' lub 'non_field_errors'
        assert 'password' in str(response.data).lower()

    def test_register_password_mismatch(self, api_client):
        """Hasła się nie zgadzają"""
        url = reverse('register')
        data = {
            'username': 'mismatch',
            'email': 'mismatch@agh.edu.pl',
            'password': 'SecurePass123!',
            'password2': 'DifferentPass123!',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'student'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # Serializer powinien zwrócić błąd o niezgodności haseł


@pytest.mark.django_db
class TestLogin:
    """5.1.1 - Testy logowania"""

    def test_login_success(self, api_client, student_user):
        """T1.4 - Logowanie z poprawnymi danymi"""
        url = reverse('login')
        data = {
            'email': 'student@agh.edu.pl',
            'password': 'TestPass123!'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        # Sprawdź czy zwraca tokeny
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data

    def test_login_wrong_password(self, api_client, student_user):
        """T1.5 - Logowanie z błędnym hasłem"""
        url = reverse('login')
        data = {
            'email': 'student@agh.edu.pl',
            'password': 'WrongPassword123!'
        }

        response = api_client.post(url, data, format='json')

        # Twój LoginView zwraca 400, nie 401
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'detail' in response.data
        assert 'Invalid' in response.data['detail']

    def test_login_nonexistent_user(self, api_client):
        """Logowanie nieistniejącego użytkownika"""
        url = reverse('login')
        data = {
            'email': 'nonexistent@agh.edu.pl',
            'password': 'SomePass123!'
        }

        response = api_client.post(url, data, format='json')

        # Twój LoginView zwraca 400, nie 401
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'detail' in response.data

    def test_login_missing_email(self, api_client):
        """Logowanie bez emaila"""
        url = reverse('login')
        data = {
            'password': 'TestPass123!'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Email and password are required' in response.data['detail']

    def test_login_missing_password(self, api_client):
        """Logowanie bez hasła"""
        url = reverse('login')
        data = {
            'email': 'test@agh.edu.pl'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Email and password are required' in response.data['detail']


@pytest.mark.django_db
class TestPasswordReset:
    """5.1.1 - Testy resetowania hasła"""

    def test_password_reset_request(self, api_client, student_user):
        """T1.6 - Żądanie resetu hasła"""
        url = reverse('password_reset_request')
        data = {
            'email': 'student@agh.edu.pl'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        # Email będzie w mailoutbox (w testach)

    @pytest.mark.skip(reason="Wymaga generowania tokenu")
    def test_password_reset_confirm(self, api_client, student_user):
        """Reset hasła z tokenem - TODO"""
        pass