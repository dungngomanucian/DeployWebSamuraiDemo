# serializers.py (trong app exam hoặc app model tương ứng)
from rest_framework import serializers

class JlptExamSerializer(serializers.Serializer):
    """
    Serializer cho bảng jlpt_exams.
    Bỏ qua created_at, updated_at, deleted_at.
    """
    id = serializers.CharField(read_only=True)
    level_id = serializers.CharField(required=True) # ID của level liên quan
    title = serializers.CharField(max_length=255, required=True)
    total_duration = serializers.IntegerField(required=False, allow_null=True) # Thời gian làm bài (phút?)
    request_score = serializers.IntegerField(required=False, allow_null=True) # Điểm yêu cầu?
    type = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True) # Loại đề thi
    version = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True) # Phiên bản đề

