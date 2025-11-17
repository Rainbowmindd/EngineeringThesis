from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router_notifications = DefaultRouter()

router_notifications.register(r'notifications',NotificationViewSet, basename='notifications')


urlpatterns = router_notifications.urls

