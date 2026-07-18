from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PatientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["full_name", "patient_code"]

    def get_queryset(self):
        # "?archived=true" lists the archived patients instead of the active ones.
        archived = self.request.query_params.get("archived") == "true"
        qs = Patient.objects.filter(doctor=self.request.user, is_archived=archived)
        # "?followup=due" -> patients whose next scheduled control is today or past.
        if self.request.query_params.get("followup") == "due":
            qs = qs.filter(next_followup_date__lte=timezone.localdate())
        return qs.order_by("-created_at")

    def perform_destroy(self, instance):
        # Soft-delete: clinical records are archived, not removed (studies
        # reference the patient with PROTECT and history must be preserved).
        instance.is_archived = True
        instance.save(update_fields=["is_archived", "updated_at"])

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        # Un-archive. Queried directly (not via get_queryset, which hides
        # archived patients by default).
        patient = get_object_or_404(Patient, pk=pk, doctor=request.user, is_archived=True)
        patient.is_archived = False
        patient.save(update_fields=["is_archived", "updated_at"])
        return Response(self.get_serializer(patient).data)
