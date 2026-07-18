from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminUserViewSet, AuditLogViewSet, MetricsView

router = DefaultRouter()
router.register("admin/users", AdminUserViewSet, basename="admin-users")
router.register("admin/audit", AuditLogViewSet, basename="admin-audit")

urlpatterns = [
    path("admin/metrics/", MetricsView.as_view(), name="admin-metrics"),
]

urlpatterns += router.urls
