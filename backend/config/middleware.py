"""
Custom middleware to handle BrokenPipeError and other connection errors gracefully
"""
import sys
import logging
from django.http import HttpResponse

logger = logging.getLogger(__name__)


class BrokenPipeErrorMiddleware:
    """
    Middleware to catch and suppress BrokenPipeError exceptions.
    This error occurs when client closes connection before server finishes sending response.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except BrokenPipeError:
            # Client closed connection - this is normal when user reloads page or navigates away
            # Suppress the error to avoid cluttering logs
            logger.debug(f"BrokenPipeError: Client closed connection for {request.path}")
            # Return empty response since client is already gone
            return HttpResponse(status=499)  # 499 Client Closed Request
        except (ConnectionResetError, ConnectionAbortedError) as e:
            # Similar connection errors
            logger.debug(f"Connection error: {e} for {request.path}")
            return HttpResponse(status=499)
        except Exception as e:
            # Log other exceptions but don't suppress them
            logger.error(f"Unexpected error in middleware: {e}", exc_info=True)
            raise


class RequestTimeoutMiddleware:
    """
    Middleware to add timeout handling for long-running requests
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if client is still connected before processing
        if hasattr(request, '_closed') and request._closed:
            return HttpResponse(status=499)
        
        response = self.get_response(request)
        
        # Check if client disconnected during processing
        if hasattr(request, '_closed') and request._closed:
            return HttpResponse(status=499)
        
        return response

