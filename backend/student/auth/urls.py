"""
URL patterns for authentication functionality
"""
from django.urls import path
from .views import (
    forgot_password, 
    reset_password, 
    verify_reset_token, 
    check_token_status, 
    resend_reset_email, 
    get_last_email_sent_info
)

urlpatterns = [
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/', reset_password, name='reset-password'),
    path('verify-reset-token/', verify_reset_token, name='verify-reset-token'),
    path('check-token-status/', check_token_status, name='check-token-status'),
    path('resend-reset-email/', resend_reset_email, name='resend-reset-email'),
    path('last-email-info/', get_last_email_sent_info, name='last-email-info'),
]
