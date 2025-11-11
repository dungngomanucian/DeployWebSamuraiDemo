# results/serializers.py (Tệp mới)

from rest_framework import serializers

# Serializer đơn giản cho Bảng 'levels'
class LevelBasicSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()

# Serializer đơn giản cho Bảng 'jlpt_exams'
# Nó lồng (nested) LevelBasicSerializer để lấy tên level
class ExamBasicSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    level = LevelBasicSerializer(required=False)

# Serializer chính cho Lịch sử bài làm (Bảng 'exam_results')
class ExamResultHistorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    sum_score = serializers.FloatField(required=False, allow_null=True)
    duration = serializers.IntegerField(required=False, allow_null=True)
    datetime = serializers.DateTimeField() # Thời gian nộp bài
    
    # Lồng (nested) ExamBasicSerializer để lấy thông tin đề thi
    jlpt_exams = ExamBasicSerializer(required=False, source='exam')