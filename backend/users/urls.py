from django.urls import path # Import path tool
from .views import RegisterView, LoginView, CookieTokenRefreshView # Import our views

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'), # Endpoint for signups
    path('login/', LoginView.as_view(), name='auth_login'), # Endpoint for logging in
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'), # Endpoint to get new access tokens
]
