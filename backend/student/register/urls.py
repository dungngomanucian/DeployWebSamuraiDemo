
from django.urls import path
from .views import RegisterStartVerificationView, VerifyAndRegisterView

urlpatterns = [
    # Tên API endpoint theo yêu cầu của Frontend: /api/register-start-verification
    path('register-start-verification', RegisterStartVerificationView.as_view(), name='register-start'),
    
    # Tên API endpoint theo yêu cầu của Frontend: /api/verify-and-register
    path('verify-and-register', VerifyAndRegisterView.as_view(), name='verify-and-register'),
]