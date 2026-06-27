import logging

from django.utils import timezone
from rest_framework import serializers

from .models import EndoscopicImage, InferenceResult, ModelConfig, Study
from .services import InferenceError, run_inference

logger = logging.getLogger(__name__)


class InferenceResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = InferenceResult
        fields = (
            "id",
            "model_name",
            "model_version",
            "primary_label",
            "risk_level",
            "is_malignant",
            "confidence_breakdown",
            "analyzed_parameters",
            "cellular_density",
            "nuclear_atypia",
            "mitotic_rate",
            "findings_overview",
            "recommended_action",
            "mask_url",
            "processing_time_ms",
            "created_at",
        )
        read_only_fields = fields


class EndoscopicImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True)
    image_url = serializers.SerializerMethodField()
    inference_result = InferenceResultSerializer(read_only=True)

    class Meta:
        model = EndoscopicImage
        fields = (
            "id",
            "image",
            "image_url",
            "original_filename",
            "image_quality",
            "source",
            "uploaded_at",
            "inference_result",
        )
        read_only_fields = ("id", "uploaded_at", "inference_result", "image_url", "original_filename")

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None

    def create(self, validated_data):
        image_file = validated_data.pop('image')
        study = self.context['study']
        validated_data['study'] = study
        validated_data['original_filename'] = image_file.name
        validated_data['file_size_mb'] = round(image_file.size / (1024 * 1024), 4)

        # Capture the raw bytes for inference before the storage backend
        # (Cloudinary) consumes the upload stream during save().
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)

        instance = EndoscopicImage(image=image_file, **validated_data)
        instance.save()

        content_type = getattr(image_file, 'content_type', '') or 'image/jpeg'
        self._run_inference(study, instance, image_bytes, image_file.name, content_type)
        return instance

    @staticmethod
    def _run_inference(study, image, image_bytes, filename, content_type):
        """Run inference synchronously and persist the result.

        On failure the image is kept and the study is left in progress so it can
        be re-analyzed later; the client renders the "unavailable" state.
        """
        try:
            result_kwargs = run_inference(image_bytes, filename, content_type)
        except InferenceError as exc:
            logger.warning("Inference unavailable for image %s: %s", image.id, exc)
            if study.status != Study.Status.IN_PROGRESS:
                study.status = Study.Status.IN_PROGRESS
                study.save(update_fields=["status", "updated_at"])
            return

        InferenceResult.objects.create(image=image, **result_kwargs)
        study.status = Study.Status.COMPLETED
        study.save(update_fields=["status", "updated_at"])


class StudySerializer(serializers.ModelSerializer):
    endoscopic_images = EndoscopicImageSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    study_date = serializers.DateTimeField(required=False)
    inference_result = serializers.SerializerMethodField()

    class Meta:
        model = Study
        fields = (
            "id",
            "reference_code",
            "patient",
            "patient_name",
            "status",
            "study_date",
            "notes",
            "endoscopic_images",
            "inference_result",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "reference_code", "created_at", "updated_at")

    def get_inference_result(self, obj):
        """Convenience: the inference of the most recent image, flattened."""
        images = list(obj.endoscopic_images.all())
        if not images:
            return None
        latest = max(images, key=lambda img: img.uploaded_at)
        try:
            result = latest.inference_result
        except InferenceResult.DoesNotExist:
            return None
        return InferenceResultSerializer(result).data

    def create(self, validated_data):
        validated_data["doctor"] = self.context["request"].user
        validated_data.setdefault("study_date", timezone.now())
        return super().create(validated_data)


class ModelConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelConfig
        fields = (
            "id",
            "model_name",
            "model_version",
            "inference_server_url",
            "onnx_optimization",
            "is_active",
            "model_file_path",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
