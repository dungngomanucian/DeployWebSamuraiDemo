# backend/student/dashboard/views.py
from config.supabase_client import get_supabase_client
from typing import Dict
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
    API để LẤY (GET) toàn bộ dữ liệu cho Dashboard Grid:
    1. Dữ liệu từ bảng 'students'.
    2. Dữ liệu ĐIỂM TRUNG BÌNH LUYỆN ĐỀ (tính toán từ 'exam_result_sections').
    """
    def _get_practice_summary(self, supabase, account_id: str) -> Dict:
        """
        [Hàm private] Tính điểm trung bình luyện đề cho học sinh.
        """
        try:
            # 1. Lấy student.id (để join)
            student_res = supabase.table("students").select("id").eq("account_id", account_id).single().execute()
            if not student_res.data:
                print(f"DashboardGrid: Không tìm thấy student.id cho account_id {account_id}")
                return {}
            actual_student_id = student_res.data['id']

            # 2. Chạy truy vấn lồng nhau (join)
            sections_res = supabase.table("exam_result_sections")\
                .select("""
                    score, 
                    max_score,
                    exam_results!inner (
                        student_id,
                        jlpt_exams!inner (
                            request_score,
                            levels!inner (title)
                        )
                    ),
                    jlpt_exam_sections!inner (
                        id, 
                        vietsub
                    )
                """)\
                .eq("exam_results.student_id", actual_student_id)\
                .execute()
            
            if not sections_res.data:
                print(f"DashboardGrid: Không có exam_result_sections cho student_id {actual_student_id}")
                return {}

            # 3. Tính toán điểm trung bình
            summary_by_level = {}
            
            for row in sections_res.data:
                try:
                    level_title = row['exam_results']['jlpt_exams']['levels']['title']
                    sec_name = row['jlpt_exam_sections']['vietsub']
                    req_score = row['exam_results']['jlpt_exams'].get('request_score', 90)
                    
                    if not level_title or not sec_name:
                        continue
                        
                    if level_title not in summary_by_level:
                        summary_by_level[level_title] = {
                            'sections': {},
                            'request_score': req_score
                        }
                    
                    if sec_name not in summary_by_level[level_title]['sections']:
                        summary_by_level[level_title]['sections'][sec_name] = {'score_sum': 0.0, 'max_sum': 0.0, 'count': 0}
                        
                    summary_by_level[level_title]['sections'][sec_name]['score_sum'] += float(row.get('score', 0))
                    summary_by_level[level_title]['sections'][sec_name]['max_sum'] += float(row.get('max_score', 0))
                    summary_by_level[level_title]['sections'][sec_name]['count'] += 1
                
                except (KeyError, TypeError, AttributeError) as e:
                    print(f"DashboardGrid: Bỏ qua 1 hàng bị lỗi join: {e}")
                    continue

            # 4. Tạo dict trả về (ĐẢM BẢO VÒNG LẶP ĐÚNG)
            final_response = {}
            
            for level_title, level_data in summary_by_level.items():
                summary = level_data['sections']
                request_score_for_level = level_data['request_score']
                
                final_sections = []
                overall_score = 0
                overall_max = 0
                
                for name, data in summary.items():
                    if data['count'] == 0: continue
                    
                    avg_score = round(data['score_sum'] / data['count'])
                    avg_max = round(data['max_sum'] / data['count'])
                    
                    overall_score += avg_score
                    overall_max += avg_max
                    
                    is_low_score = avg_score <= 29 
                    
                    final_sections.append({
                        'title': name,
                        'score': avg_score,
                        'max': avg_max,
                        'isLow': is_low_score
                    })

                final_response[level_title] = {
                    "overall": overall_score,
                    "maxOverall": overall_max,
                    "sections": final_sections,
                    "request_score": request_score_for_level
                }

            return final_response

        except Exception as e:
            print(f"Lỗi khi tính _get_practice_summary: {str(e)}")
            return {}
        

    def get(self, request):
        account_id = request.query_params.get('account_id', None)
        if not account_id:
            return Response({"error": "Thiếu account_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            supabase = get_supabase_client()
            
            # 1. Lấy dữ liệu students (như cũ)
            response = supabase.table("students") \
                               .select("target_date, streak_day, id, first_name, last_name, score_latest, total_exam_hour, total_test, total_exam") \
                               .eq("account_id", account_id) \
                               .limit(1) \
                               .execute()

            if not response.data:
                return Response({"error": f"Không tìm thấy học viên với account_id: {account_id}"},
                                status=status.HTTP_404_NOT_FOUND)
            
            student_data = response.data[0] # Đây là dict
            
            # 2. Lấy dữ liệu Practice Summary (MỚI)
            practice_summary_data = self._get_practice_summary(supabase, account_id)
            
            # 3. Gộp 2 dict lại
            student_data['practice_summary'] = practice_summary_data
            
            # 4. Serialize (hiển thị) dữ liệu
            # (Chúng ta cần sửa Serializer để nhận 'practice_summary')
            serializer = DashboardGridSerializer(instance=student_data)
            
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Lỗi truy vấn Supabase (DashboardGrid): {e}")
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)




