
from django.apps import AppConfig

class ReservationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reservations'

    # # *** Ważny krok: Zarejestruj sygnały tutaj ***
    # def ready(self):
    #     # from . import signals