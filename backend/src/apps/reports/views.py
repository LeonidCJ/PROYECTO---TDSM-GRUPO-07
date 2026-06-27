from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from .models import Report
from .serializers import ReportSerializer
from .services import ReportGenerationError, build_and_store_report


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

    def create(self, request, *args, **kwargs):
        # A study has at most one report (OneToOne). Make this idempotent:
        # return the existing report, regenerating the PDF if it is missing.
        study_id = request.data.get("study")
        existing = (
            Report.objects.filter(study_id=study_id, generated_by=request.user).first()
            if study_id
            else None
        )
        if existing:
            if existing.status != Report.Status.READY or not existing.pdf_url:
                self._safe_generate(existing)
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        report = serializer.save()
        self._safe_generate(report)

    @staticmethod
    def _safe_generate(report):
        try:
            build_and_store_report(report)
        except ReportGenerationError:
            # Status is already set to ERROR inside the service; the client
            # can surface a retry without the whole request failing.
            pass
