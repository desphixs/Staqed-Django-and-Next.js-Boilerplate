from django.urls import path
from .views import (
    RegisterView, LoginView, CookieTokenRefreshView, MeView,
    GoogleLogin, GitHubLogin,
    RequestMagicLinkView, VerifyMagicLinkView,
    RequestOTPView, VerifyOTPView,
)

urlpatterns = [
    # ── Standard Auth ──────────────────────────────────────────────────────────
    path('register/',       RegisterView.as_view(),          name='auth_register'),
    path('login/',          LoginView.as_view(),             name='auth_login'),
    path('token/refresh/',  CookieTokenRefreshView.as_view(),name='token_refresh'),
    path('me/',             MeView.as_view(),                name='user_me'),

    # ── Social Auth ────────────────────────────────────────────────────────────
    path('google/',         GoogleLogin.as_view(),           name='google_login'),
    path('github/',         GitHubLogin.as_view(),           name='github_login'),

    # ── Magic Link ─────────────────────────────────────────────────────────────
    path('magic-link/request/', RequestMagicLinkView.as_view(), name='magic_link_request'),
    path('magic-link/verify/',  VerifyMagicLinkView.as_view(),  name='magic_link_verify'),

    # ── OTP ────────────────────────────────────────────────────────────────────
    path('otp/request/',    RequestOTPView.as_view(),        name='otp_request'),
    path('otp/verify/',     VerifyOTPView.as_view(),         name='otp_verify'),
]
