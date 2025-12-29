from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings


@shared_task
def notify_lecturer_new_reservation(reservation_id):
    """
    Powiadomienie dla prowadzącego o nowej rezerwacji (status: pending)
    """
    from .models import Reservation

    try:
        reservation = Reservation.objects.select_related(
            'slot', 'slot__lecturer', 'student'
        ).get(id=reservation_id)

        # Plain text wersja
        text_content = f"""
Witaj {reservation.slot.lecturer.get_full_name()},

Student {reservation.student.get_full_name()} ({reservation.student.email}) 
zarezerwował termin konsultacji:

Data: {reservation.slot.start_time.strftime('%Y-%m-%d')}
Godzina: {reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}
Lokalizacja: {reservation.slot.meeting_location}
Temat: {reservation.topic or 'Brak tematu'}

 Rezerwacja oczekuje na Twoją akceptację.

Zaloguj się do systemu, aby zaakceptować lub odrzucić rezerwację:
{settings.FRONTEND_URL}/lecturer-reservations

Pozdrawiamy,
System Rezerwacji Konsultacji
        """

        # HTML wersja
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #FFA726 0%, #FB8C00 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px 25px;
        }}
        .greeting {{
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
        }}
        .info-card {{
            background-color: #FFF3E0;
            border-left: 4px solid #FF9800;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .info-row {{
            display: flex;
            margin: 12px 0;
            align-items: center;
        }}
        .info-icon {{
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
        }}
        .info-label {{
            font-weight: 600;
            color: #555;
            margin-right: 8px;
        }}
        .info-value {{
            color: #333;
        }}
        .student-info {{
            background-color: #E3F2FD;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .alert-box {{
            background-color: #FFF8E1;
            border: 2px solid #FFC107;
            padding: 15px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
        }}
        .alert-box p {{
            margin: 0;
            color: #F57C00;
            font-weight: 600;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
        }}
        .button:hover {{
            background: linear-gradient(135deg, #45a049 0%, #4CAF50 100%);
        }}
        .footer {{
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Nowa Rezerwacja Oczekuje</h1>
        </div>

        <div class="content">
            <div class="greeting">
                Witaj <strong>{reservation.slot.lecturer.get_full_name()}</strong>,
            </div>

            <p>Otrzymałeś nową rezerwację konsultacji od studenta:</p>

            <div class="student-info">
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Student:</span>
                    <span class="info-value">{reservation.student.get_full_name()}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Email:</span>
                    <span class="info-value">{reservation.student.email}</span>
                </div>
            </div>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Data:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%d.%m.%Y (%A)')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Godzina:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Lokalizacja:</span>
                    <span class="info-value">{reservation.slot.meeting_location}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Temat:</span>
                    <span class="info-value">{reservation.topic or 'Nie podano'}</span>
                </div>
            </div>

            <div class="alert-box">
                <p> Rezerwacja oczekuje na Twoją akceptację</p>
            </div>

            <center>
                <a href="{settings.FRONTEND_URL}/lecturer-reservations" class="button">
                    Zarządzaj Rezerwacjami
                </a>
            </center>
        </div>

        <div class="footer">
            <p>System Rezerwacji Konsultacji AGH</p>
            <p>Ten email został wygenerowany automatycznie. Prosimy nie odpowiadać.</p>
        </div>
    </div>
</body>
</html>
        """

        # Wyślij email z HTML
        msg = EmailMultiAlternatives(
            subject="Nowa rezerwacja oczekuje na potwierdzenie",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[reservation.slot.lecturer.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        # Zapisz HTML do pliku (dla podglądu)
        import os
        preview_dir = os.path.join(settings.BASE_DIR, 'email_previews')
        os.makedirs(preview_dir, exist_ok=True)
        preview_path = os.path.join(preview_dir, f'lecturer_new_reservation_{reservation_id}.html')
        with open(preview_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"Email wysłany do prowadzącego: {reservation.slot.lecturer.email}")
        print(f"Preview zapisany: {preview_path}")
        return True

    except Reservation.DoesNotExist:
        print(f"Rezerwacja #{reservation_id} nie istnieje")
        return False
    except Exception as e:
        print(f"Błąd wysyłki emaila: {e}")
        return False


@shared_task
def send_reservation_confirmation_email(reservation_id):
    """
    Potwierdzenie dla studenta o utworzeniu rezerwacji (status: pending)
    """
    from .models import Reservation

    try:
        reservation = Reservation.objects.select_related(
            'slot', 'slot__lecturer', 'student'
        ).get(id=reservation_id)

        text_content = f"""
Witaj {reservation.student.get_full_name()},

Twoja rezerwacja została utworzona i oczekuje na potwierdzenie przez prowadzącego.

Data: {reservation.slot.start_time.strftime('%Y-%m-%d')}
Godzina: {reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}
Prowadzący: {reservation.slot.lecturer.get_full_name()}
Lokalizacja: {reservation.slot.meeting_location}
Temat: {reservation.topic or 'Brak tematu'}

 Status: OCZEKUJE NA POTWIERDZENIE

Otrzymasz powiadomienie, gdy prowadzący zaakceptuje lub odrzuci Twoją rezerwację.

Możesz śledzić status rezerwacji w panelu studenta:
{settings.FRONTEND_URL}/student-reservations

Pozdrawiamy,
System Rezerwacji Konsultacji
        """

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px 25px;
        }}
        .success-icon {{
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
        }}
        .info-card {{
            background-color: #E3F2FD;
            border-left: 4px solid #2196F3;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .info-row {{
            display: flex;
            margin: 12px 0;
            align-items: center;
        }}
        .info-icon {{
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
        }}
        .info-label {{
            font-weight: 600;
            color: #555;
            margin-right: 8px;
        }}
        .info-value {{
            color: #333;
        }}
        .status-pending {{
            background-color: #FFF3E0;
            border: 2px solid #FF9800;
            padding: 15px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
        }}
        .status-pending p {{
            margin: 0;
            color: #F57C00;
            font-weight: 600;
            font-size: 16px;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
        }}
        .footer {{
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1> Rezerwacja Utworzona</h1>
        </div>

        <div class="content">
            <div class="success-icon">✓</div>

            <p style="text-align: center; font-size: 18px; color: #333;">
                Witaj <strong>{reservation.student.get_full_name()}</strong>!
            </p>

            <p style="text-align: center; color: #666;">
                Twoja rezerwacja została pomyślnie utworzona i oczekuje na potwierdzenie przez prowadzącego.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Data:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%d.%m.%Y (%A)')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Godzina:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Prowadzący:</span>
                    <span class="info-value">{reservation.slot.lecturer.get_full_name()}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Lokalizacja:</span>
                    <span class="info-value">{reservation.slot.meeting_location}</span>
                </div>
                {'<div class="info-row"><span class="info-icon">📝</span><span class="info-label">Temat:</span><span class="info-value">' + reservation.topic + '</span></div>' if reservation.topic else ''}
            </div>

            <div class="status-pending">
                <p> Status: OCZEKUJE NA POTWIERDZENIE</p>
            </div>

            <p style="text-align: center; color: #666;">
                Otrzymasz powiadomienie email, gdy prowadzący zaakceptuje lub odrzuci Twoją rezerwację.
            </p>

            <center>
                <a href="{settings.FRONTEND_URL}/student-reservations" class="button">
                    Moje Rezerwacje
                </a>
            </center>
        </div>

        <div class="footer">
            <p>System Rezerwacji Konsultacji AGH</p>
            <p>Ten email został wygenerowany automatycznie. Prosimy nie odpowiadać.</p>
        </div>
    </div>
</body>
</html>
        """

        msg = EmailMultiAlternatives(
            subject=" Rezerwacja utworzona - oczekuje na potwierdzenie",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[reservation.student.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        # Zapisz HTML do pliku (dla podglądu)
        import os
        preview_dir = os.path.join(settings.BASE_DIR, 'email_previews')
        os.makedirs(preview_dir, exist_ok=True)
        preview_path = os.path.join(preview_dir, f'student_confirmation_{reservation_id}.html')
        with open(preview_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"Email potwierdzenia wysłany do studenta: {reservation.student.email}")
        print(f"Preview zapisany: {preview_path}")
        return True

    except Exception as e:
        print(f"Błąd wysyłki emaila: {e}")
        return False


@shared_task
def notify_student_status_change(reservation_id):
    """
    Powiadomienie dla studenta o zmianie statusu rezerwacji (accepted/rejected)
    """
    from .models import Reservation

    try:
        reservation = Reservation.objects.select_related(
            'slot', 'slot__lecturer', 'student'
        ).get(id=reservation_id)

        if reservation.status == 'accepted':
            text_content = f"""
Witaj {reservation.student.get_full_name()},

Świetne wiadomości! Twoja rezerwacja została zaakceptowana przez prowadzącego.

Data: {reservation.slot.start_time.strftime('%d.%m.%Y')}
Godzina: {reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}
Prowadzący: {reservation.slot.lecturer.get_full_name()}
Lokalizacja: {reservation.slot.meeting_location}

Status: POTWIERDZONA

Pamiętaj o punktualnym przybyciu na konsultacje!

Pozdrawiamy,
System Rezerwacji Konsultacji
            """

            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px 25px;
        }}
        .success-icon {{
            text-align: center;
            font-size: 64px;
            margin: 20px 0;
        }}
        .info-card {{
            background-color: #E8F5E9;
            border-left: 4px solid #4CAF50;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .info-row {{
            display: flex;
            margin: 12px 0;
            align-items: center;
        }}
        .info-icon {{
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
        }}
        .info-label {{
            font-weight: 600;
            color: #555;
            margin-right: 8px;
        }}
        .info-value {{
            color: #333;
        }}
        .status-accepted {{
            background-color: #E8F5E9;
            border: 2px solid #4CAF50;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
        }}
        .status-accepted p {{
            margin: 0;
            color: #2E7D32;
            font-weight: 700;
            font-size: 18px;
        }}
        .reminder-box {{
            background-color: #FFF9C4;
            border-left: 4px solid #FBC02D;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .footer {{
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Rezerwacja Zaakceptowana!</h1>
        </div>

        <div class="content">
            <div class="success-icon"></div>

            <p style="text-align: center; font-size: 18px; color: #333;">
                Witaj <strong>{reservation.student.get_full_name()}</strong>!
            </p>

            <p style="text-align: center; color: #666; font-size: 16px;">
                Świetne wiadomości! Twoja rezerwacja została <strong style="color: #4CAF50;">zaakceptowana</strong> przez prowadzącego.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Data:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%d.%m.%Y (%A)')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Godzina:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon"></span>
                    <span class="info-label">Prowadzący:</span>
                    <span class="info-value">{reservation.slot.lecturer.get_full_name()}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon">📍</span>
                    <span class="info-label">Lokalizacja:</span>
                    <span class="info-value">{reservation.slot.meeting_location}</span>
                </div>
            </div>

            <div class="status-accepted">
                <p> STATUS: POTWIERDZONA</p>
            </div>

            <div class="reminder-box">
                <p style="margin: 0; color: #F57F17;">
                     <strong>Pamiętaj:</strong> Przybądź punktualnie na konsultacje!
                </p>
            </div>
        </div>

        <div class="footer">
            <p>System Rezerwacji Konsultacji AGH</p>
            <p>Ten email został wygenerowany automatycznie. Prosimy nie odpowiadać.</p>
        </div>
    </div>
</body>
</html>
            """
            subject = "Rezerwacja zaakceptowana!"

        elif reservation.status == 'rejected':
            reason = reservation.rejection_reason or "Brak podanego powodu"
            text_content = f"""
Witaj {reservation.student.get_full_name()},

Niestety, Twoja rezerwacja została odrzucona przez prowadzącego.

Data: {reservation.slot.start_time.strftime('%d.%m.%Y')}
Godzina: {reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}
Prowadzący: {reservation.slot.lecturer.get_full_name()}

Status: ODRZUCONA
Powód: {reason}

Możesz spróbować zarezerwować inny termin w systemie:
{settings.FRONTEND_URL}/student-reservations

Pozdrawiamy,
System Rezerwacji Konsultacji
            """

            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px 25px;
        }}
        .info-card {{
            background-color: #FFEBEE;
            border-left: 4px solid #F44336;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .info-row {{
            display: flex;
            margin: 12px 0;
            align-items: center;
        }}
        .info-icon {{
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
        }}
        .info-label {{
            font-weight: 600;
            color: #555;
            margin-right: 8px;
        }}
        .info-value {{
            color: #333;
        }}
        .reason-box {{
            background-color: #FFF3E0;
            border: 2px solid #FF9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .reason-box h3 {{
            margin: 0 0 10px 0;
            color: #F57C00;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
        }}
        .footer {{
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Rezerwacja Odrzucona</h1>
        </div>

        <div class="content">
            <p style="text-align: center; font-size: 18px; color: #333;">
                Witaj <strong>{reservation.student.get_full_name()}</strong>,
            </p>

            <p style="text-align: center; color: #666;">
                Niestety, Twoja rezerwacja została odrzucona przez prowadzącego.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-icon">📅</span>
                    <span class="info-label">Data:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%d.%m.%Y (%A)')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon">🕐</span>
                    <span class="info-label">Godzina:</span>
                    <span class="info-value">{reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon">👤</span>
                    <span class="info-label">Prowadzący:</span>
                    <span class="info-value">{reservation.slot.lecturer.get_full_name()}</span>
                </div>
            </div>

            <div class="reason-box">
                <h3>📝 Powód odrzucenia:</h3>
                <p style="margin: 0; color: #333;">{reason}</p>
            </div>

            <p style="text-align: center; color: #666;">
                Możesz spróbować zarezerwować inny dostępny termin.
            </p>

            <center>
                <a href="{settings.FRONTEND_URL}/student-reservations" class="button">
                    Zobacz Dostępne Terminy
                </a>
            </center>
        </div>

        <div class="footer">
            <p>System Rezerwacji Konsultacji AGH</p>
            <p>Ten email został wygenerowany automatycznie. Prosimy nie odpowiadać.</p>
        </div>
    </div>
</body>
</html>
            """
            subject = "❌ Rezerwacja odrzucona"
        else:
            return False

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[reservation.student.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        # Zapisz HTML do pliku (dla podglądu)
        import os
        preview_dir = os.path.join(settings.BASE_DIR, 'email_previews')
        os.makedirs(preview_dir, exist_ok=True)
        status_name = 'accepted' if reservation.status == 'accepted' else 'rejected'
        preview_path = os.path.join(preview_dir, f'student_status_{status_name}_{reservation_id}.html')
        with open(preview_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"Email o zmianie statusu wysłany do studenta: {reservation.student.email}")
        print(f"Preview zapisany: {preview_path}")
        return True

    except Exception as e:
        print(f"Błąd wysyłki emaila: {e}")
        return False


@shared_task
def auto_reject_expired_reservation(reservation_id):
    """
    Automatyczne odrzucenie rezerwacji, jeśli prowadzący nie zaakceptował w ciągu 24h
    """
    from .models import Reservation

    try:
        reservation = Reservation.objects.get(id=reservation_id)

        if reservation.status == 'pending':
            if timezone.now() - reservation.booked_at >= timezone.timedelta(hours=24):
                reservation.status = 'rejected'
                reservation.rejection_reason = (
                    "Automatyczne odrzucenie - prowadzący nie potwierdził rezerwacji w ciągu 24 godzin"
                )
                reservation.save()

                notify_student_status_change.delay(reservation_id)

                print(f"Auto-reject: Rezerwacja #{reservation_id} automatycznie odrzucona")
                return True
            else:
                print(f"Auto-reject: Rezerwacja #{reservation_id} - jeszcze nie minęło 24h")
                return False
        else:
            print(f"Auto-reject: Rezerwacja #{reservation_id} już ma status: {reservation.status}")
            return False

    except Reservation.DoesNotExist:
        print(f"Auto-reject: Rezerwacja #{reservation_id} nie istnieje")
        return False
    except Exception as e:
        print(f"Auto-reject błąd: {e}")
        return False


@shared_task
def notify_lecturer_cancellation(reservation_id):
    """
    Powiadomienie dla prowadzącego o anulowaniu rezerwacji przez studenta
    """
    from .models import Reservation

    try:
        reservation = Reservation.objects.select_related(
            'slot', 'slot__lecturer', 'student'
        ).get(id=reservation_id)

        subject = f"Student anulował rezerwację"
        message = f"""
Witaj {reservation.slot.lecturer.get_full_name()},

Student {reservation.student.get_full_name()} anulował swoją rezerwację:

Data: {reservation.slot.start_time.strftime('%Y-%m-%d')}
Godzina: {reservation.slot.start_time.strftime('%H:%M')} - {reservation.slot.end_time.strftime('%H:%M')}
Lokalizacja: {reservation.slot.meeting_location}

Miejsce zostało zwolnione dla innych studentów.

Pozdrawiamy,
System Rezerwacji Konsultacji
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[reservation.slot.lecturer.email],
            fail_silently=False,
        )

        print(f"Email o anulowaniu wysłany do prowadzącego: {reservation.slot.lecturer.email}")
        return True

    except Exception as e:
        print(f"Błąd wysyłki emaila: {e}")
        return False