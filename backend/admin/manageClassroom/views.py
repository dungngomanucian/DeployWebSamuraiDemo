# classroom/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import ClassroomService
from .serializers import ClassroomSerializer # Import serializer classroom
import math

# View cho GET (List)
@api_view(['GET'])
def get_all_classrooms_view(request):
    """
    Lấy danh sách lớp học (có phân trang và sắp xếp).
    """
    try:
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        if page < 1: page = 1
        if limit < 1: limit = 10
    except ValueError:
        return Response({'error': 'Page and limit must be integers'}, status=status.HTTP_400_BAD_REQUEST)

    sort_by = request.query_params.get('sort_by', None)
    sort_direction = request.query_params.get('sort_direction', 'asc').lower()
    if sort_direction not in ['asc', 'desc']:
        sort_direction = 'asc'

    result = ClassroomService.get_all_classrooms(
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_direction=sort_direction
    )

    if result['success']:
        total_count = result['total_count']
        total_pages = math.ceil(total_count / limit) if limit > 0 else 0

        paginated_response = {
            'count': total_count,
            'total_pages': total_pages,
            'current_page': page,
            'limit': limit,
            'sort_by': sort_by,
            'sort_direction': sort_direction,
            'results': result['data'] # Dữ liệu đã được service chuẩn bị
        }
        return Response(paginated_response, status=status.HTTP_200_OK)
    else:
        return Response({'error': result.get('error', 'Unknown error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View cho POST (Create)
@api_view(['POST'])
def create_classroom_view(request):
    """
    Tạo một lớp học mới.
    """
    serializer = ClassroomSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        result = ClassroomService.create_classroom(validated_data)
        if result['success']:
            response_serializer = ClassroomSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': result.get('error', 'Failed to create classroom')}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho GET (Detail)
@api_view(['GET'])
def get_classroom_by_id_view(request, classroom_id):
    """
    Lấy thông tin chi tiết của một lớp học.
    """
    result = ClassroomService.get_classroom_by_id(classroom_id)
    if result['success']:
        serializer = ClassroomSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        error_msg = result.get('error', 'Classroom not found')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({'error': error_msg}, status=status_code)

# View cho PUT/PATCH (Update)
@api_view(['PUT', 'PATCH'])
def update_classroom_view(request, classroom_id):
    """
    Cập nhật thông tin lớp học.
    PATCH cho phép cập nhật một phần.
    """
    partial_update = (request.method == 'PATCH')
    serializer = ClassroomSerializer(data=request.data, partial=partial_update)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        result = ClassroomService.update_classroom(classroom_id, validated_data)
        if result['success']:
            response_serializer = ClassroomSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            error_msg = result.get('error', 'Update failed')
            status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
            return Response({'error': error_msg}, status=status_code)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho DELETE (Soft Delete)
@api_view(['DELETE'])
def delete_classroom_view(request, classroom_id):
    """
    Xóa mềm một lớp học.
    """
    result = ClassroomService.delete_classroom(classroom_id)
    if result['success']:
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        error_msg = result.get('error', 'Delete failed')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
        return Response({'error': error_msg}, status=status_code)

# View cho lấy danh sách lớp học active (cho dropdown)
@api_view(['GET'])
def get_active_classrooms_view(request):
    """
    API endpoint để lấy danh sách các lớp học đang hoạt động.
    """
    result = ClassroomService.get_active_classrooms() # Gọi hàm service tương ứng

    if result['success']:
        # Dùng lại ClassroomSerializer hoặc tạo serializer riêng nếu cần ít trường hơn
        serializer = ClassroomSerializer(result['data'], many=True, fields=('id', 'class_code', 'class_name')) # Chỉ lấy 3 trường
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({'error': result.get('error', 'Unknown error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)