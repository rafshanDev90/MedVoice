from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.apps import apps
        from django.db import connection
        db_ok = True
        try:
            connection.ensure_connection()
        except Exception:
            db_ok = False

        return Response({
            'status': 'ok',
            'version': '1.0.0',
            'database': 'connected' if db_ok else 'disconnected',
            'installed_apps': [app.label for app in apps.get_app_configs()],
        })


urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]