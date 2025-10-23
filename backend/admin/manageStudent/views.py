"""
API Views for Student functionality in admin panel
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import StudentService
from .serializers import StudentSerializer, ClassroomSerializer
import math # Import math để tính total_pages

@api_view(['GET'])
def get_all_students(request):
    """
    Get a paginated list of all students.
    Accepts 'page' and 'limit' query parameters.
    """
    # 1. Lấy tham số page và limit từ query params
    # Mặc định page=1, limit=10 nếu không được cung cấp
    try:
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        if page < 1: page = 1
        if limit < 1: limit = 10
        # Có thể thêm giới hạn max cho limit nếu muốn (ví dụ: max=100)
        # if limit > 100: limit = 100 
    except ValueError:
        return Response({'error': 'Page and limit must be integers'}, status=status.HTTP_400_BAD_REQUEST)

    # 2. Gọi service với tham số phân trang
    result = StudentService.get_all_students(page=page, limit=limit)
    
    if result['success']:
        # 3. Serialize dữ liệu trả về từ service
        serializer = StudentSerializer(result['data'], many=True)
        
        # 4. Tính toán thông tin phân trang
        total_count = result['total_count']
        total_pages = math.ceil(total_count / limit)
        
        # 5. Tạo cấu trúc response chuẩn cho phân trang
        paginated_response = {
            'count': total_count,
            'total_pages': total_pages,
            'current_page': page,
            'limit': limit,
            'results': serializer.data # Dữ liệu thực tế nằm trong 'results'
        }
        return Response(paginated_response, status=status.HTTP_200_OK)
        
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_student_by_id(request, student_id):
    """Get student details by ID"""
    result = StudentService.get_student_by_id(student_id)
    
    if result['success']:
        serializer = StudentSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def create_student(request):
    """Create a new student"""
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        result = StudentService.create_student(serializer.validated_data)
        if result['success']:
            # Serialize the returned data
            response_serializer = StudentSerializer(result['data'][0])  # Get first item since insert returns array
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_student(request, student_id):
    """Update student information"""
    # First check if student exists
    get_result = StudentService.get_student_by_id(student_id)
    if not get_result['success']:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = StudentSerializer(data=request.data, partial=True)
    if serializer.is_valid():
        result = StudentService.update_student(student_id, serializer.validated_data)
        if result['success']:
            response_serializer = StudentSerializer(result['data'][0])  # Get first item since update returns array
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_student(request, student_id):
    """Soft delete a student"""
    result = StudentService.delete_student(student_id)
    
    if result['success']:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def filter_students(request):
    """Filter students based on query parameters"""
    # Bạn có thể cập nhật view này tương tự get_all_students nếu muốn phân trang cho filter
    # Hiện tại giữ nguyên logic cũ
    filters = {}
    if 'level_id' in request.query_params:
        filters['level_id'] = request.query_params['level_id']
    if 'search' in request.query_params:
        filters['search'] = request.query_params['search']
    
    result = StudentService.filter_students(filters)
    
    if result['success']:
        serializer = StudentSerializer(result['data'], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK) # Trả về list như cũ
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_active_classrooms_view(request):
    """
    API endpoint để lấy danh sách các lớp học đang hoạt động.
    """
    result = StudentService.get_active_classrooms()

    if result['success']:
        # Sử dụng ClassroomSerializer
        serializer = ClassroomSerializer(result['data'], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response({'error': result.get('error', 'Unknown error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)