# serializers.py (trong app teacher hoặc app model tương ứng)
from rest_framework import serializers

class TeacherSerializer(serializers.Serializer):
    """
    Serializer cho bảng teachers.
    Bỏ qua created_at, updated_at, deleted_at.
    """
    id = serializers.CharField(read_only=True)
    account_id = serializers.CharField(required=True) # Giả sử account_id là bắt buộc
    full_name = serializers.CharField(max_length=255, required=True)
    bio = serializers.CharField(allow_blank=True, allow_null=True, required=False) # Bio có thể để trống