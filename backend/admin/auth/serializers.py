# auth_admin/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .services import AuthAdminService # Import service sẽ tạo ở bước sau
# (Optional) Import hàm check_password nếu dùng hash của Django
# from django.contrib.auth.hashers import check_password 

class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer tùy chỉnh để xác thực admin từ bảng 'admins'
    và thêm 'role' vào payload của token.
    """
    # (Optional) Có thể thêm các trường tùy chỉnh nếu cần gửi thêm thông tin
    # username_field = 'email' # SimpleJWT mặc định dùng username, có thể đổi

    @classmethod
    def get_token(cls, user):
        """
        Override để thêm thông tin tùy chỉnh (role) vào payload token.
        'user' ở đây là dictionary chứa thông tin admin trả về từ service.
        """
        token = super().get_token(user) # Gọi hàm gốc để lấy payload cơ bản (user_id)

        # Thêm các trường tùy chỉnh vào payload
        token['role'] = 'admin' # Thêm vai trò admin
        # Thêm các thông tin khác nếu cần, ví dụ: token['email'] = user.get('email')

        return token

    def validate(self, attrs):
        """
        Override hàm validate để dùng service xác thực admin.
        'attrs' chứa email/username và password từ request.
        """
        # Lấy email và password từ dữ liệu gửi lên (attrs)
        # SimpleJWT mặc định dùng self.username_field, nếu không đổi thì là 'username'
        # Dựa vào bảng admins, có vẻ nên dùng 'email' làm username field
        identifier = attrs.get('email') # Hoặc attrs.get(self.username_field)
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError('Email and password are required.')

        # Gọi service để xác thực (Hàm này sẽ tạo ở bước sau)
        # Hàm này nên trả về dict chứa thông tin admin nếu thành công, hoặc None/Exception nếu thất bại
        admin_user = AuthAdminService.authenticate_admin(email=identifier, password=password) 

        if not admin_user:
            raise serializers.ValidationError('No active admin found with the given credentials.')

        # --- Quan trọng: Chuẩn bị dữ liệu cho get_token ---
        # Hàm get_token() mặc định cần một object hoặc dict có key 'id' (hoặc key được cấu hình)
        # Chúng ta truyền dict thông tin admin lấy từ service vào đây
        # SimpleJWT sẽ tự dùng 'id' từ dict này để đặt vào 'user_id' trong token
        refresh = self.get_token(admin_user) # Gọi get_token với dict admin_user

        # Dữ liệu trả về cho client sẽ chứa 'refresh' và 'access' token
        data = {}
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        # (Optional) Thêm thông tin admin vào response nếu muốn (không khuyến khích đưa quá nhiều)
        # data['user'] = { 'id': admin_user.get('id'), 'email': admin_user.get('email') }

        return data