#from allauth.socialaccount.providers.dummy.views import authenticate
# from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
# from allauth.socialaccount.providers.oauth2.client import OAuth2Client
# from dj_rest_auth.registration.views import SocialLoginView
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer
import logging

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
        try:
            email = request.data.get("email")
            password = request.data.get("password")

            logger.info(f"Login attempt with email: {email}")

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

            # authenticate wymaga username, nie emaila
            user = authenticate(request, username=user.username, password=password)

            if user is None:
                logger.warning(f"Authentication failed for user")
                return Response(
                    {"detail": "Invalid email or password."},
                    status=HTTP_400_BAD_REQUEST,
                )

            logger.info(f"User authenticated successfully: {user.username}")

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
        except Exception as e:
            logger.error(f"Unexpected error in login: {str(e)}")
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=HTTP_400_BAD_REQUEST,
            )

