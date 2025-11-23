# serializers.py (trong app level hoặc app model tương ứng)
from rest_framework import serializers

class LevelSerializer(serializers.Serializer):
    """
    Serializer cho bảng levels.
    Bỏ qua created_at, updated_at, deleted_at.
    """
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=255, required=True) # Tên level, ví dụ: N1, N2
    description = serializers.CharField(allow_blank=True, allow_null=True, required=False) # Mô tả chi tiết (nếu có)