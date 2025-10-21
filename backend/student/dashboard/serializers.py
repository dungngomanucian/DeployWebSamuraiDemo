# backend/student/dashboard/serializers.py

from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator

class OnboardingSerializer(serializers.Serializer):
    """
    Serializer để xác thực dữ liệu từ OnboardingModal.
    """
    
    account_id = serializers.CharField(required=True, max_length=100)
    target_exam = serializers.ChoiceField(
        choices=['JLPT', 'EJU'], 
        required=True
    )
    target_jlpt_degree = serializers.ChoiceField(
        choices=['N1', 'N2', 'N3', 'N4', 'N5'],
        required=False,
        allow_null=True
    )

    # DateField sẽ tự động xác thực chuỗi 'YYYY-MM-DD' từ React
    target_date = serializers.DateField(required=True)
    # === KẾT THÚC CẬP NHẬT ===

    hour_per_day = serializers.FloatField(
        required=True,
        validators=[MinValueValidator(0.5), MaxValueValidator(24)]
    )

    def validate(self, data):
        # (Hàm validate của bạn đã chính xác, giữ nguyên)
        target_exam = data.get('target_exam')
        target_degree = data.get('target_jlpt_degree')

        if target_exam == 'JLPT' and not target_degree:
            raise serializers.ValidationError(
                {"target_jlpt_degree": "Vui lòng chọn mục tiêu JLPT (N1-N5)."}
            )
        
        if target_exam == 'EJU':
            data['target_jlpt_degree'] = None 

        return data