from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .dashboard_views import dashboard_stats

router = DefaultRouter()
router.register(r'reports', views.MedicalReportViewSet, basename='report')
router.register(r'transcriptions', views.TranscriptionViewSet, basename='transcription')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
]
