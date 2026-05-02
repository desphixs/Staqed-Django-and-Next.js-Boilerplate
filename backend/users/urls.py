from .views import RegisterView, LoginView, CookieTokenRefreshView, MeView # Import MeView
from django.urls import path # Import path tool

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_me'),
]
