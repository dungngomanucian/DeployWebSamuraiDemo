# level/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import LevelService
from .serializers import LevelSerializer # Import serializer level
import math

# View cho GET (List)
@api_view(['GET'])
def get_all_levels_view(request):
    """
    Lấy danh sách level học (có phân trang và sắp xếp).
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

    result = LevelService.get_all_levels(
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
def create_level_view(request):
    """
    Tạo một level học mới.
    """
    serializer = LevelSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        result = LevelService.create_level(validated_data)
        if result['success']:
            # Dùng lại serializer để trả về đúng cấu trúc
            response_serializer = LevelSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': result.get('error', 'Failed to create level')}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho GET (Detail)
@api_view(['GET'])
def get_level_by_id_view(request, level_id):
    """
    Lấy thông tin chi tiết của một level học.
    """
    result = LevelService.get_level_by_id(level_id)
    if result['success']:
        serializer = LevelSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        error_msg = result.get('error', 'Level not found')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({'error': error_msg}, status=status_code)

# View cho PUT/PATCH (Update)
@api_view(['PUT', 'PATCH'])
def update_level_view(request, level_id):
    """
    Cập nhật thông tin level học.
    PATCH cho phép cập nhật một phần.
    """
    partial_update = (request.method == 'PATCH')
    serializer = LevelSerializer(data=request.data, partial=partial_update)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        result = LevelService.update_level(level_id, validated_data)
        if result['success']:
            response_serializer = LevelSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            error_msg = result.get('error', 'Update failed')
            status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
            return Response({'error': error_msg}, status=status_code)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho DELETE (Soft Delete)
@api_view(['DELETE'])
def delete_level_view(request, level_id):
    """
    Xóa mềm một level học.
    """
    result = LevelService.delete_level(level_id)
    if result['success']:
        return Response(status=status.HTTP_204_NO_CONTENT) # 204 No Content cho DELETE thành công
    else:
        error_msg = result.get('error', 'Delete failed')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
        return Response({'error': error_msg}, status=status_code)