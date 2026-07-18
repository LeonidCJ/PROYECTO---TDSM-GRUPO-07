from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("patients", "0004_alter_patient_gender"),
    ]

    operations = [
        migrations.AddField(
            model_name="patient",
            name="next_followup_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="patient",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
