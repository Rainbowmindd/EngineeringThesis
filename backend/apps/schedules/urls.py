from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import LecturerSlotViewSet, PublicAvailableSlotViewSet, LecturerCalendarViewSet, ScheduleExportView, \
    ScheduleImportView

router=DefaultRouter()

router.register(r'lecturer-slots', LecturerSlotViewSet, basename='slots')
router.register(r'public-available-slots', PublicAvailableSlotViewSet, basename='public-slots')
router.register(r'calendar',LecturerCalendarViewSet , basename='calendar')



urlpatterns=router.urls + [
    #export to csv  get api/schedules/export/
    path(
        'export/',
        ScheduleExportView.as_view(),
        name='schedule-export-csv'
    ),

    path(
        'import/',
        ScheduleImportView.as_view(),
        name='schedule-import-csv'
    )
]
