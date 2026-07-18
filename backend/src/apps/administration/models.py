from django.conf import settings
from django.db import models

from apps.core.models import BaseUUIDModel


def _client_ip(request) -> str:
    """Best-effort client IP, honouring the proxy header set by Render."""
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        # First entry is the original client; the rest are proxies.
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "") or ""


class AuditLog(BaseUUIDModel):
    """Immutable record of security-relevant access events.

    Primarily answers "who accessed the system, when and from where", which is
    the basis for compliance traceability over health data. Rows are never
    updated or deleted through the API; they are append-only.
    """

    class Event(models.TextChoices):
        LOGIN_OK = "login_ok", "Login exitoso"
        LOGIN_FAILED = "login_failed", "Login fallido"
        LOGOUT = "logout", "Cierre de sesión"

    # Nullable: a failed login may not map to a real user.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )
    # Always store the email that was used, even when the user does not exist,
    # so failed attempts against unknown accounts are still auditable.
    email = models.EmailField(blank=True)
    event = models.CharField(max_length=32, choices=Event.choices)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=400, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["-created_at"], name="audit_created_idx"),
            models.Index(fields=["event"], name="audit_event_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.event} · {self.email or self.user_id} · {self.created_at:%Y-%m-%d %H:%M}"

    @classmethod
    def record(cls, *, request, event: str, user=None, email: str = "") -> "AuditLog":
        ip = _client_ip(request) if request is not None else None
        agent = ""
        if request is not None:
            agent = request.META.get("HTTP_USER_AGENT", "")[:400]
        return cls.objects.create(
            user=user,
            email=(email or getattr(user, "email", "") or "").lower(),
            event=event,
            ip_address=ip or None,
            user_agent=agent,
        )
