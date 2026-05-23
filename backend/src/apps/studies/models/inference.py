import uuid

from django.db import models

from .imaging import EndoscopicImage


class InferenceResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class PrimaryLabel(models.TextChoices):
        HGC = "HGC", "High Grade Cancer"
        LGC = "LGC", "Low Grade Cancer"
        NST = "NST", "Non-Specific Tissue"
        NTL = "NTL", "Normal Tissue"

    class RiskLevel(models.TextChoices):
        HIGH = "high", "High"
        MEDIUM = "medium", "Medium"
        LOW = "low", "Low"

    class CellularDensity(models.TextChoices):
        NORMAL = "normal", "Normal"
        ELEVATED = "elevated", "Elevated"
        HIGH = "high", "High"

    class NuclearAtypia(models.TextChoices):
        NONE = "none", "None"
        MILD = "mild", "Mild"
        MODERATE = "moderate", "Moderate"
        SEVERE = "severe", "Severe"

    class MitoticRate(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"

    image = models.OneToOneField(
        EndoscopicImage,
        on_delete=models.CASCADE,
        related_name="inference_result",
    )
    model_name = models.CharField(max_length=120)
    model_version = models.CharField(max_length=64)
    primary_label = models.CharField(max_length=8, choices=PrimaryLabel.choices)
    risk_level = models.CharField(max_length=8, choices=RiskLevel.choices)
    is_malignant = models.BooleanField()
    confidence_breakdown = models.JSONField()
    analyzed_parameters = models.JSONField()
    cellular_density = models.CharField(max_length=16, choices=CellularDensity.choices, blank=True)
    nuclear_atypia = models.CharField(max_length=16, choices=NuclearAtypia.choices, blank=True)
    mitotic_rate = models.CharField(max_length=16, choices=MitoticRate.choices, blank=True)
    findings_overview = models.TextField(blank=True)
    recommended_action = models.TextField(blank=True)
    mask_url = models.URLField(blank=True)
    processing_time_ms = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.image_id} - {self.primary_label}"
