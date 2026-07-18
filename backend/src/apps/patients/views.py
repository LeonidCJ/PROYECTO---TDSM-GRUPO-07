from django.utils import timezone
from rest_framework import filters, permissions, viewsets

from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PatientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["full_name", "patient_code"]

    def get_queryset(self):
        # Only the doctor's own, non-archived patients by default.
        qs = Patient.objects.filter(doctor=self.request.user, is_archived=False)
        # "?followup=due" -> patients whose next scheduled control is today or past.
        if self.request.query_params.get("followup") == "due":
            qs = qs.filter(next_followup_date__lte=timezone.localdate())
        return qs.order_by("-created_at")

    def perform_destroy(self, instance):
        # Soft-delete: clinical records are archived, not removed (studies
        # reference the patient with PROTECT and history must be preserved).
        instance.is_archived = True
        instance.save(update_fields=["is_archived", "updated_at"])
