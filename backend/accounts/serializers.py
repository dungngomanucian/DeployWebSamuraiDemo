from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    """
    Serializer cho việc xác thực đăng nhập.
    Yêu cầu email và mật khẩu.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)
