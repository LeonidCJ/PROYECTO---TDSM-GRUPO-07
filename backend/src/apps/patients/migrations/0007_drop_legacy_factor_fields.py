from django.db import migrations, models


class Migration(migrations.Migration):
    """Drop the legacy boolean factor columns.

    Kept in its own migration (separate transaction) on purpose: PostgreSQL
    rejects an ALTER TABLE ... DROP COLUMN issued in the same transaction as the
    data migration that populated the replacement columns ("pending trigger
    events"). The data move happens in 0006; the drop happens here.
    """

    dependencies = [
        ("patients", "0006_patient_clinical_factors"),
    ]

    operations = [
        migrations.RemoveField(model_name="patient", name="is_smoker"),
        migrations.RemoveField(model_name="patient", name="has_hematuria"),
    ]
