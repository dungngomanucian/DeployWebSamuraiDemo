# serializers.py
from rest_framework import serializers

class StudentSerializer(serializers.Serializer):
    """
    Serializer này xử lý việc xác thực và chuyển đổi dữ liệu cho đối tượng Student
    từ Supabase. Nó không bao gồm các trường 'created_at', 'updated_at', 'deleted_at'.
    """
    # Khóa chính và khóa ngoại
    # read_only=True vì trường id thường do database tạo ra
    id = serializers.CharField(read_only=True)
    classroom_code = serializers.CharField(max_length=100, allow_null=True, required=False)
    account_id = serializers.CharField(max_length=255) # Giả sử account_id là bắt buộc

    # Thông tin cá nhân
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)
    date_of_birth = serializers.DateField()
    gender = serializers.IntegerField() # int2
    address = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    parent_phone_number = serializers.CharField(max_length=20, allow_blank=True, allow_null=True, required=False)

    # Thông tin mục tiêu
    # Giả định các kiểu enum là các chuỗi (text/varchar)
    target_exam = serializers.CharField(max_length=50) 
    target_jlpt_degree = serializers.CharField(max_length=10) # Tên cột bị cắt trong ảnh
    target_date = serializers.DateTimeField() # timestamptz

    # Số liệu thống kê
    hour_per_day = serializers.FloatField() # float4
    # Dùng DecimalField cho 'numeric' để đảm bảo độ chính xác
    total_exam_hour = serializers.DecimalField(max_digits=10, decimal_places=2)
    streak_day = serializers.IntegerField() # int4
    score_latest = serializers.IntegerField() # int4
    total_test = serializers.IntegerField() # int4
    total_exam = serializers.IntegerField() # int4

    # Lưu ý: Các trường 'created_at', 'updated_at', 'deleted_at' đã được cố ý bỏ qua
    # theo yêu cầu.

    # Nếu bạn cần logic tạo (create) hoặc cập nhật (update) tùy chỉnh, 
    # bạn sẽ định nghĩa thêm các phương thức create() và update() ở đây.

class StudentListSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    classroom_code = serializers.CharField(max_length=100, allow_null=True, required=False)
    account_id = serializers.CharField(max_length=255)
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)
    date_of_birth = serializers.DateField()
    gender = serializers.IntegerField() # int2
    address = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    parent_phone_number = serializers.CharField(max_length=20, allow_blank=True, allow_null=True, required=False)