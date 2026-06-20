from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.core.models import BaseUUIDModel


class ModelConfig(BaseUUIDModel):
    model_name = models.CharField(max_length=120)
    model_version = models.CharField(max_length=64)
    inference_server_url = models.URLField()
    onnx_optimization = models.BooleanField(default=True)
    is_active = models.BooleanField(default=False)
    model_file_path = models.CharField(max_length=512, blank=True)

    def __str__(self):
        return f"{self.model_name} v{self.model_version}"


class Study(BaseUUIDModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="studies",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.PROTECT,
        related_name="studies",
    )
    reference_code = models.CharField(max_length=32, unique=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    study_date = models.DateTimeField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.reference_code} - {self.patient}"


class EndoscopicImage(models.Model):
    class ImageQuality(models.TextChoices):
        GOOD = "good", "Good"
        ACCEPTABLE = "acceptable", "Acceptable"
        POOR = "poor", "Poor"

    class Source(models.TextChoices):
        CAMERA = "camera", "Camera"
        GALLERY = "gallery", "Gallery"

    id = models.UUIDField(primary_key=True, default=__import__("uuid").uuid4, editable=False)
    study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name="endoscopic_images")
    image = models.ImageField(upload_to='endoscopic/')
    original_filename = models.CharField(max_length=255, blank=True)
    file_size_mb = models.DecimalField(
        max_digits=6, decimal_places=2, validators=[MinValueValidator(0)], null=True, blank=True
    )
    width_px = models.PositiveIntegerField(null=True, blank=True)
    height_px = models.PositiveIntegerField(null=True, blank=True)
    image_quality = models.CharField(max_length=16, choices=ImageQuality.choices, blank=True)
    source = models.CharField(max_length=16, choices=Source.choices, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_filename


class InferenceResult(models.Model):
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

    id = models.UUIDField(primary_key=True, default=__import__("uuid").uuid4, editable=False)
    image = models.OneToOneField(
        EndoscopicImage, on_delete=models.CASCADE, related_name="inference_result"
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

    def __str__(self):
        return f"{self.primary_label} - {self.risk_level}"
