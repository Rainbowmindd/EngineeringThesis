import os

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings

# Twilio
from twilio.rest import Client

# SendGrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, MailSettings, SandBoxMode

class NotificationViewSet(viewsets.ViewSet):

    # === SEND SMS (Twilio) ===
    @action(detail=False, methods=['post'])
    def send_sms(self, request):
        to = request.data.get('to')
        message_body = request.data.get('message')

        if not to or not message_body:
            return Response({"error": "Brakuje numeru lub wiadomości"}, status=400)

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        if getattr(settings, 'TWILIO_MESSAGING_SERVICE_SID', None):
            message = client.messages.create(
                body=message_body,
                messaging_service_sid=settings.TWILIO_MESSAGING_SERVICE_SID,
                to=to
            )
        else:
            message = client.messages.create(
                body=message_body,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to
            )

        return Response({"sid": message.sid, "status": message.status})

    # === SEND EMAIL (SendGrid Dynamic Template + Sandbox Mode) ===
    @action(detail=False, methods=['post'])
    def send_email(self, request):
        to_email = request.data.get('to')  # odbiorca maila

        if not to_email:
            return Response({"error": "Brakuje pola 'to'"}, status=400)

        # -------------------------------
        # 1️⃣ SendGrid Mail w sandbox mode
        # -------------------------------
        message = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_emails=to_email
        )
        message.template_id = 'd-9f795e078aef480585db7bf00630aa88'
        message.dynamic_template_data = {
            "email": to_email,
            "message": "Twoja konsultacja odbędzie się jutro i to przypomnienie :)"
        }

        # Sandbox mode
        mail_settings = MailSettings()
        mail_settings.sandbox_mode = SandBoxMode(True)
        message.mail_settings = mail_settings

        try:
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        # ---------------------------------
        # 2️⃣ Generowanie lokalnego preview
        # ---------------------------------
        html_template = f"""
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Przypomnienie o konsultacji</title>
                <style>
                  body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    padding: 20px;
                  }}
                  .container {{
                    max-width: 600px;
                    margin: auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                  }}
                  .header {{
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                  }}
                  .button {{
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                  }}
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>Przypomnienie o konsultacji</h2>
                  </div>
                  <p>Witaj {to_email}!</p>
                  <p>Twoja konsultacja odbędzie się jutro :)</p>
                  <a class="button" href="#">Sprawdź konsultację</a>
                  <hr>
                  <p style="font-size: 12px; color: #999999;">
                    Zespół Konsultacje AGH
                  </p>
                </div>
              </body>
            </html>
            """

        preview_path = os.path.join(os.getcwd(), "mail_preview.html")
        with open(preview_path, "w", encoding="utf-8") as f:
            f.write(html_template)

        return Response({
            "status_code": response.status_code,
            "preview_html": preview_path,
            "message": "Mail wygenerowany w sandbox mode i zapisany do mail_preview.html"
        })
