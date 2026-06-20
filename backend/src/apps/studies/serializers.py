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
        validated_data['study'] = self.context['study']
        validated_data['original_filename'] = image_file.name
        validated_data['file_size_mb'] = round(image_file.size / (1024 * 1024), 4)
        instance = EndoscopicImage(image=image_file, **validated_data)
        instance.save()
        return instance


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
