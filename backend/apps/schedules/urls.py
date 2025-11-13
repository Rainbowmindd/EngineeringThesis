from rest_framework.routers import DefaultRouter
from .views import LecturerSlotViewSet, PublicAvailableSlotViewSet

router=DefaultRouter()

router.register(r'lecturer-slots', LecturerSlotViewSet, basename='slots')
router.register(r'public-available-slots', PublicAvailableSlotViewSet, basename='public-slots')

urlpatterns=router.urls
