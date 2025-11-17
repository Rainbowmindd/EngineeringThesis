from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/reservations/', include('apps.reservations.urls')),
    path('api/schedules/', include('apps.schedules.urls')),
    path('api/notifications/', include('apps.notifications.urls'))


]
