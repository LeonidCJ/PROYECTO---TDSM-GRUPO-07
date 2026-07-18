from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.administration.models import AuditLog

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
	permission_classes = [permissions.AllowAny]
	serializer_class = RegisterSerializer


class AuditedTokenObtainPairView(TokenObtainPairView):
	"""Login endpoint that records every access attempt in the audit log.

	Uses a dedicated, tighter "login" throttle scope to blunt brute-force
	attacks independently of the global anon rate.
	"""

	throttle_classes = [ScopedRateThrottle]
	throttle_scope = "login"

	def post(self, request, *args, **kwargs):
		email = (request.data.get("email") or "").lower()
		# SimpleJWT raises (AuthenticationFailed / ValidationError) on bad
		# credentials instead of returning a 4xx response, so the failure branch
		# must live in an except block; DRF still turns the re-raised exception
		# into the proper error response.
		try:
			response = super().post(request, *args, **kwargs)
		except Exception:
			AuditLog.record(request=request, event=AuditLog.Event.LOGIN_FAILED, email=email)
			raise
		if response.status_code == status.HTTP_200_OK:
			user = User.objects.filter(email__iexact=email).first()
			AuditLog.record(request=request, event=AuditLog.Event.LOGIN_OK, user=user, email=email)
		return response


class LogoutView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request, *args, **kwargs):
		refresh = request.data.get("refresh")
		if not refresh:
			return Response(
				{"detail": "refresh token is required"},
				status=status.HTTP_400_BAD_REQUEST,
			)
		try:
			token = RefreshToken(refresh)
			user_id = token.payload.get("user_id")
			token.blacklist()
		except Exception:
			return Response(
				{"detail": "invalid or expired refresh token"},
				status=status.HTTP_400_BAD_REQUEST,
			)
		user = User.objects.filter(pk=user_id).first() if user_id else None
		AuditLog.record(request=request, event=AuditLog.Event.LOGOUT, user=user)
		return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = UserSerializer

	def get_object(self):
		return self.request.user
