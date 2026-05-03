from django.urls import path
from .views import RegisterView, LoginView, CookieTokenRefreshView, MeView, GoogleLogin, GitHubLogin

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_me'),
    path('google/', GoogleLogin.as_view(), name='google_login'), # Google endpoint
    path('github/', GitHubLogin.as_view(), name='github_login'), # GitHub endpoint
]
