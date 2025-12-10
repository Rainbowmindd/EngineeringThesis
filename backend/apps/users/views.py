from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer
import logging
import json

logger = logging.getLogger(__name__)
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.info(f"Raw request body: {request.body}")
        logger.info(f"Request data type: {type(request.data)}")
        logger.info(f"Request data: {request.data}")

        email = request.data.get("email")
        password = request.data.get("password")

        logger.info(f"Email extracted: {email}")
        logger.info(f"Password extracted: {password}")

        if not email or not password:
            logger.warning("Email or password missing")
            return Response(
                {"detail": "Email and password are required."},
                status=HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            logger.info(f"User found: {user.username}")
        except User.DoesNotExist:
            logger.warning(f"User with email {email} not found")
            return Response(
                {"detail": "Invalid email or password."},
                status=HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=user.username, password=password)

        if user is None:
            logger.warning(f"Authentication failed")
            return Response(
                {"detail": "Invalid email or password."},
                status=HTTP_400_BAD_REQUEST,
            )

        logger.info(f"User authenticated: {user.username}")

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            },
        })