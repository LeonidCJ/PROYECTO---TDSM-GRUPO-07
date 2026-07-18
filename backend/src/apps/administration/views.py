from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.patients.models import Patient
from apps.reports.models import Report
from apps.studies.models import Study

from .models import AuditLog
from .permissions import IsAdmin
from .serializers import AdminUserSerializer, AuditLogSerializer

User = get_user_model()


class AdminPagination(PageNumberPagination):
    """Local pagination for admin lists.

    Applied per-view on purpose: the clinical endpoints (patients/studies/
    reports) return plain arrays and the mobile app depends on that, so global
    pagination must NOT be enabled.
    """

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUserViewSet(viewsets.ModelViewSet):
    """Manage users (list, create, update role/active status, delete)."""

    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    pagination_class = AdminPagination
    queryset = User.objects.all().order_by("-created_at")

    def perform_update(self, serializer):
        target = serializer.instance
        # Guard: an admin cannot demote or deactivate their own account, so they
        # can never lock themselves (or the last admin) out by accident.
        if target == self.request.user:
            new_role = serializer.validated_data.get("role", target.role)
            new_active = serializer.validated_data.get("is_active", target.is_active)
            if new_role != "admin" or not new_active:
                raise PermissionDenied("No puedes quitarte tu propio rol de administrador ni desactivarte.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise PermissionDenied("No puedes eliminar tu propia cuenta.")
        instance.delete()


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access log: who entered the system, when and from where."""

    permission_classes = [IsAdmin]
    serializer_class = AuditLogSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = AuditLog.objects.select_related("user").order_by("-created_at")
        event = self.request.query_params.get("event")
        if event:
            qs = qs.filter(event=event)
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs


class MetricsView(APIView):
    """Aggregated system metrics for the admin dashboard."""

    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        users_by_role = {
            row["role"]: row["total"]
            for row in User.objects.values("role").annotate(total=Count("id"))
        }
        studies_by_status = {
            row["status"]: row["total"]
            for row in Study.objects.values("status").annotate(total=Count("id"))
        }
        data = {
            "users": {
                "total": User.objects.count(),
                "active": User.objects.filter(is_active=True).count(),
                "by_role": users_by_role,
            },
            "patients": Patient.objects.count(),
            "studies": {
                "total": Study.objects.count(),
                "by_status": studies_by_status,
            },
            "reports": Report.objects.count(),
            "recent_logins": AuditLogSerializer(
                AuditLog.objects.filter(event=AuditLog.Event.LOGIN_OK).select_related("user")[:10],
                many=True,
            ).data,
        }
        return Response(data, status=status.HTTP_200_OK)
