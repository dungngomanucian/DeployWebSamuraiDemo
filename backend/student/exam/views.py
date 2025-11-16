"""
API Views for Exam functionality
"""
import jwt
import os
from config.supabase_client import supabase
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "b)-hy#9mu$@)@ahd5z+mp-t-4jsmkdq&gd#-@1+3g&4ss4e%_v")

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import ExamService
from .serializers import (
    LevelSerializer, 
    ExamSerializer, 
    FullExamDataSerializer,
    ExamResultSerializer,
    StudentAnswerSerializer,
    ExamSubmissionSerializer,
    ListeningExamSubmissionSerializer
)



@api_view(['GET'])
def get_levels(request):
    """Get all JLPT levels"""
    result = ExamService.get_levels()
    
    if result['success']:
        serializer = LevelSerializer(result['data'], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_exam_by_id(request, exam_id):
    """Get exam details by ID"""
    result = ExamService.get_exam_by_id(exam_id)
    
    if result['success']:
        serializer = ExamSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_exams_by_level(request, level_id):
    """Get all exams for a specific level"""
    result = ExamService.get_exams_by_level(level_id)
    
    if result['success']:
        try:
            serializer = ExamSerializer(result['data'], many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error serializing exam data: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Serialization error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'error': result.get('error', 'Unknown error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_full_exam_data(request, exam_id):
    """Get complete exam data including all questions and answers"""
    try:
        # Check if client is still connected
        if hasattr(request, '_closed') and request._closed:
            return Response({'error': 'Client disconnected'}, status=499)
        
        result = ExamService.get_full_exam_data(exam_id)
        
        # Check again before sending response
        if hasattr(request, '_closed') and request._closed:
            return Response({'error': 'Client disconnected'}, status=499)
        
        if result['success']:
            # Return raw data without serialization to preserve nested structure
            return Response(result['data'], status=status.HTTP_200_OK)
        return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except BrokenPipeError:
        # Client closed connection - suppress error
        return Response({'error': 'Connection closed'}, status=499)
    except (ConnectionResetError, ConnectionAbortedError) as e:
        # Connection errors - suppress
        return Response({'error': 'Connection error'}, status=499)
    except Exception as e:
        # Log other errors
        import traceback
        print(f"Error in get_full_exam_data: {e}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Xu ly luu bai thi

@api_view(['POST'])
# Bỏ @permission_classes([IsAuthenticated])
def submit_exam(request, exam_id):
    """
    Nhận bài nộp của học sinh, tính điểm, và lưu kết quả.
    """
    # 1. Lấy student_id từ token (đã được decode)
    # Sử dụng logic giải mã token bằng tay (custom auth).
    
    # === BƯỚC A: XÁC THỰC TOKEN BẰNG TAY (Copy TestSessionAPIView) ===
    auth_header = request.headers.get('Authorization', None)
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({"error": "Thiếu token xác thực."}, status=status.HTTP_401_UNAUTHORIZED)
    
    jwt_token = auth_header.split(' ')[1]
    
    try:
        # Giải mã JWT
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=["HS256"])
        account_id = payload.get('id')

        if not account_id:
            return Response({"error": "Token không hợp lệ (thiếu ID)."}, status=status.HTTP_401_UNAUTHORIZED)

        # === Dùng account_id để lấy student.id ===
        student_res = supabase.table('students')\
            .select('id')\
            .eq('account_id', account_id)\
            .single()\
            .execute()

        if not student_res.data:
            return Response({"error": "Không tìm thấy hồ sơ học sinh cho tài khoản này."}, status=status.HTTP_404_NOT_FOUND)

        student_id = student_res.data['id']
    # =================================================

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token đã hết hạn."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Token không hợp lệ."}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": f"Lỗi không xác định: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # === KẾT THÚC BƯỚC XÁC THỰC ===
    
    # 2. Validate dữ liệu gửi lên (duration, answers)
    serializer = ExamSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    validated_data = serializer.validated_data
    
    # 3. Gọi service để xử lý
    result = ExamService.submit_full_exam(
        student_id=student_id,
        exam_id=exam_id,
        duration=validated_data['duration'],
        answers_list=validated_data['answers']
    )
    
    if result['success']:
        # Trả về kết quả (gồm id, điểm, ...)
        serializer = ExamResultSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def save_exam_result(request):
    """Save exam result"""
    serializer = ExamResultSerializer(data=request.data)
    if serializer.is_valid():
        result = ExamService.save_exam_result(serializer.validated_data)
        if result['success']:
            return Response(result['data'], status=status.HTTP_201_CREATED)
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def save_student_answers(request):
    """Save student answers"""
    answers = request.data.get('answers', [])
    serializer = StudentAnswerSerializer(data=answers, many=True)
    if serializer.is_valid():
        result = ExamService.save_student_answers(serializer.validated_data)
        if result['success']:
            return Response(result['data'], status=status.HTTP_201_CREATED)
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def submit_listening_exam(request, exam_id):
    """Submit listening exam - updates existing exam_result with listening scores"""
    # Authentication
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
            return Response({"error": "Không tìm thấy hồ sơ học sinh cho tài khoản này."}, status=status.HTTP_404_NOT_FOUND)

        student_id = student_res.data['id']

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token đã hết hạn."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Token không hợp lệ."}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": f"Lỗi không xác định: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Validate data - sử dụng ListeningExamSubmissionSerializer cho phép answers rỗng
    serializer = ListeningExamSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    validated_data = serializer.validated_data
    
    # Get exam_result_id from request
    exam_result_id = request.data.get('exam_result_id')
    if not exam_result_id:
        return Response({"error": "exam_result_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Call service
    result = ExamService.submit_listening_exam(
        exam_result_id=exam_result_id,
        student_id=student_id,
        exam_id=exam_id,
        duration=validated_data['duration'],
        answers_list=validated_data['answers']
    )
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_200_OK)
    else:
        return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)
