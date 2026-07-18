from datetime import date

from django.conf import settings
from django.db import models

from apps.core.models import BaseUUIDModel


class Patient(BaseUUIDModel):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"

    class SmokingStatus(models.TextChoices):
        # Former smokers keep an elevated bladder-cancer risk, so a three-state
        # field is more informative than a boolean (Freedman et al., JAMA 2011).
        NEVER = "never", "Nunca"
        FORMER = "former", "Exfumador"
        CURRENT = "current", "Fumador"

    class HematuriaType(models.TextChoices):
        NONE = "none", "No"
        MACROSCOPIC = "macroscopic", "Macroscópica"
        MICROSCOPIC = "microscopic", "Microscópica"

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="patients",
    )
    patient_code = models.CharField(max_length=32, unique=True)
    full_name = models.CharField(max_length=200)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=16, choices=Gender.choices)
    smoking_status = models.CharField(
        max_length=16, choices=SmokingStatus.choices, default=SmokingStatus.NEVER
    )
    has_previous_bladder_cancer = models.BooleanField(default=False)
    hematuria_type = models.CharField(
        max_length=16, choices=HematuriaType.choices, default=HematuriaType.NONE
    )
    # Occupational exposure to aromatic amines (dye, rubber, paint, leather
    # industries) is a recognised risk factor (EAU): 5-25% of cases.
    occupational_exposure = models.BooleanField(default=False)

    # Longitudinal follow-up: bladder cancer requires risk-based surveillance
    # (EAU guidelines), so we track the next scheduled cystoscopy per patient.
    next_followup_date = models.DateField(null=True, blank=True)
    # Clinical records are archived, never hard-deleted (studies reference the
    # patient with PROTECT, and medical history should be preserved).
    is_archived = models.BooleanField(default=False)

    @property
    def age(self) -> int:
        today = date.today()
        years = today.year - self.birth_date.year
        if (today.month, today.day) < (self.birth_date.month, self.birth_date.day):
            years -= 1
        return years

    def __str__(self) -> str:
        return f"{self.patient_code} - {self.full_name}"
