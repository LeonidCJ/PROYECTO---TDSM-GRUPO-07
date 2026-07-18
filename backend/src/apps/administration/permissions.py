from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow only administrators (role=admin or a Django superuser)."""

    message = "Se requiere rol de administrador."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return bool(getattr(user, "is_superuser", False) or getattr(user, "role", None) == "admin")
