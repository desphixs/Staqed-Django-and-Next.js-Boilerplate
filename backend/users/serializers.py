from rest_framework import serializers # Import DRF's serializer tools
from django.contrib.auth import get_user_model # Import tool to get our custom User model
from django.contrib.auth.password_validation import validate_password # Import Django's password checker

User = get_user_model() # Grab our custom User model

from .models import Profile

class UserRegistrationSerializer(serializers.ModelSerializer): # Serializer for creating new users
    password = serializers.CharField( # Define the password field
        write_only=True, # Ensure the password is never sent back in the response
        required=True, # Password must be provided
        validators=[validate_password] # Use Django's built-in rules (min length, etc.)
    )
    password_confirm = serializers.CharField( # Add a field to confirm the password
        write_only=True, 
        required=True
    )

    class Meta:
        model = User # Use our User model
        fields = ('email', 'first_name', 'last_name', 'password', 'password_confirm') # Fields allowed during signup

    def validate(self, attrs): # Custom validation to check if passwords match
        if attrs['password'] != attrs['password_confirm']: # If the two passwords don't match
            raise serializers.ValidationError({"password": "Password fields didn't match."}) # Raise an error
        return attrs # Return the validated data

    def create(self, validated_data): # Logic to actually create the user
        validated_data.pop('password_confirm') # Remove the confirmation password (we don't save it)
        user = User.objects.create_user(**validated_data) # Use our custom manager to create the user safely
        return user # Return the newly created user


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the Profile model. Handles the bio and profile picture.
    """
    class Meta:
        model = Profile
        fields = ('bio', 'profile_picture', 'public_profile', 'email_notifications')


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for user data, including nested profile info.
    Used for the /me/ endpoint and profile updates.
    """
    profile = ProfileSerializer(source='safe_profile')
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 'profile')
        read_only_fields = ('email',)

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def update(self, instance, validated_data):
        # Since we use source='safe_profile', DRF puts the data here
        profile_data = validated_data.pop('safe_profile', {})
        
        # Update User fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        # Safely get the profile using our property
        profile = instance.safe_profile
        
        # Dynamically update profile fields
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
            
        profile.save()
        return instance
