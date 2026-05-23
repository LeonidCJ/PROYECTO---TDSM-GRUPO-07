from django.contrib import admin

from .models import EndoscopicImage, InferenceResult, ModelConfig, Study

admin.site.register(Study)
admin.site.register(EndoscopicImage)
admin.site.register(InferenceResult)
admin.site.register(ModelConfig)
