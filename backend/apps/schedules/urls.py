from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import LecturerSlotViewSet, PublicAvailableSlotViewSet, LecturerCalendarViewSet, ScheduleExportView, \
    ScheduleImportView, BlockedTimeViewSet, TimeWindowViewSet

router=DefaultRouter()

router.register(r'lecturer-slots', LecturerSlotViewSet, basename='slots')
router.register(r'public-available-slots', PublicAvailableSlotViewSet, basename='public-slots')
# router.register(r'calendar',TimeWindowViewSet , basename='calendar')

router.register(r'calendar/time-windows', TimeWindowViewSet, basename='time-windows')
router.register(r'calendar/blocked-times', BlockedTimeViewSet, basename='blocked-times')


urlpatterns=router.urls + [
    #export to csv  get api/schedules/export/
    path(
        'export/',
        ScheduleExportView.as_view(),
        name='schedule-export-ical'
    ),

    path(
        'import/',
        ScheduleImportView.as_view(),
        name='schedule-import-ical'
    )
]
