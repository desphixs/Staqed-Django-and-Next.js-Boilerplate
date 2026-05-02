import uuid # Import the UUID tool to generate unique IDs
from django.db import models # Import Django's database tools

class BaseModel(models.Model): # Create a base model that other models will 'copy' from
    id = models.UUIDField( # Create a unique ID field
        primary_key=True, # This is the main ID for the record
        default=uuid.uuid4, # Automatically generate a random UUID
        editable=False # Keep it locked so it can't be changed later
    )
    created_at = models.DateTimeField(auto_now_add=True) # Automatically save the date/time when created
    updated_at = models.DateTimeField(auto_now=True) # Automatically update the date/time whenever saved

    class Meta:
        abstract = True # This tells Django NOT to create a table for this model itself
