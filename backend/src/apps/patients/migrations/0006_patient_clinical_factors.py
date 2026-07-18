from django.db import migrations, models


def forwards(apps, schema_editor):
    Patient = apps.get_model("patients", "Patient")
    Patient.objects.filter(is_smoker=True).update(smoking_status="current")
    Patient.objects.filter(has_hematuria=True).update(hematuria_type="macroscopic")


def backwards(apps, schema_editor):
    Patient = apps.get_model("patients", "Patient")
    Patient.objects.filter(smoking_status="current").update(is_smoker=True)
    Patient.objects.exclude(hematuria_type="none").update(has_hematuria=True)


class Migration(migrations.Migration):

    dependencies = [
        ("patients", "0005_patient_followup_and_archive"),
    ]

    operations = [
        migrations.AddField(
            model_name="patient",
            name="smoking_status",
            field=models.CharField(
                choices=[("never", "Nunca"), ("former", "Exfumador"), ("current", "Fumador")],
                default="never",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="patient",
            name="hematuria_type",
            field=models.CharField(
                choices=[
                    ("none", "No"),
                    ("macroscopic", "Macroscópica"),
                    ("microscopic", "Microscópica"),
                ],
                default="none",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="patient",
            name="occupational_exposure",
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(forwards, backwards),
        migrations.RemoveField(model_name="patient", name="is_smoker"),
        migrations.RemoveField(model_name="patient", name="has_hematuria"),
    ]
