from rest_framework import permissions, viewsets

from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReportSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return (
            Report.objects.filter(generated_by=self.request.user)
            .select_related("study__patient")
            .order_by("-generated_at")
        )
