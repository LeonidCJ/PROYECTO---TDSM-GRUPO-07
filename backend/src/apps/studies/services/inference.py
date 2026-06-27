"""Client for the external ONNX inference server.

The inference server exposes ``POST /predict`` (multipart ``file``) and returns::

    { "has_cancer": bool, "confidence": float, "label": "HGC|LGC|NTL|NST" }

This module sends an endoscopic image to that service and maps the response to
the fields expected by :class:`apps.studies.models.InferenceResult`.
"""
from __future__ import annotations

import logging
import time

import requests
from django.conf import settings

from apps.studies.models import InferenceResult

logger = logging.getLogger(__name__)


class InferenceError(Exception):
    """Base class for inference errors."""


class InferenceUnavailable(InferenceError):
    """The model/service is temporarily unreachable (timeout, 503, connection)."""


class InferenceFailed(InferenceError):
    """The service responded but could not produce a valid prediction."""


# label -> risk level
_RISK_BY_LABEL = {
    InferenceResult.PrimaryLabel.HGC: InferenceResult.RiskLevel.HIGH,
    InferenceResult.PrimaryLabel.LGC: InferenceResult.RiskLevel.MEDIUM,
    InferenceResult.PrimaryLabel.NTL: InferenceResult.RiskLevel.LOW,
    InferenceResult.PrimaryLabel.NST: InferenceResult.RiskLevel.LOW,
}

# label -> human-readable clinical recommendation (Spanish)
_RECOMMENDATION_BY_LABEL = {
    InferenceResult.PrimaryLabel.HGC: (
        "Se recomienda evaluación especializada inmediata y confirmación "
        "histopatológica."
    ),
    InferenceResult.PrimaryLabel.LGC: (
        "Se recomienda seguimiento especializado y confirmación "
        "histopatológica."
    ),
    InferenceResult.PrimaryLabel.NTL: (
        "Lesión sin características tumorales. Se sugiere control clínico de rutina."
    ),
    InferenceResult.PrimaryLabel.NST: (
        "Tejido sin hallazgos de malignidad. Se sugiere control clínico de rutina."
    ),
}

_VALID_LABELS = set(InferenceResult.PrimaryLabel.values)


def run_inference(image_bytes: bytes, filename: str, content_type: str) -> dict:
    """Send ``image_bytes`` to the inference server and return InferenceResult kwargs.

    Raises :class:`InferenceUnavailable` if the service cannot be reached and
    :class:`InferenceFailed` if it returns an unusable response.
    """
    url = f"{settings.INFERENCE_SERVER_URL.rstrip('/')}/predict"
    files = {"file": (filename or "image.jpg", image_bytes, content_type or "image/jpeg")}

    started = time.monotonic()
    try:
        response = requests.post(url, files=files, timeout=settings.INFERENCE_TIMEOUT_SECONDS)
    except requests.RequestException as exc:
        logger.warning("Inference server unreachable: %s", exc)
        raise InferenceUnavailable(str(exc)) from exc
    elapsed_ms = int((time.monotonic() - started) * 1000)

    if response.status_code == 503:
        raise InferenceUnavailable("El modelo no está cargado en el servidor de inferencia")
    if response.status_code >= 500:
        raise InferenceUnavailable(f"Error del servidor de inferencia ({response.status_code})")
    if response.status_code >= 400:
        detail = _safe_detail(response)
        raise InferenceFailed(detail or f"Solicitud rechazada ({response.status_code})")

    try:
        payload = response.json()
    except ValueError as exc:
        raise InferenceFailed("Respuesta no válida del servidor de inferencia") from exc

    return _map_payload(payload, elapsed_ms)


def _map_payload(payload: dict, elapsed_ms: int) -> dict:
    label = str(payload.get("label", "")).upper()
    if label not in _VALID_LABELS:
        raise InferenceFailed(f"Etiqueta desconocida del modelo: {payload.get('label')!r}")

    try:
        confidence = round(float(payload.get("confidence")), 4)
    except (TypeError, ValueError) as exc:
        raise InferenceFailed("Confianza no válida en la respuesta del modelo") from exc

    is_malignant = bool(payload.get("has_cancer", label in {"HGC", "LGC"}))

    return {
        "model_name": settings.INFERENCE_MODEL_NAME,
        "model_version": settings.INFERENCE_MODEL_VERSION,
        "primary_label": label,
        "risk_level": _RISK_BY_LABEL.get(label, InferenceResult.RiskLevel.LOW),
        "is_malignant": is_malignant,
        # The current model only returns the winning class confidence.
        "confidence_breakdown": {label: confidence},
        "analyzed_parameters": {},
        "findings_overview": "",
        "recommended_action": _RECOMMENDATION_BY_LABEL.get(label, ""),
        "processing_time_ms": elapsed_ms,
    }


def _safe_detail(response: requests.Response) -> str | None:
    try:
        body = response.json()
    except ValueError:
        return None
    detail = body.get("detail") if isinstance(body, dict) else None
    if isinstance(detail, str):
        return detail
    return None
