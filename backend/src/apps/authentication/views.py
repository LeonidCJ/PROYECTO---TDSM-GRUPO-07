from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
	permission_classes = [permissions.AllowAny]
	serializer_class = RegisterSerializer


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
			token.blacklist()
		except Exception:
			return Response(
				{"detail": "invalid or expired refresh token"},
				status=status.HTTP_400_BAD_REQUEST,
			)
		return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = UserSerializer

	def get_object(self):
		return self.request.user
