# serializers.py (trong app course hoặc app model tương ứng)
from rest_framework import serializers
import os

class CourseSerializer(serializers.Serializer):
    """
    Serializer cho bảng courses.
    Bỏ qua created_at, updated_at, deleted_at.
    Xử lý image_path thành URL.
    """
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    short_des = serializers.CharField(max_length=255, allow_blank=True, allow_null=True, required=False) # Mô tả ngắn
    
    # Dùng SerializerMethodField để tạo URL động cho ảnh
    image_path = serializers.SerializerMethodField(read_only=True) 

    def get_image_path(self, obj):
        """
        Tạo URL đầy đủ cho ảnh course từ đường dẫn lưu trong DB.
        Giả sử đường dẫn là 'courses/course_image.jpg' và bucket là 'course_images'.
        """
        relative_path = obj.get('image_path')
        if not relative_path:
            return None # Trả về null nếu không có ảnh

        supabase_url = os.getenv('SUPABASE_URL') 
        if not supabase_url:
            print("Lỗi: Thiếu biến môi trường SUPABASE_URL")
            return None 

        # --- THAY ĐỔI TÊN BUCKET CHO ĐÚNG ---
        bucket_name = 'course_images' # <<< Thay bằng tên bucket chứa ảnh khóa học
        # ------------------------------------

        # Tạo URL công khai (giả sử bucket là public)
        full_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{relative_path}"
        
        return full_url