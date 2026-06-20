from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    study_reference = serializers.CharField(source="study.reference_code", read_only=True)
    patient_name = serializers.CharField(source="study.patient.full_name", read_only=True)

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
            "generated_at",
            "updated_at",
        )
        read_only_fields = ("id", "pdf_url", "status", "generated_at", "updated_at")

    def create(self, validated_data):
        validated_data["generated_by"] = self.context["request"].user
        return super().create(validated_data)
