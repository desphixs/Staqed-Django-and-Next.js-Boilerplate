# Import the base APIView which gives us full manual control over our logic (GET, POST, etc.)
from rest_framework.views import APIView 
# Import status codes (like 201 Created or 400 Bad Request) and permission helpers
from rest_framework import status, permissions 
# Import the Response tool to send data back to the frontend in a clean JSON format
from rest_framework.response import Response 
# Import the built-in JWT (JSON Web Token) views for logging in and refreshing tokens
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 
# Import the serializer that translates raw JSON into a new User account in our database
from .serializers import UserRegistrationSerializer 
# Import project settings so we can access our Client IDs and Secrets
from django.conf import settings 

# --- TRADITIONAL REGISTRATION ---

class RegisterView(APIView): 
    # Logic: We allow anyone to access this view because you don't need to be logged in to sign up
    permission_classes = [permissions.AllowAny] 

    def post(self, request): 
        # Pass the data coming from the frontend (names, email, password) into the serializer
        serializer = UserRegistrationSerializer(data=request.data) 
        # Check if the data meets all requirements (valid email, matching passwords, etc.)
        if serializer.is_valid(): 
            # If valid, save the new user to the Django database
            user = serializer.save() 
            return Response( 
                {"user": serializer.data}, # Send back the user's basic info
                status=status.HTTP_201_CREATED # Send 201 to indicate something was successfully created
            )
        # If the user made a mistake (like an email that's already taken), send back the error details
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

# --- SECURE LOGIN WITH COOKIES ---

class LoginView(TokenObtainPairView): 
    """
    Logic: This view handles logging in. Instead of just sending the 'Refresh Token' 
    to the frontend where it can be stolen by malicious scripts, we hide it in a 
    secure, 'HttpOnly' browser cookie.
    """
    def post(self, request, *args, **kwargs): 
        # Run the standard login logic which checks the email and password
        response = super().post(request, *args, **kwargs) 
        
        # If the login was successful (Status 200)
        if response.status_code == 200: 
            # Pull the 'refresh' token out of the standard response data
            refresh_token = response.data['refresh'] 
            
            # Use 'set_cookie' to place the refresh token in the user's browser storage securely
            response.set_cookie(
                key='refresh_token',     # The name the browser will use for this cookie
                value=refresh_token,     # The actual token string
                httponly=True,           # Logic: JavaScript cannot read this; it prevents XSS attacks!
                secure=not settings.DEBUG, # Logic: Only allow sending over HTTPS (unless we are in development)
                samesite='Lax',          # Logic: Provides a balance of security and usability against CSRF attacks
                max_age=30 * 24 * 60 * 60 # Set the cookie to expire in 30 days
            )
            
        return response # Return the Access token (JSON) and Refresh token (hidden in Cookie)

class CookieTokenRefreshView(TokenRefreshView): 
    """
    Logic: When the Access Token expires, the frontend calls this. It looks for the 
    hidden 'Refresh Token' in the browser cookies to issue a brand new Access Token.
    """
    def post(self, request, *args, **kwargs): 
        # Look inside the incoming browser cookies for the one named 'refresh_token'
        refresh_token = request.COOKIES.get('refresh_token') 
        
        if refresh_token: 
            # Manually inject that hidden token into the data so the library can process it
            request.data['refresh'] = refresh_token 
            
        # Continue with the standard logic of generating a new Access Token
        return super().post(request, *args, **kwargs) 

# --- USER PROFILE ---

class MeView(APIView): 
    # Logic: Only users with a valid token (logged in) are allowed to see this page
    permission_classes = [permissions.IsAuthenticated] 

    def get(self, request): 
        # 'request.user' is automatically filled by Django based on the provided token
        return Response({
            "email": request.user.email, # Return the logged-in user's data
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
        })

# --- SOCIAL AUTHENTICATION (GOOGLE & GITHUB) ---

import requests as http_requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

# Get the User model used in this specific project
User = get_user_model()

class GoogleLogin(APIView):
    """
    Logic: This handles "Login with Google". It exchanges a temporary code from 
    the frontend for a real Google user profile, then logs them into our system.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # The frontend sends us a 'code' after the user picks their Google account
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Talk to Google and exchange that 'code' for an 'access_token'
        token_res = http_requests.post('https://oauth2.googleapis.com/token', data={
            'code': code,
            'client_id': settings.SOCIAL_AUTH['google']['client_id'],
            'client_secret': settings.SOCIAL_AUTH['google']['client_secret'],
            'redirect_uri': 'http://localhost:3000/api/auth/callback/google', # Must match Google Console
            'grant_type': 'authorization_code',
        })

        if token_res.status_code != 200:
            return Response({'error': 'Failed to exchange code with Google'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_res.json().get('access_token')

        # Step 2: Use the Google access token to ask for the user's Name and Email
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

        # Step 3: Look for the user in our database. If they don't exist, create them automatically!
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={'first_name': first_name, 'last_name': last_name}
        )

        # Step 4: Now that we know who they are, generate OUR OWN tokens for them to use our site
        refresh = RefreshToken.for_user(user)

        return Response({
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)


class GitHubLogin(APIView):
    """
    Logic: Similar to Google, this handles GitHub login. GitHub is slightly different 
    because emails are often kept private, so we have to make an extra request to find them.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Exchange the GitHub code for a GitHub Access Token
        token_res = http_requests.post('https://github.com/login/oauth/access_token', data={
            'code': code,
            'client_id': settings.SOCIAL_AUTH['github']['client_id'],
            'client_secret': settings.SOCIAL_AUTH['github']['client_secret'],
            'redirect_uri': 'http://localhost:3000/api/auth/callback/github',
        }, headers={'Accept': 'application/json'}) # GitHub needs this header to send JSON back

        if token_res.status_code != 200:
            return Response({'error': 'Failed to exchange code with GitHub'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_res.json().get('access_token')

        # Step 2: Fetch the basic user profile (Username, Profile Pic, etc.)
        userinfo_res = http_requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        # Step 2.5: Specifically ask for their email list (since it might be hidden from the profile)
        email_res = http_requests.get(
            'https://api.github.com/user/emails',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if userinfo_res.status_code != 200:
            return Response({'error': 'Failed to fetch user info from GitHub'}, status=status.HTTP_400_BAD_REQUEST)

        userinfo = userinfo_res.json()
        # Split the full name into First and Last name parts
        name_parts = (userinfo.get('name') or '').split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # Logic to find the primary, verified email from the list of GitHub emails
        email = userinfo.get('email')
        if not email and email_res.status_code == 200:
            emails = email_res.json()
            # Find the email marked as 'primary' and 'verified'
            primary = next((e for e in emails if e.get('primary') and e.get('verified')), None)
            email = primary['email'] if primary else None

        if not email:
            return Response({'error': 'No verified email returned from GitHub'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Log them in or create a new account in our database
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={'first_name': first_name, 'last_name': last_name}
        )

        # Step 4: Issue our site's specific JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)