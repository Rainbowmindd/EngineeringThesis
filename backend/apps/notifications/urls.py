from django.urls import path
from .views import NotificationViewSet

send_sms = NotificationViewSet.as_view({'post': 'send_sms'})
send_email = NotificationViewSet.as_view({'post': 'send_email'})

urlpatterns = [
    path('send_sms/', send_sms, name='send-sms'),
    path('send_email/',send_email, name='send-email')
]
