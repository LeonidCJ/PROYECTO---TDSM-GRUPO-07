from rest_framework import serializers

from .models import EndoscopicImage, InferenceResult, ModelConfig, Study


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
    inference_result = InferenceResultSerializer(read_only=True)

    class Meta:
        model = EndoscopicImage
        fields = (
            "id",
            "file_path",
            "original_filename",
            "file_size_mb",
            "width_px",
            "height_px",
            "image_quality",
            "source",
            "uploaded_at",
            "inference_result",
        )
        read_only_fields = ("id", "uploaded_at", "inference_result")

    def create(self, validated_data):
        validated_data["study"] = self.context["study"]
        return super().create(validated_data)


class StudySerializer(serializers.ModelSerializer):
    endoscopic_images = EndoscopicImageSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

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
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "reference_code", "created_at", "updated_at")

    def create(self, validated_data):
        validated_data["doctor"] = self.context["request"].user
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
