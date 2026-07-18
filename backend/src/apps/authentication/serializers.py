from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        # NOTE: `role` is intentionally NOT exposed here. Public self-registration
        # always creates a DOCTOR (the model default). Allowing the client to set
        # the role would be a privilege-escalation hole (anyone could register as
        # admin). Elevated roles are assigned only by an admin via the admin API.
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "specialty",
            "hospital",
        )
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Force the safe default regardless of any unexpected input.
        validated_data["role"] = User.Role.DOCTOR
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "specialty",
            "hospital",
        )
