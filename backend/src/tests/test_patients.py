from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.patients.models import Patient
from apps.studies.models import Study

PATIENTS_URL = "/api/v1/patients/"
STUDIES_URL = "/api/v1/studies/"


@pytest.fixture
def api(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_patient_can_be_edited(api, patient):
    resp = api.patch(f"{PATIENTS_URL}{patient.id}/", {"full_name": "Juan P. Actualizado"}, format="json")
    assert resp.status_code == 200
    patient.refresh_from_db()
    assert patient.full_name == "Juan P. Actualizado"


def test_clinical_factors_can_be_set(api, patient):
    resp = api.patch(
        f"{PATIENTS_URL}{patient.id}/",
        {"smoking_status": "former", "hematuria_type": "macroscopic", "occupational_exposure": True},
        format="json",
    )
    assert resp.status_code == 200
    patient.refresh_from_db()
    assert patient.smoking_status == "former"
    assert patient.hematuria_type == "macroscopic"
    assert patient.occupational_exposure is True


def test_followup_date_can_be_set(api, patient):
    resp = api.patch(f"{PATIENTS_URL}{patient.id}/", {"next_followup_date": "2026-09-01"}, format="json")
    assert resp.status_code == 200
    patient.refresh_from_db()
    assert str(patient.next_followup_date) == "2026-09-01"


def test_delete_archives_instead_of_removing(api, patient):
    resp = api.delete(f"{PATIENTS_URL}{patient.id}/")
    assert resp.status_code == 204
    patient.refresh_from_db()
    assert patient.is_archived is True  # still in the DB
    # ...and no longer listed
    listed = api.get(PATIENTS_URL)
    assert all(p["id"] != str(patient.id) for p in listed.data)


def test_search_filters_patients(api, user):
    Patient.objects.create(doctor=user, patient_code="PAC-A", full_name="Ana Gomez", gender="female")
    Patient.objects.create(doctor=user, patient_code="PAC-B", full_name="Beto Ruiz", gender="male")
    resp = api.get(f"{PATIENTS_URL}?search=Ana")
    assert resp.status_code == 200
    names = [p["full_name"] for p in resp.data]
    assert "Ana Gomez" in names and "Beto Ruiz" not in names


def test_followup_due_filter(api, user):
    due = Patient.objects.create(
        doctor=user, patient_code="PAC-DUE", full_name="Control Vencido", gender="male",
        next_followup_date=timezone.localdate() - timedelta(days=1),
    )
    Patient.objects.create(
        doctor=user, patient_code="PAC-FUT", full_name="Control Futuro", gender="male",
        next_followup_date=timezone.localdate() + timedelta(days=30),
    )
    resp = api.get(f"{PATIENTS_URL}?followup=due")
    ids = [p["id"] for p in resp.data]
    assert str(due.id) in ids and len(ids) == 1


def test_studies_filtered_by_patient(api, user, patient, study):
    other = Patient.objects.create(doctor=user, patient_code="PAC-OTRO", full_name="Otro", gender="male")
    Study.objects.create(doctor=user, patient=other, study_date=timezone.now())

    resp = api.get(f"{STUDIES_URL}?patient={patient.id}")
    assert resp.status_code == 200
    assert len(resp.data) == 1
    assert str(resp.data[0]["patient"]) == str(patient.id)


def test_study_notes_can_be_edited(api, study):
    resp = api.patch(f"{STUDIES_URL}{study.id}/", {"notes": "Lesión papilar, controlar en 3 meses"}, format="json")
    assert resp.status_code == 200
    study.refresh_from_db()
    assert study.notes == "Lesión papilar, controlar en 3 meses"
