from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views import StudentLoginAPIView, TestSessionAPIView

# Định nghĩa tên ứng dụng
app_name = 'accounts'

urlpatterns = [
    # Đường dẫn sẽ là: /api/v1/student/auth/login/
    path('userlogin/', StudentLoginAPIView.as_view(), name='student-login'),
    
    # Đường dẫn sẽ là: /api/v1/student/auth/login/test-session/
    path('test-session/', TestSessionAPIView.as_view(), name='test-session'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
