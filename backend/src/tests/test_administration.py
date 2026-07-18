import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.administration.models import AuditLog

User = get_user_model()

REGISTER_URL = "/api/v1/auth/register/"
LOGIN_URL = "/api/v1/auth/login/"
USERS_URL = "/api/v1/admin/users/"
AUDIT_URL = "/api/v1/admin/audit/"
METRICS_URL = "/api/v1/admin/metrics/"


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@test.com",
        password="secret123",
        first_name="Root",
        last_name="Admin",
        role="admin",
    )


@pytest.fixture
def api():
    return APIClient()


# --- Security: privilege escalation is closed -------------------------------

def test_public_register_cannot_grant_admin_role(api, db):
    resp = api.post(
        REGISTER_URL,
        {
            "email": "hacker@test.com",
            "password": "supersecret",
            "first_name": "Eve",
            "last_name": "Hacker",
            "role": "admin",  # must be ignored
        },
        format="json",
    )
    assert resp.status_code == 201
    created = User.objects.get(email="hacker@test.com")
    assert created.role == "doctor"


# --- Audit log capture ------------------------------------------------------

def test_successful_login_is_audited(api, user):
    resp = api.post(LOGIN_URL, {"email": user.email, "password": "secret123"}, format="json")
    assert resp.status_code == 200
    event = AuditLog.objects.get(event=AuditLog.Event.LOGIN_OK)
    assert event.user == user
    assert event.email == user.email


def test_failed_login_is_audited(api, user):
    resp = api.post(LOGIN_URL, {"email": user.email, "password": "wrong"}, format="json")
    assert resp.status_code == 401
    event = AuditLog.objects.get(event=AuditLog.Event.LOGIN_FAILED)
    assert event.email == user.email
    assert event.user is None


# --- Role-based access control ---------------------------------------------

def test_doctor_cannot_access_admin_users(api, user):
    api.force_authenticate(user=user)
    assert api.get(USERS_URL).status_code == 403


def test_admin_can_list_users(api, admin_user, user):
    api.force_authenticate(user=admin_user)
    resp = api.get(USERS_URL)
    assert resp.status_code == 200
    # Paginated response.
    assert resp.data["count"] >= 2


def test_admin_can_change_user_role(api, admin_user, user):
    api.force_authenticate(user=admin_user)
    resp = api.patch(f"{USERS_URL}{user.id}/", {"role": "admin"}, format="json")
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.role == "admin"


def test_admin_cannot_demote_self(api, admin_user):
    api.force_authenticate(user=admin_user)
    resp = api.patch(f"{USERS_URL}{admin_user.id}/", {"role": "doctor"}, format="json")
    assert resp.status_code == 403
    admin_user.refresh_from_db()
    assert admin_user.role == "admin"


def test_admin_cannot_deactivate_self(api, admin_user):
    api.force_authenticate(user=admin_user)
    resp = api.patch(f"{USERS_URL}{admin_user.id}/", {"is_active": False}, format="json")
    assert resp.status_code == 403


# --- Metrics & audit endpoints ---------------------------------------------

def test_metrics_endpoint(api, admin_user, study):
    api.force_authenticate(user=admin_user)
    resp = api.get(METRICS_URL)
    assert resp.status_code == 200
    assert resp.data["users"]["total"] >= 1
    assert resp.data["patients"]["active"] >= 1
    assert resp.data["patients"]["total"] >= 1
    assert resp.data["studies"]["total"] >= 1


def test_audit_endpoint_lists_and_filters(api, admin_user, user):
    # Generate one success and one failure.
    api.post(LOGIN_URL, {"email": user.email, "password": "secret123"}, format="json")
    api.post(LOGIN_URL, {"email": user.email, "password": "nope"}, format="json")

    api.force_authenticate(user=admin_user)
    resp = api.get(AUDIT_URL)
    assert resp.status_code == 200
    assert resp.data["count"] >= 2

    filtered = api.get(f"{AUDIT_URL}?event=login_failed")
    assert filtered.status_code == 200
    assert all(row["event"] == "login_failed" for row in filtered.data["results"])
