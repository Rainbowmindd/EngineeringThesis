# apps/reservations/sms_utils.py
"""
Pomocnicze funkcje do wysyłki SMS przez Twilio
"""
from django.conf import settings
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)


def send_sms(to_number, message):
    """
    Wysyła SMS przez Twilio

    Args:
        to_number: Numer telefonu w formacie międzynarodowym (np. +48123456789)
        message: Treść wiadomości (max 160 znaków dla pojedynczego SMS)

    Returns:
        bool: True jeśli sukces, False jeśli błąd
    """
    try:
        # Sprawdź czy Twilio jest skonfigurowane
        if not all([
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN,
        ]):
            logger.warning("Twilio nie jest skonfigurowane - pomijam wysyłkę SMS")
            return False

        # W trybie testowym (DEBUG=True):
        # Opcja A: Użyj magic number (nie wysyła prawdziwych SMS, tylko loguje)
        # Opcja B: Użyj Twojego zweryfikowanego numeru
        if settings.DEBUG:
            original_number = to_number

            # OPCJA A: Magic number Twilio - nie wysyła prawdziwych SMS
            # Zwraca sukces ale nic nie wysyła (darmowe testowanie)
            # to_number = '+15005550006'  # Magic number for successful SMS

            # OPCJA B: Twój zweryfikowany numer w Trial Account
            if hasattr(settings, 'TWILIO_TEST_NUMBER') and settings.TWILIO_TEST_NUMBER:
                to_number = settings.TWILIO_TEST_NUMBER
                logger.info(f"DEBUG MODE: Przekierowuję SMS z {original_number} na {to_number}")
                # Dodaj info o oryginalnym numerze do wiadomości
                message = f"[DO: {original_number}]\n{message}"
            else:
                logger.warning(f"TWILIO_TEST_NUMBER nie ustawiony - pomijam wysyłkę SMS")
                return False
        else:
            # Produkcja - wyślij na prawdziwy numer
            if not to_number.startswith('+'):
                to_number = f'+48{to_number}'

        # Inicjalizuj klienta Twilio
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Wyślij SMS
        if hasattr(settings, 'TWILIO_MESSAGING_SERVICE_SID') and settings.TWILIO_MESSAGING_SERVICE_SID:
            # Użyj Messaging Service (lepsze dla produkcji)
            sms = client.messages.create(
                body=message,
                messaging_service_sid=settings.TWILIO_MESSAGING_SERVICE_SID,
                to=to_number
            )
        else:
            # Użyj pojedynczego numeru
            sms = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_number
            )

        logger.info(f"SMS wysłany do {to_number}, SID: {sms.sid}, Status: {sms.status}")
        return True

    except Exception as e:
        logger.error(f"Błąd wysyłki SMS do {to_number}: {e}")
        return False


def format_phone_number(phone):
    """
    Formatuje numer telefonu do formatu międzynarodowego

    Args:
        phone: Numer telefonu (różne formaty)

    Returns:
        str: Numer w formacie +48XXXXXXXXX lub None jeśli nieprawidłowy
    """
    if not phone:
        return None

    # Usuń białe znaki i myślniki
    phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')

    # Jeśli już ma +, zwróć
    if phone.startswith('+'):
        return phone

    # Jeśli zaczyna się od 00, zamień na +
    if phone.startswith('00'):
        return '+' + phone[2:]

    # Jeśli polski numer (9 cyfr), dodaj +48
    if len(phone) == 9 and phone.isdigit():
        return f'+48{phone}'

    # Jeśli już ma kod kraju (11 cyfr: 48XXXXXXXXX)
    if len(phone) == 11 and phone.isdigit() and phone.startswith('48'):
        return f'+{phone}'

    logger.warning(f"Nie można sformatować numeru: {phone}")
    return None