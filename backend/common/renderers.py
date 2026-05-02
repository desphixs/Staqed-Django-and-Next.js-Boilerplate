from rest_framework import renderers # Import DRF renderers
import json # Import json tool

class GenericJSONRenderer(renderers.JSONRenderer): # Create a custom renderer
    charset = 'utf-8' # Set the character encoding

    def render(self, data, accepted_media_type=None, renderer_context=None): # The main render method
        response = renderer_context.get('response') # Grab the response object
        
        # Check if the response was successful (status code starting with 2)
        status = 'success' if response.status_code < 400 else 'error'
        
        # Create our standard wrapper
        formatted_data = {
            'status': status, # 'success' or 'error'
            'data': data, # The actual data we want to send
            'message': renderer_context.get('message', None) # An optional message
        }
        
        # Return the data as a JSON string
        return super(GenericJSONRenderer, self).render(formatted_data, accepted_media_type, renderer_context)
