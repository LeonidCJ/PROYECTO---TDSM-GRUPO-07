import uuid

from django.conf import settings
from django.db import models


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Status(models.TextChoices):
        GENERATING = "generating", "Generating"
        READY = "ready", "Ready"
        ERROR = "error", "Error"

    study = models.OneToOneField(
        "studies.Study",
        on_delete=models.CASCADE,
        related_name="report",
    )
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reports",
    )
    reference_code = models.CharField(max_length=32)
    institution_name = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True)
    include_images = models.BooleanField(default=True)
    send_to_ehr = models.BooleanField(default=False)
    physician_signature = models.BooleanField(default=False)
    pdf_url = models.URLField(blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.GENERATING)
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.reference_code
