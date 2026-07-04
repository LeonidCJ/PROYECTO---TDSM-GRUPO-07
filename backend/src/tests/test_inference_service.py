"""Unit tests for the inference client (PU-01 .. PU-05)."""
import pytest

import apps.studies.services.inference as inf
from apps.studies.services.inference import (
    InferenceFailed,
    InferenceUnavailable,
    _map_payload,
    run_inference,
)


# ── _map_payload ────────────────────────────────────────────────────────────

def test_map_payload_hgc_is_high_risk_and_malignant():
    out = _map_payload({"label": "HGC", "confidence": 0.9123, "has_cancer": True}, 1200)
    assert out["primary_label"] == "HGC"
    assert out["risk_level"] == "high"
    assert out["is_malignant"] is True
    assert out["confidence_breakdown"] == {"HGC": 0.9123}
    assert out["processing_time_ms"] == 1200


def test_map_payload_nst_is_low_risk_and_not_malignant():
    out = _map_payload({"label": "NST", "confidence": 0.49, "has_cancer": False}, 100)
    assert out["risk_level"] == "low"
    assert out["is_malignant"] is False


def test_map_payload_rounds_confidence_and_maps_lgc_to_medium():
    out = _map_payload({"label": "LGC", "confidence": 0.765432, "has_cancer": True}, 1)
    assert out["risk_level"] == "medium"
    assert out["confidence_breakdown"]["LGC"] == 0.7654


def test_map_payload_unknown_label_raises():
    with pytest.raises(InferenceFailed):
        _map_payload({"label": "XXX", "confidence": 0.5}, 1)


def test_map_payload_invalid_confidence_raises():
    with pytest.raises(InferenceFailed):
        _map_payload({"label": "HGC", "confidence": "abc"}, 1)


# ── run_inference (HTTP mockeado) ───────────────────────────────────────────

class _Resp:
    def __init__(self, status, payload=None):
        self.status_code = status
        self._payload = payload or {}

    def json(self):
        return self._payload


def test_run_inference_unavailable_on_connection_error(monkeypatch):
    def boom(*args, **kwargs):
        raise inf.requests.RequestException("sin conexión")

    monkeypatch.setattr(inf.requests, "post", boom)
    with pytest.raises(InferenceUnavailable):
        run_inference(b"bytes", "a.jpg", "image/jpeg")


def test_run_inference_unavailable_on_503(monkeypatch):
    monkeypatch.setattr(inf.requests, "post", lambda *a, **k: _Resp(503))
    with pytest.raises(InferenceUnavailable):
        run_inference(b"bytes", "a.jpg", "image/jpeg")


def test_run_inference_success_maps_payload(monkeypatch):
    monkeypatch.setattr(
        inf.requests,
        "post",
        lambda *a, **k: _Resp(200, {"label": "NTL", "confidence": 0.72, "has_cancer": False}),
    )
    out = run_inference(b"bytes", "a.jpg", "image/jpeg")
    assert out["primary_label"] == "NTL"
    assert out["is_malignant"] is False
    assert out["risk_level"] == "low"
