from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="auditlog",
            name="detail",
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AlterField(
            model_name="auditlog",
            name="event",
            field=models.CharField(
                choices=[
                    ("login_ok", "Login exitoso"),
                    ("login_failed", "Login fallido"),
                    ("logout", "Cierre de sesión"),
                    ("user_created", "Usuario creado"),
                    ("user_role_changed", "Cambio de rol"),
                    ("user_activated", "Usuario activado"),
                    ("user_deactivated", "Usuario desactivado"),
                    ("password_reset", "Contraseña restablecida"),
                ],
                max_length=32,
            ),
        ),
    ]
