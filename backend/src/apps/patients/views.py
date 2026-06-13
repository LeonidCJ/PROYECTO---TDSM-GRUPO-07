from rest_framework import permissions, viewsets

from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PatientSerializer

    def get_queryset(self):
        return Patient.objects.filter(doctor=self.request.user).order_by("-created_at")
