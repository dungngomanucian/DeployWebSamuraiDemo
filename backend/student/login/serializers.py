from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    """
    Serializer cho việc xác thực đăng nhập.
    Có thể đăng nhập bằng email hoặc mã học viên.
    """
    student_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    password = serializers.CharField(required=True)
    remember_me = serializers.BooleanField(default=False)
    
    def validate(self, data):
        """
        Kiểm tra xem ít nhất một trong hai (student_id hoặc email) phải được cung cấp.
        """
        student_id = data.get('student_id')
        email = data.get('email')
        
        if not student_id and not email:
            raise serializers.ValidationError(
                "Vui lòng cung cấp ít nhất một trong hai: Mã học viên hoặc Email."
            )
        
        return data

    