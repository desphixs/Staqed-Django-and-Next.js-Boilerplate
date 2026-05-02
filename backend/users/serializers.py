from rest_framework import serializers # Import DRF's serializer tools
from django.contrib.auth import get_user_model # Import tool to get our custom User model
from django.contrib.auth.password_validation import validate_password # Import Django's password checker

User = get_user_model() # Grab our custom User model

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
