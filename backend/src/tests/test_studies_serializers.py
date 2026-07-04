"""Unit tests for studies serializers (PU-06 .. PU-08)."""
import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

import apps.studies.serializers as serializers_module
from apps.studies.models import Study
from apps.studies.serializers import EndoscopicImageSerializer, StudySerializer


def _png_upload():
    buf = io.BytesIO()
    Image.new("RGB", (12, 12), (120, 120, 120)).save(buf, "PNG")
    return SimpleUploadedFile("endo.png", buf.getvalue(), content_type="image/png")


_FAKE_RESULT = {
    "model_name": "cystoai-onnx",
    "model_version": "1.0.0",
    "primary_label": "NTL",
    "risk_level": "low",
    "is_malignant": False,
    "confidence_breakdown": {"NTL": 0.7},
    "analyzed_parameters": {},
    "findings_overview": "",
    "recommended_action": "Control de rutina.",
    "processing_time_ms": 10,
}


@pytest.mark.django_db
def test_image_serializer_creates_inference_result(study, monkeypatch):
    # PU-06: la subida crea el InferenceResult y completa el estudio.
    monkeypatch.setattr(serializers_module, "run_inference", lambda *a, **k: dict(_FAKE_RESULT))

    serializer = EndoscopicImageSerializer(
        data={"image": _png_upload()},
        context={"study": study},
    )
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()

    assert instance.inference_result.primary_label == "NTL"
    study.refresh_from_db()
    assert study.status == Study.Status.COMPLETED


@pytest.mark.django_db
def test_image_serializer_keeps_image_when_inference_fails(study, monkeypatch):
    # PU-07: si la inferencia falla, la imagen se guarda y el estudio queda in_progress.
    def boom(*args, **kwargs):
        raise serializers_module.InferenceError("no disponible")

    monkeypatch.setattr(serializers_module, "run_inference", boom)

    serializer = EndoscopicImageSerializer(
        data={"image": _png_upload()},
        context={"study": study},
    )
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()

    assert not hasattr(instance, "inference_result") or instance.inference_result is None
    study.refresh_from_db()
    assert study.status == Study.Status.IN_PROGRESS


@pytest.mark.django_db
def test_study_serializer_exposes_flat_inference_result(study_with_inference):
    # PU-08: el StudySerializer expone el resultado del último análisis.
    data = StudySerializer(study_with_inference).data
    assert data["inference_result"]["primary_label"] == "LGC"
    assert data["inference_result"]["is_malignant"] is True


@pytest.mark.django_db
def test_study_generates_reference_code(study):
    assert study.reference_code.startswith("CY-")
