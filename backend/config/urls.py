from dj_rest_auth.views import PasswordResetConfirmView
from django.contrib import admin
from django.urls import path,include

from apps.users.views import PasswordResetRequestView

urlpatterns = [
    path('api/users/', include('apps.users.urls')),
    path('api/admin/', include('apps.users.admin_urls')),
    path('api/reservations/', include('apps.reservations.urls')),
    path('api/schedules/', include('apps.schedules.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    #authentication endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    # path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # path('password-reset/', PasswordResetRequestView.as_view()),
    # path('password-reset-confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view())
    # path('api/auth/social/',include('apps.users.urls'))
]
