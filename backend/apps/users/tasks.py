from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


@shared_task
def send_password_reset_email(user_id, uid, token):
    """
    Wysyła email z linkiem do resetu hasła
    """
    try:
        user = User.objects.get(pk=user_id)

        # Link do resetu hasła (frontend)
        reset_link = f"{settings.FRONTEND_URL}/password-reset-confirm/{uid}/{token}/"

        # Plain text wersja
        text_content = f"""
Witaj {user.get_full_name() or user.username},

Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.

Kliknij w poniższy link, aby ustawić nowe hasło:
{reset_link}

Link jest ważny przez 1 godzinę.

Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.

Pozdrawiamy,
System Rezerwacji Konsultacji AGH
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .icon {{
            text-align: center;
            font-size: 64px;
            margin: 20px 0;
        }}
        .message {{
            text-align: center;
            color: #333;
            font-size: 16px;
            line-height: 1.6;
            margin: 20px 0;
        }}
        .button-container {{
            text-align: center;
            margin: 30px 0;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
        }}
        .button:hover {{
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }}
        .warning-box {{
            background-color: #FFF3E0;
            border-left: 4px solid #FF9800;
            padding: 15px;
            margin: 25px 0;
            border-radius: 8px;
        }}
        .warning-box p {{
            margin: 0;
            color: #F57C00;
            font-size: 14px;
        }}
        .security-note {{
            background-color: #F5F5F5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
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
            <h1>Reset Hasła</h1>
        </div>

        <div class="content">
            <div class="icon"></div>

            <p style="text-align: center; font-size: 18px; color: #333;">
                Witaj <strong>{user.get_full_name() or user.username}</strong>!
            </p>

            <div class="message">
                <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w systemie rezerwacji konsultacji.</p>
            </div>

            <div class="button-container">
                <a href="{reset_link}" class="button">
                    Zresetuj Hasło
                </a>
            </div>

            <div class="warning-box">
                <p> <strong>Ważne:</strong> Link jest ważny przez 1 godzinę od otrzymania tej wiadomości.</p>
            </div>

            <div class="security-note">
                <p><strong>Wskazówki bezpieczeństwa:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Nie udostępniaj tego linku nikomu</li>
                    <li>Wybierz silne, unikalne hasło</li>
                    <li>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość</li>
                </ul>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:
            </p>
            <p style="text-align: center; word-break: break-all; color: #667eea; font-size: 12px;">
                {reset_link}
            </p>
        </div>

        <div class="footer">
            <p>System Rezerwacji Konsultacji AGH</p>
            <p>Ten email został wygenerowany automatycznie. Prosimy nie odpowiadać.</p>
        </div>
    </div>
</body>
</html>
        """

        # Wyślij email
        msg = EmailMultiAlternatives(
            subject="Reset hasła - System Rezerwacji Konsultacji",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        # Zapisz HTML do pliku (dla podglądu)
        import os
        preview_dir = os.path.join(settings.BASE_DIR, 'email_previews')
        os.makedirs(preview_dir, exist_ok=True)
        preview_path = os.path.join(preview_dir, f'password_reset_{user_id}.html')
        with open(preview_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"Email reset hasła wysłany do: {user.email}")
        print(f"Preview zapisany: {preview_path}")
        return True

    except User.DoesNotExist:
        print(f"Użytkownik #{user_id} nie istnieje")
        return False
    except Exception as e:
        print(f"Błąd wysyłki emaila: {e}")
        return False


@shared_task
def send_password_reset_success_email(user_id):
    """
    Wysyła potwierdzenie że hasło zostało zmienione
    """
    try:
        user = User.objects.get(pk=user_id)

        text_content = f"""
Witaj {user.get_full_name() or user.username},

Twoje hasło zostało pomyślnie zmienione.

Jeśli to nie Ty zmieniłeś hasło, natychmiast skontaktuj się z administratorem systemu.

Data zmiany: {timezone.now().strftime('%Y-%m-%d %H:%M')}

Pozdrawiamy,
System Rezerwacji Konsultacji AGH
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
        .success-message {{
            background-color: #E8F5E9;
            border: 2px solid #4CAF50;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
        }}
        .success-message p {{
            margin: 0;
            color: #2E7D32;
            font-weight: 600;
            font-size: 16px;
        }}
        .info-box {{
            background-color: #FFF3E0;
            border-left: 4px solid #FF9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .info-box p {{
            margin: 0;
            color: #F57C00;
            font-size: 14px;
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
            <h1>Hasło Zmienione</h1>
        </div>

        <div class="content">
            <div class="success-icon"></div>

            <p style="text-align: center; font-size: 18px; color: #333;">
                Witaj <strong>{user.get_full_name() or user.username}</strong>!
            </p>

            <div class="success-message">
                <p>Twoje hasło zostało pomyślnie zmienione</p>
            </div>

            <p style="text-align: center; color: #666; margin: 20px 0;">
                Od teraz możesz logować się do systemu używając nowego hasła.
            </p>

            <div class="info-box">
                <p> <strong>Uwaga:</strong> Jeśli to nie Ty zmieniłeś hasło, natychmiast skontaktuj się z administratorem systemu!</p>
            </div>

            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                Data zmiany: {timezone.now().strftime('%Y-%m-%d %H:%M')}
            </p>
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
            subject="Hasło zostało zmienione - System Rezerwacji Konsultacji",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        # Zapisz preview
        import os
        preview_dir = os.path.join(settings.BASE_DIR, 'email_previews')
        os.makedirs(preview_dir, exist_ok=True)
        preview_path = os.path.join(preview_dir, f'password_reset_success_{user_id}.html')
        with open(preview_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"Email potwierdzenia zmiany hasła wysłany do: {user.email}")
        print(f"Preview zapisany: {preview_path}")
        return True

    except User.DoesNotExist:
        print(f"Użytkownik #{user_id} nie istnieje")
        return False
    except Exception as e:
        print(f"Błąd wysyłki emaila: {e}")
        return False