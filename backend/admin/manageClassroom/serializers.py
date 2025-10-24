# serializers.py (trong app classroom hoặc app model tương ứng)
from rest_framework import serializers

class ClassroomSerializer(serializers.Serializer):
    """
    Serializer cho bảng classrooms.
    Bỏ qua created_at, updated_at, deleted_at.
    """
    id = serializers.CharField(read_only=True)
    course_id = serializers.CharField(required=True) # ID của khóa học liên quan
    class_code = serializers.CharField(required=True) # Mã lớp học, có thể là unique
    class_name = serializers.CharField(max_length=255, required=True) # Tên lớp học
    schedule = serializers.IntegerField(required=False, allow_null=True) # Lịch học (kiểu int2 có thể đại diện cho thứ?)
    start_date = serializers.DateTimeField(required=False, allow_null=True) # Ngày bắt đầu
    end_date = serializers.DateTimeField(required=False, allow_null=True) # Ngày kết thúc
    status = serializers.BooleanField(required=False, default=True) # Trạng thái lớp học (ví dụ: đang mở)