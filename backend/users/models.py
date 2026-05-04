from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager # Import Django's auth tools
from django.db import models # Import database tools
from django.utils import timezone # Import timezone-aware datetime tools
from datetime import timedelta # Import timedelta to calculate expiry times
from common.models import BaseModel # Import our custom BaseModel for UUID and timestamps
import secrets # Python's built-in secure random token generator
import random  # For generating random 6-digit OTP codes

class CustomUserManager(BaseUserManager): # Define how we create users
    def create_user(self, email, password=None, **extra_fields): # Method to create a standard user
        if not email: # If no email is provided
            raise ValueError('The Email field must be set') # Raise an error
        email = self.normalize_email(email) # Clean the email address
        user = self.model(email=email, **extra_fields) # Create the user object
        user.set_password(password) # Hash and save the password securely
        user.save(using=self._db) # Save the user to the database
        return user # Return the new user

    def create_superuser(self, email, password=None, **extra_fields): # Method to create an admin
        extra_fields.setdefault('is_staff', True) # Admin must be staff
        extra_fields.setdefault('is_superuser', True) # Admin must be a superuser
        return self.create_user(email, password, **extra_fields) # Use the create_user method

class User(AbstractBaseUser, PermissionsMixin, BaseModel): # Our main User model
    email = models.EmailField(unique=True) # Use email as the login ID instead of a username
    first_name = models.CharField(max_length=100, blank=True) # Field for first name
    last_name = models.CharField(max_length=100, blank=True) # Field for last name
    is_active = models.BooleanField(default=True) # Whether the user can log in
    is_staff = models.BooleanField(default=False) # Whether the user can access the admin panel

    objects = CustomUserManager() # Link our custom manager to this model

    USERNAME_FIELD = 'email' # Tell Django to use email for logging in
    REQUIRED_FIELDS = [] # No extra fields are required during signup

    def __str__(self): # How the user appears in logs/admin
        return self.email # Show their email address


class LoginToken(models.Model):
    """
    A single table that stores both Magic Link tokens and OTP codes.
    The 'token_type' field tells us which kind it is.
    """

    TOKEN_TYPES = [
        ('magic_link', 'Magic Link'), # A long secure URL token
        ('otp', 'OTP'),               # A short 6-digit code
    ]

    email      = models.EmailField()                                        # The email this token was sent to
    token      = models.CharField(max_length=128)                           # The actual token/OTP value
    token_type = models.CharField(max_length=20, choices=TOKEN_TYPES)       # Which type of login method
    expires_at = models.DateTimeField()                                     # When this token stops being valid
    is_used    = models.BooleanField(default=False)                         # True once this token has been consumed
    created_at = models.DateTimeField(auto_now_add=True)                    # When it was created

    class Meta:
        indexes = [
            models.Index(fields=['token', 'token_type']),  # Fast lookup when verifying a token
            models.Index(fields=['email', 'token_type']),  # Fast cleanup of old tokens per email
        ]

    def is_valid(self):
        """Returns True only if the token hasn't been used AND hasn't expired yet."""
        return not self.is_used and timezone.now() < self.expires_at

    @classmethod
    def generate_magic_link_token(cls, email):
        """
        Creates a new secure magic link token for the given email.
        Also deletes any old unused tokens for that email first to keep things clean.
        """
        # Wipe any previously unused magic link tokens for this address
        cls.objects.filter(email=email, token_type='magic_link', is_used=False).delete()

        token = secrets.token_urlsafe(40)                          # Generates a cryptographically secure random string
        expires_at = timezone.now() + timedelta(minutes=15)        # Magic links are valid for 15 minutes

        return cls.objects.create(
            email=email,
            token=token,
            token_type='magic_link',
            expires_at=expires_at,
        )

    @classmethod
    def generate_otp(cls, email):
        """
        Creates a new 6-digit OTP for the given email.
        Also deletes any old unused OTPs for that email first.
        """
        # Wipe any previously unused OTPs for this address
        cls.objects.filter(email=email, token_type='otp', is_used=False).delete()

        otp = str(random.randint(100000, 999999))                  # A random 6-digit number as a string
        expires_at = timezone.now() + timedelta(minutes=10)        # OTPs are valid for 10 minutes

        return cls.objects.create(
            email=email,
            token=otp,
            token_type='otp',
            expires_at=expires_at,
        )

    def __str__(self):
        return f"{self.token_type} for {self.email} ({'used' if self.is_used else 'active'})"
