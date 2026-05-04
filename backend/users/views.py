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

import requests as http_requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class GoogleLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Exchange the authorization code for Google tokens
        token_res = http_requests.post('https://oauth2.googleapis.com/token', data={
            'code': code,
            'client_id': settings.SOCIAL_AUTH['google']['client_id'],
            'client_secret': settings.SOCIAL_AUTH['google']['client_secret'],
            'redirect_uri': 'http://localhost:3000/api/auth/callback/google',
            'grant_type': 'authorization_code',
        })

        if token_res.status_code != 200:
            return Response({'error': 'Failed to exchange code with Google'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_res.json().get('access_token')

        # Step 2: Use the access token to fetch the user's profile from Google
        userinfo_res = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if userinfo_res.status_code != 200:
            return Response({'error': 'Failed to fetch user info from Google'}, status=status.HTTP_400_BAD_REQUEST)

        userinfo = userinfo_res.json()
        email = userinfo.get('email')
        first_name = userinfo.get('given_name', '')
        last_name = userinfo.get('family_name', '')

        if not email:
            return Response({'error': 'No email returned from Google'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Get or create the user in our database
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={'first_name': first_name, 'last_name': last_name}
        )

        # Step 4: Issue our own JWT tokens for the user
        refresh = RefreshToken.for_user(user)

        return Response({
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)


class GitHubLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Exchange the authorization code for a GitHub access token
        token_res = http_requests.post('https://github.com/login/oauth/access_token', data={
            'code': code,
            'client_id': settings.SOCIAL_AUTH['github']['client_id'],
            'client_secret': settings.SOCIAL_AUTH['github']['client_secret'],
            'redirect_uri': 'http://localhost:3000/api/auth/callback/github',
        }, headers={'Accept': 'application/json'})

        if token_res.status_code != 200:
            return Response({'error': 'Failed to exchange code with GitHub'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_res.json().get('access_token')

        # Step 2: Fetch the user's profile from GitHub
        userinfo_res = http_requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        email_res = http_requests.get(
            'https://api.github.com/user/emails',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if userinfo_res.status_code != 200:
            return Response({'error': 'Failed to fetch user info from GitHub'}, status=status.HTTP_400_BAD_REQUEST)

        userinfo = userinfo_res.json()
        name_parts = (userinfo.get('name') or '').split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # GitHub may not expose email publicly, so we fetch from the emails endpoint
        email = userinfo.get('email')
        if not email and email_res.status_code == 200:
            emails = email_res.json()
            primary = next((e for e in emails if e.get('primary') and e.get('verified')), None)
            email = primary['email'] if primary else None

        if not email:
            return Response({'error': 'No verified email returned from GitHub'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Get or create the user
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={'first_name': first_name, 'last_name': last_name}
        )

        # Step 4: Issue our own JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)
