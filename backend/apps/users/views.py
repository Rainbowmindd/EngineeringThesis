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

# class LoginView(APIView):
#     permission_classes=[permissions.AllowAny]
#
#     def post(self,request):
#         email=request.data.get('email')
#         password=request.data.get('password')
#
#         #czy email istnieje
#         if not User.objects.filter(email=email).exists():
#             return Response(
#                 {"detail": "Invalid email or password."},
#                 status=HTTP_400_BAD_REQUEST,
#             )
#         user=authenticate(request,username=email,password=password)
#         if user is None:
#             return Response(
#                 {"detail": "Invalid email or password."},
#                 status=HTTP_400_BAD_REQUEST,
#             )
#
#         from rest_framework_simplejwt.tokens import RefreshToken
#
#         refresh=RefreshToken.for_user(user)
#         return Response(
#             {
#                 "access": str(refresh.access_token),
#                 "refresh": str(refresh),
#                 "role": user.role,
#             }
#         )
# class GoogleLogin(SocialLoginView):
#     adapter_class = GoogleOAuth2Adapter
#     client_class = OAuth2Client

