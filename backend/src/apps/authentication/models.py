import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
	use_in_migrations = True

	def _create_user(self, email: str, password: str | None, **extra_fields):
		if not email:
			raise ValueError("The email must be set")
		email = self.normalize_email(email)
		user = self.model(email=email, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_user(self, email: str, password: str | None = None, **extra_fields):
		extra_fields.setdefault("is_staff", False)
		extra_fields.setdefault("is_superuser", False)
		return self._create_user(email, password, **extra_fields)

	def create_superuser(self, email: str, password: str | None = None, **extra_fields):
		extra_fields.setdefault("is_staff", True)
		extra_fields.setdefault("is_superuser", True)

		if extra_fields.get("is_staff") is not True:
			raise ValueError("Superuser must have is_staff=True.")
		if extra_fields.get("is_superuser") is not True:
			raise ValueError("Superuser must have is_superuser=True.")

		return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
	username = None
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	email = models.EmailField("email address", unique=True)
	first_name = models.CharField(max_length=150)
	last_name = models.CharField(max_length=150)

	class Role(models.TextChoices):
		ADMIN = "admin", "Admin"
		DOCTOR = "doctor", "Doctor"

	class Specialty(models.TextChoices):
		UROLOGY = "urology", "Urología"
		ONCOLOGY = "oncology", "Oncología"
		PATHOLOGY = "pathology", "Patología"
		RADIOLOGY = "radiology", "Radiología"
		OTHER = "other", "Otro"

	phone = models.CharField(max_length=32, blank=True)
	role = models.CharField(max_length=16, choices=Role.choices, default=Role.DOCTOR)
	specialty = models.CharField(
		max_length=32,
		choices=Specialty.choices,
		default=Specialty.OTHER,
		blank=True,
	)
	hospital = models.CharField(max_length=120, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	USERNAME_FIELD = "email"
	REQUIRED_FIELDS: list[str] = []

	objects = UserManager()

	def __str__(self) -> str:
		return self.email
