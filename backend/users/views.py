from rest_framework.views import APIView # Import the base APIView for explicit control
from rest_framework import status, permissions # Import standard DRF tools
from rest_framework.response import Response # Import the response tool
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # Import JWT views
from .serializers import UserRegistrationSerializer # Import our signup translator
from django.conf import settings # Import project settings

class RegisterView(APIView): # View to handle user registration using APIView
    permission_classes = [permissions.AllowAny] # Anyone can sign up, no login required

    def post(self, request): # Explicitly handle the POST request
        serializer = UserRegistrationSerializer(data=request.data) # Translate the incoming data
        if serializer.is_valid(): # Check if the data is valid
            user = serializer.save() # Save the user to the database
            return Response( # Return a successful response with the user data
                {"user": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) # Return errors if invalid

class LoginView(TokenObtainPairView): # Custom Login View to handle HttpOnly cookies
    def post(self, request, *args, **kwargs): # When the user sends their credentials
        response = super().post(request, *args, **kwargs) # Call the default JWT login logic
        
        if response.status_code == 200: # If the login was successful
            refresh_token = response.data['refresh'] # Grab the refresh token from the data
            
            # Set the Refresh Token in a secure HttpOnly cookie
            response.set_cookie(
                key='refresh_token', # Name of the cookie
                value=refresh_token, # The token itself
                httponly=True, # Prevent JavaScript from accessing it (Security!)
                secure=not settings.DEBUG, # Only send over HTTPS in production
                samesite='Lax', # Prevent CSRF attacks
                max_age=30 * 24 * 60 * 60 # Keep it for 30 days
            )
            
            # Remove the refresh token from the JSON body so it's only in the cookie
            # del response.data['refresh']
            
        return response # Return the response (Access token in JSON, Refresh in Cookie)

class CookieTokenRefreshView(TokenRefreshView): # Custom View to refresh tokens using the cookie
    def post(self, request, *args, **kwargs): # When the frontend asks for a new access token
        refresh_token = request.COOKIES.get('refresh_token') # Try to get the token from the bouncer's cookie
        
        if refresh_token: # If we found a token in the cookie
            request.data['refresh'] = refresh_token # Inject it into the data for SimpleJWT to process
            
        return super().post(request, *args, **kwargs) # Call the default refresh logic

class MeView(APIView): # New view to get the current user's data
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can see this

    def get(self, request): # When they send a GET request
        return Response({
            "email": request.user.email, # Return their email
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
        })

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView): # View to handle Google Login
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000/api/auth/callback/google" # The URL Google redirects to
    client_class = OAuth2Client

class GitHubLogin(SocialLoginView): # View to handle GitHub Login
    adapter_class = GitHubOAuth2Adapter
    callback_url = "http://localhost:3000/api/auth/callback/github" # The URL GitHub redirects to
    client_class = OAuth2Client
