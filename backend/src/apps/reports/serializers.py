from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    study_reference = serializers.CharField(source="study.reference_code", read_only=True)
    patient_name = serializers.CharField(source="study.patient.full_name", read_only=True)
    institution_name = serializers.CharField(required=False, allow_blank=True)
    result_summary = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = (
            "id",
            "study",
            "study_reference",
            "patient_name",
            "reference_code",
            "institution_name",
            "department",
            "include_images",
            "send_to_ehr",
            "physician_signature",
            "pdf_url",
            "status",
            "result_summary",
            "generated_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "reference_code",
            "pdf_url",
            "status",
            "result_summary",
            "generated_at",
            "updated_at",
        )

    def get_result_summary(self, obj):
        """Self-contained snapshot of the study's latest inference for the UI."""
        image = (
            obj.study.endoscopic_images.select_related("inference_result")
            .order_by("-uploaded_at")
            .first()
        )
        if image is None:
            return None
        inference = getattr(image, "inference_result", None)
        if inference is None:
            return {"image_url": image.image.url if image.image else None}
        confidence = inference.confidence_breakdown.get(inference.primary_label)
        return {
            "primary_label": inference.primary_label,
            "risk_level": inference.risk_level,
            "is_malignant": inference.is_malignant,
            "confidence": confidence,
            "recommended_action": inference.recommended_action,
            "image_url": image.image.url if image.image else None,
        }

    def validate_study(self, study):
        request = self.context.get("request")
        if request and study.doctor_id != request.user.id:
            raise serializers.ValidationError("El estudio no pertenece al usuario.")
        return study

    def create(self, validated_data):
        user = self.context["request"].user
        study = validated_data["study"]
        validated_data["generated_by"] = user
        if not validated_data.get("institution_name"):
            validated_data["institution_name"] = user.hospital or "Centro médico"
        validated_data["reference_code"] = f"INF-{study.reference_code}"[:32]
        return super().create(validated_data)
