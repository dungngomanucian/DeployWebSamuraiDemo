# auth_admin/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework_simplejwt.settings import api_settings
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
    username_field = 'email'
    
    @classmethod
    def get_token(cls, user):
        """
        Override để thêm thông tin tùy chỉnh (role) vào payload token.
        'user' ở đây là dictionary chứa thông tin admin trả về từ service.
        """
        # Lấy user_id từ dictionary 'user' thay vì user.id
        # SimpleJWT dùng setting USER_ID_FIELD để biết tên key ID, mặc định là 'id'
        user_id = user.get(api_settings.USER_ID_FIELD) 
        if not user_id:
             # Xử lý nếu dict user không có key 'id' (hoặc key được config)
             raise serializers.ValidationError("Admin data dictionary is missing the ID field.")
             
        # Tạo token payload cơ bản (chứa jti, token_type, exp, user_id)
        # Thay vì gọi super().get_token(user) vốn mong đợi object
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken() # Tạo RefreshToken rỗng
        token[api_settings.USER_ID_CLAIM] = user_id # Gán user_id vào claim chuẩn

        # Thêm các trường tùy chỉnh vào payload
        token['role'] = 'admin' 
        token['email'] = user.get('email')

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
            raise serializers.ValidationError('Sai mật khẩu hoặc email')

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