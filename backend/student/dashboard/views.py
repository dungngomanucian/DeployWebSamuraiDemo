# backend/student/dashboard/views.py
from config.supabase_client import get_supabase_client
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import OnboardingSerializer


class OnboardingAPIView(APIView):
    """
    API để cập nhật (PATCH) mục tiêu học tập (onboarding) cho học viên.
    (Đã refactor để dùng Supabase Client)
    """
    
    def patch(self, request):
        serializer = OnboardingSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        account_id = validated_data['account_id']
        
        # === BẮT ĐẦU PHẦN CODE MỚI THAY THẾ ===
        
        # 5. Kết nối CSDL và Cập nhật (dùng Supabase Client)
        try:
            # 1. Lấy Supabase client
            supabase = get_supabase_client()
            
            # 2. Chuẩn bị dữ liệu để update (dạng dictionary)
            #    (Bỏ 'account_id' vì nó dùng cho mệnh đề WHERE)
            data_to_update = {
                'target_exam': validated_data['target_exam'],
                'target_jlpt_degree': validated_data['target_jlpt_degree'],
                'target_date': validated_data['target_date'],
                'hour_per_day': validated_data['hour_per_day'],
                'updated_at': 'now()' # Dùng hàm 'now()' của Postgres
            }
            
            # 3. Thực thi câu lệnh (Tương đương: UPDATE students SET ... WHERE account_id = ...)
            response = supabase.table("students") \
                               .update(data_to_update) \
                               .eq("account_id", account_id) \
                               .execute()

            # 4. Kiểm tra kết quả (thay cho cursor.rowcount)
            # Nếu response.data là một list rỗng, nghĩa là `eq()` không tìm thấy
            if not response.data:
                return Response(
                    {"error": f"Không tìm thấy học viên với account_id: {account_id}"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # 5. Trả về thành công (Supabase tự động commit)
            return Response(
                {"message": "Cập nhật mục tiêu thành công!", "data": response.data[0]}, 
                status=status.HTTP_200_OK
            )

        except Exception as e:
            # Bắt lỗi chung (có thể là PostgrestError hoặc lỗi kết nối)
            print(f"Lỗi kết nối hoặc truy vấn Supabase (Onboarding): {e}")
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)




