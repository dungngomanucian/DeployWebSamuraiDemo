# auth_admin/urls.py
from django.urls import path
from .views import AdminTokenObtainPairView, AdminTokenRefreshView

urlpatterns = [
    # Endpoint để admin đăng nhập lấy token (POST)
    path('token', AdminTokenObtainPairView.as_view(), name='admin_token_obtain_pair'),
    
    # Endpoint để admin dùng refresh token lấy access token mới (POST)
    path('token/refresh/', AdminTokenRefreshView.as_view(), name='admin_token_refresh'),
]