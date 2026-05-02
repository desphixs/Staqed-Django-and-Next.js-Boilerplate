from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager # Import Django's auth tools
from django.db import models # Import database tools
from common.models import BaseModel # Import our custom BaseModel for UUID and timestamps

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
