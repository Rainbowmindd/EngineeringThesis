from dj_rest_auth.views import PasswordResetConfirmView
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/reservations/', include('apps.reservations.urls')),
    path('api/schedules/', include('apps.schedules.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    #authentication endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/password/reset/confirm/<uid64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),


]
