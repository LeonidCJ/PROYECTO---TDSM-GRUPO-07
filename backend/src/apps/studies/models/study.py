from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import BaseUUIDModel


class Study(BaseUUIDModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.PROTECT,
        related_name="studies",
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="studies",
    )
    reference_code = models.CharField(max_length=32, unique=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    study_date = models.DateTimeField()
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_code:
            year = (self.study_date or timezone.now()).year
            sequence = (
                Study.objects.filter(reference_code__startswith=f"CY-{year}-").count() + 1
            )
            self.reference_code = f"CY-{year}-{sequence:04d}"
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.reference_code
