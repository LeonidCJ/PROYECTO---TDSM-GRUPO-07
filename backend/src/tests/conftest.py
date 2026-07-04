import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.patients.models import Patient
from apps.studies.models import EndoscopicImage, InferenceResult, Study


@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(
        email="doctor@test.com",
        password="secret123",
        first_name="Ana",
        last_name="Torres",
        hospital="Hospital Central",
        specialty="urology",
    )


@pytest.fixture
def patient(db, user):
    return Patient.objects.create(
        doctor=user,
        patient_code="PAC-001",
        full_name="Juan Pérez",
        gender="male",
    )


@pytest.fixture
def study(db, user, patient):
    return Study.objects.create(
        doctor=user,
        patient=patient,
        study_date=timezone.now(),
    )


@pytest.fixture
def study_with_inference(db, study):
    image = EndoscopicImage.objects.create(study=study, original_filename="endo.jpg")
    InferenceResult.objects.create(
        image=image,
        model_name="cystoai-onnx",
        model_version="1.0.0",
        primary_label="LGC",
        risk_level="medium",
        is_malignant=True,
        confidence_breakdown={"LGC": 0.8123},
        analyzed_parameters={},
        processing_time_ms=1500,
    )
    return study
