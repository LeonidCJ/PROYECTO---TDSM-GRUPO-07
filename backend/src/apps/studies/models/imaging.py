import uuid

from django.core.validators import MinValueValidator
from django.db import models

from .study import Study


class EndoscopicImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class ImageQuality(models.TextChoices):
        GOOD = "good", "Good"
        ACCEPTABLE = "acceptable", "Acceptable"
        POOR = "poor", "Poor"

    class Source(models.TextChoices):
        CAMERA = "camera", "Camera"
        GALLERY = "gallery", "Gallery"

    study = models.ForeignKey(
        Study,
        on_delete=models.CASCADE,
        related_name="endoscopic_images",
    )
    file_path = models.CharField(max_length=512)
    original_filename = models.CharField(max_length=255)
    file_size_mb = models.DecimalField(
        max_digits=6, decimal_places=2, validators=[MinValueValidator(0)]
    )
    width_px = models.PositiveIntegerField()
    height_px = models.PositiveIntegerField()
    image_quality = models.CharField(max_length=16, choices=ImageQuality.choices, blank=True)
    source = models.CharField(max_length=16, choices=Source.choices, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.original_filename
