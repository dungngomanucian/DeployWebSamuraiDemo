# results/views.py (Tệp mới)

import jwt
import os
from config.supabase_client import supabase
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "b)-hy#9mu$@)@ahd5z+mp-t-4jsmkdq&gd#-@1+3g&4ss4e%_v")

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Import Service và Serializer MỚI
from .services import ResultService
from .serializers import ExamResultHistorySerializer

@api_view(['GET'])
def get_exam_history(request):
    """
    API Endpoint: GET /api/student/exam-results/history/
    Lấy lịch sử bài làm của học sinh đang đăng nhập.
    """
    
    # === BƯỚC A: XÁC THỰC TOKEN BẰNG TAY ===
    # (Đây là logic bạn đã dùng trong 'submit_exam', ta dùng lại)
    auth_header = request.headers.get('Authorization', None)
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({"error": "Thiếu token xác thực."}, status=status.HTTP_401_UNAUTHORIZED)
    
    jwt_token = auth_header.split(' ')[1]
    
    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=["HS256"])
        account_id = payload.get('id')
        if not account_id:
            return Response({"error": "Token không hợp lệ (thiếu ID)."}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy student.id từ account_id
        student_res = supabase.table('students')\
            .select('id')\
            .eq('account_id', account_id)\
            .single()\
            .execute()

        if not student_res.data:
            return Response({"error": "Không tìm thấy hồ sơ học sinh cho tài khoản này."}, status=status.HTTP_404_NOT_FOUND)

        student_id = student_res.data['id']
    
    except jwt.ExpiredSignatureError:
        return Response({"error": "Token đã hết hạn."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Token không hợp lệ."}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": f"Lỗi xác thực: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # === KẾT THÚC BƯỚC XÁC THỰC ===

    
    # === BƯỚC B: GỌI SERVICE ===
    result = ResultService.get_exam_history_by_student(student_id)
    
    if result['success']:
        # === BƯỚC C: SERIALIZE DỮ LIỆU ===
        # Chúng ta dùng ExamResultHistorySerializer để định dạng data
        serializer = ExamResultHistorySerializer(result['data'], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_exam_result_detail(request, exam_result_id):
    """
    API Endpoint: GET /api/student/exam-results/<exam_result_id>/
    Lấy chi tiết một bài làm (để review).
    """
    
    # === BƯỚC A: XÁC THỰC TOKEN (Lấy student_id) ===
    auth_header = request.headers.get('Authorization', None)
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({"error": "Thiếu token xác thực."}, status=status.HTTP_401_UNAUTHORIZED)
    
    jwt_token = auth_header.split(' ')[1]
    
    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=["HS256"])
        account_id = payload.get('id')
        if not account_id:
            return Response({"error": "Token không hợp lệ (thiếu ID)."}, status=status.HTTP_401_UNAUTHORIZED)

        student_res = supabase.table('students')\
            .select('id')\
            .eq('account_id', account_id)\
            .single()\
            .execute()

        if not student_res.data:
            return Response({"error": "Không tìm thấy hồ sơ học sinh."}, status=status.HTTP_404_NOT_FOUND)

        student_id = student_res.data['id']
    
    except jwt.ExpiredSignatureError:
        return Response({"error": "Token đã hết hạn."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Token không hợp lệ."}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": f"Lỗi xác thực: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # === KẾT THÚC XÁC THỰC ===

    
    # === BƯỚC B: GỌI SERVICE (Tạo ở Bước 3) ===
    
    # Chúng ta truyền cả student_id (từ token) và exam_result_id (từ URL)
    # để Service kiểm tra xem học sinh này có quyền xem kết quả này không.
    result = ResultService.get_result_detail(
        student_id=student_id, 
        exam_result_id=exam_result_id
    )
    
    # === BƯỚC C: TRẢ VỀ RESPONSE ===
    if result['success']:
        # Service sẽ trả về dữ liệu (result['data']) đã được xử lý
        # Chúng ta không cần Serializer ở đây vì dữ liệu rất phức tạp
        return Response(result['data'], status=status.HTTP_200_OK)
    else:
        # Nếu service trả về lỗi (vd: không tìm thấy, không có quyền)
        # Chúng ta dùng status 404 (Not Found) chung cho đơn giản
        return Response({'error': result.get('error', 'Không tìm thấy kết quả')}, status=status.HTTP_404_NOT_FOUND)