from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import AuditLog

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    """User representation for the admin console.

    Admins can create users with any role and toggle role / active status, but
    never read or write password hashes. Password is write-only and optional on
    update.
    """

    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "specialty",
            "hospital",
            "phone",
            "is_active",
            "last_login",
            "created_at",
        )
        read_only_fields = ("id", "last_login", "created_at")

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Requerido al crear un usuario."})
        return User.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=["password"])
        return user


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "event",
            "email",
            "user",
            "user_email",
            "ip_address",
            "user_agent",
            "created_at",
        )
        read_only_fields = fields
