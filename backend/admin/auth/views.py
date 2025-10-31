# auth_admin/views.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import AdminTokenObtainPairSerializer # Import serializer tùy chỉnh

class AdminTokenObtainPairView(TokenObtainPairView):
    """
    View để admin đăng nhập và lấy access/refresh token.
    Sử dụng serializer tùy chỉnh để xác thực qua bảng 'admins'.
    """
    serializer_class = AdminTokenObtainPairSerializer

class AdminTokenRefreshView(TokenRefreshView):
    """
    View để admin dùng refresh token lấy access token mới.
    Thường không cần tùy chỉnh gì thêm.
    """
    pass # Kế thừa trực tiếp là đủ