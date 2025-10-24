# serializers.py
from rest_framework import serializers
import os # Cần để lấy Supabase URL từ env

class AccountSerializer(serializers.Serializer):
    """
    Serializer cho bảng account, bao gồm xử lý image_path thành URL.
    Bỏ qua created_at, updated_at, deleted_at.
    """
    id = serializers.CharField(read_only=True)
    user_name = serializers.CharField(max_length=255)
    # Password chỉ nên được ghi, không bao giờ được đọc ra
    password = serializers.CharField(max_length=255, write_only=True, required=True) 
    phone_number = serializers.CharField(max_length=20, allow_blank=True, allow_null=True, required=False)
    email = serializers.EmailField(max_length=255)
    
    # Dùng SerializerMethodField để tạo URL động
    image_path = serializers.SerializerMethodField(read_only=True) 

    def get_image_path(self, obj):
        """
        Tạo URL đầy đủ cho ảnh từ đường dẫn lưu trong DB.
        Giả sử đường dẫn lưu trong DB là 'folder/image.png' và bucket là 'avatars'.
        """
        # Lấy đường dẫn gốc từ DB (nó nằm trong `obj` dictionary)
        relative_path = obj.get('image_path')
        if not relative_path:
            return None # Trả về null nếu không có ảnh

        # Lấy URL cơ sở của Supabase từ biến môi trường
        supabase_url = os.getenv('SUPABASE_URL') 
        if not supabase_url:
            # Ghi log lỗi nếu thiếu SUPABASE_URL
            print("Lỗi: Thiếu biến môi trường SUPABASE_URL")
            return None 

        # --- THAY ĐỔI TÊN BUCKET CHO ĐÚNG ---
        bucket_name = 'Avatar' # <<< Thay 'avatars' bằng tên bucket thực tế của bạn
        # ------------------------------------

        # Tạo URL công khai (giả sử bucket là public)
        # Cấu trúc: [SUPABASE_URL]/storage/v1/object/public/[BUCKET_NAME]/[FILE_PATH]
        full_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{relative_path}"
        
        return full_url

    # (Tùy chọn) Thêm validate cho password nếu cần
    # def validate_password(self, value):
    #     if len(value) < 8:
    #         raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")
    #     # Thêm các kiểm tra khác...
    #     return value

    # (Tùy chọn) Override create/update nếu cần xử lý hashing password
    # def create(self, validated_data):
    #     # Hash password trước khi gọi service để lưu
    #     password = validated_data.pop('password')
    #     # validated_data['password'] = make_password(password) # Dùng hàm hash của Django hoặc thư viện khác
    #     # ... gọi service để tạo account ...
    #     pass

    # def update(self, instance, validated_data):
    #     # Hash password nếu nó được cung cấp trong update
    #     if 'password' in validated_data:
    #         password = validated_data.pop('password')
    #         # instance['password'] = make_password(password)
    #     # ... gọi service để cập nhật ...
    #     pass