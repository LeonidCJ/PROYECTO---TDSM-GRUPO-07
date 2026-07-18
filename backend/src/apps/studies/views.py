from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import EndoscopicImage, ModelConfig, Study
from .serializers import (
    EndoscopicImageSerializer,
    ModelConfigSerializer,
    StudySerializer,
)


class StudyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudySerializer

    def get_queryset(self):
        qs = (
            Study.objects.filter(doctor=self.request.user)
            .select_related("patient")
            .prefetch_related("endoscopic_images__inference_result")
            .order_by("-created_at")
        )
        # "?patient=<id>" -> the longitudinal timeline of one patient's studies.
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs

    @action(detail=True, methods=["get", "post"], url_path="images")
    def images(self, request, pk=None):
        study = self.get_object()
        if request.method == "POST":
            serializer = EndoscopicImageSerializer(
                data=request.data,
                context={"study": study, "request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        images = EndoscopicImage.objects.filter(study=study).select_related("inference_result")
        serializer = EndoscopicImageSerializer(images, many=True)
        return Response(serializer.data)


class ModelConfigViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ModelConfigSerializer
    queryset = ModelConfig.objects.all().order_by("-created_at")
