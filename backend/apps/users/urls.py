from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import RegisterView, ProfileView

urlpatterns = [
    # path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/',ProfileView.as_view(), name='user_profile'),
    # path('login/',LoginView.as_view(), name='login'),
    # path('google/', GoogleLogin.as_view(), name='google_login')
]