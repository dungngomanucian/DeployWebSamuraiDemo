# backend/student/dashboard/views.py
from config.supabase_client import get_supabase_client
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import OnboardingSerializer, AccountProfileSerializer, DashboardGridSerializer


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
        
        try:
            # 1. Lấy Supabase client
            supabase = get_supabase_client()
            
            degree_mapper = {
                'N1': 'JLPT N1',
                'N2': 'JLPT N2',
                'N3': 'JLPT N3',
                'N4': 'JLPT N4',
                'N5': 'JLPT N5',
                None: None
            }
            
            # 2. Chuẩn bị dữ liệu để update (dạng dictionary)
            #    (Bỏ 'account_id' vì nó dùng cho mệnh đề WHERE)
            data_to_update = {
                'target_exam': validated_data['target_exam'],
                'target_jlpt_degree': degree_mapper.get(validated_data.get('target_jlpt_degree')),
                # Chuyển đổi đối tượng date thành chuỗi 'YYYY-MM-DD'
                'target_date': validated_data['target_date'].isoformat(), 
                'hour_per_day': validated_data['hour_per_day'],
                'updated_at': 'now()' 
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


class TopBarProfileAPIView(APIView):
    """
    API để LẤY (GET) thông tin cơ bản của TÀI KHOẢN (user_name, image_path)
    cho TopBar.
    """
    
    def get(self, request):
        # Lấy 'account_id' (ví dụ: 'account35')
        account_id = request.query_params.get('account_id', None)

        if not account_id:
            return Response(
                {"error": "Thiếu account_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            supabase = get_supabase_client()
            
            # SỬA: Truy vấn bảng "account"
            # SỬA: Select "user_name" và "image_path"
            # SỬA: Dùng "id" thay vì "account_id" để khớp
            response = supabase.table("account") \
                               .select("user_name, image_path") \
                               .eq("id", account_id) \
                               .limit(1) \
                               .execute()

            if not response.data:
                return Response(
                    {"error": f"Không tìm thấy tài khoản với id: {account_id}"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Dữ liệu trả về (ví dụ):
            # { "user_name": "s_phan_loc", "image_path": "/avatars/s_loc.jpg" }
            profile_data = response.data[0]

            # Dùng Serializer mới (sẽ định nghĩa ở bước 2)
            serializer = AccountProfileSerializer(instance=profile_data)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Lỗi truy vấn Supabase (TopBar): {e}")
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class DashboardGridAPIView(APIView):
    """
    API để LẤY (GET) toàn bộ dữ liệu cho Dashboard Grid
    từ bảng 'students'.
    """
    def get(self, request):
        account_id = request.query_params.get('account_id', None)
        if not account_id:
            return Response({"error": "Thiếu account_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            supabase = get_supabase_client()
            
            # Chọn TẤT CẢ các trường mà DashboardGridSerializer cần
            response = supabase.table("students") \
                               .select("target_date, streak_day, id, first_name, last_name, score_latest, total_exam_hour, total_test, total_exam") \
                               .eq("account_id", account_id) \
                               .limit(1) \
                               .execute()

            if not response.data:
                return Response({"error": f"Không tìm thấy học viên với account_id: {account_id}"},
                                status=status.HTTP_404_NOT_FOUND)
            
            student_data = response.data[0]
            
            # Dùng instance= để serialize (hiển thị) dữ liệu
            serializer = DashboardGridSerializer(instance=student_data)
            
            # Trả về dữ liệu đã được serialize
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Lỗi truy vấn Supabase (DashboardGrid): {e}")
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)





