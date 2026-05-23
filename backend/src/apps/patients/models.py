from datetime import date

from django.conf import settings
from django.db import models

from apps.core.models import BaseUUIDModel


class Patient(BaseUUIDModel):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="patients",
    )
    patient_code = models.CharField(max_length=32, unique=True)
    full_name = models.CharField(max_length=200)
    birth_date = models.DateField()
    gender = models.CharField(max_length=16, choices=Gender.choices)
    is_smoker = models.BooleanField(default=False)
    has_previous_bladder_cancer = models.BooleanField(default=False)
    is_immunosuppressed = models.BooleanField(default=False)

    @property
    def age(self) -> int:
        today = date.today()
        years = today.year - self.birth_date.year
        if (today.month, today.day) < (self.birth_date.month, self.birth_date.day):
            years -= 1
        return years

    def __str__(self) -> str:
        return f"{self.patient_code} - {self.full_name}"
