from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import UserViewSet


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


router = DefaultRouter()
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('auth/register/', UserViewSet.as_view({'post': 'register'}), name='auth-register'),
    path('auth/login/', UserViewSet.as_view({'post': 'login'}), name='auth-login'),
    path('auth/logout/', UserViewSet.as_view({'post': 'logout'}), name='auth-logout'),
    path('auth/me/', UserViewSet.as_view({'get': 'me', 'patch': 'me'}), name='auth-me'),
    path('auth/change-password/', UserViewSet.as_view({'post': 'change_password'}), name='auth-change-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('auth/token/', TokenObtainPairView.as_view(), name='auth-token-obtain'),
    path('auth/', include(router.urls)),
]
