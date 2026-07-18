from datetime import date

from rest_framework import serializers

from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(min_value=0, max_value=130, write_only=True, required=False)
    computed_age = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Patient
        fields = (
            "id",
            "patient_code",
            "full_name",
            "age",
            "computed_age",
            "gender",
            "smoking_status",
            "has_previous_bladder_cancer",
            "hematuria_type",
            "occupational_exposure",
            "next_followup_date",
            "is_archived",
            "created_at",
        )
        read_only_fields = ("id", "is_archived", "created_at")

    def get_computed_age(self, obj):
        if obj.birth_date:
            return obj.age
        return None

    def validate(self, attrs):
        age = attrs.pop("age", None)
        if age is not None:
            today = date.today()
            attrs["birth_date"] = date(today.year - age, today.month, today.day)
        return attrs

    def create(self, validated_data):
        validated_data["doctor"] = self.context["request"].user
        return super().create(validated_data)
