from django.db import models

from apps.core.models import BaseUUIDModel


class ModelConfig(BaseUUIDModel):
    model_name = models.CharField(max_length=120)
    model_version = models.CharField(max_length=64)
    inference_server_url = models.URLField()
    onnx_optimization = models.BooleanField(default=True)
    is_active = models.BooleanField(default=False)
    model_file_path = models.CharField(max_length=512, blank=True)

    def save(self, *args, **kwargs):
        if self.is_active:
            ModelConfig.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.model_name} {self.model_version}"
