# course/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import CourseService
from .serializers import CourseSerializer # Import serializer course
import math

# View cho GET (List)
@api_view(['GET'])
def get_all_courses_view(request):
    """
    Lấy danh sách khóa học (có phân trang và sắp xếp).
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

    result = CourseService.get_all_courses(
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_direction=sort_direction
    )

    if result['success']:
        # Dùng serializer để xử lý image_path thành URL
        serializer = CourseSerializer(result['data'], many=True)
        total_count = result['total_count']
        total_pages = math.ceil(total_count / limit) if limit > 0 else 0

        paginated_response = {
            'count': total_count,
            'total_pages': total_pages,
            'current_page': page,
            'limit': limit,
            'sort_by': sort_by,
            'sort_direction': sort_direction,
            'results': serializer.data # Dữ liệu đã được serialize
        }
        return Response(paginated_response, status=status.HTTP_200_OK)
    else:
        return Response({'error': result.get('error', 'Unknown error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View cho POST (Create)
@api_view(['POST'])
def create_course_view(request):
    """
    Tạo một khóa học mới.
    (Cần xử lý upload ảnh nếu image_path là file upload)
    """
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        
        # Xử lý upload ảnh (nếu cần) - Ví dụ:
        # image_file = request.FILES.get('image_file') 
        # if image_file:
        #     # Logic upload lên Supabase Storage và lấy path
        #     image_path = upload_to_supabase_storage(image_file, 'course_images') 
        #     if image_path:
        #         validated_data['image_path'] = image_path
        #     else:
        #         return Response({'error': 'Image upload failed'}, status=status.HTTP_400_BAD_REQUEST)

        result = CourseService.create_course(validated_data)
        if result['success']:
            # Dùng lại serializer để trả về đúng cấu trúc (có URL ảnh)
            response_serializer = CourseSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': result.get('error', 'Failed to create course')}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho GET (Detail)
@api_view(['GET'])
def get_course_by_id_view(request, course_id):
    """
    Lấy thông tin chi tiết của một khóa học.
    """
    result = CourseService.get_course_by_id(course_id)
    if result['success']:
        # Dùng serializer để tạo URL ảnh
        serializer = CourseSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        error_msg = result.get('error', 'Course not found')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({'error': error_msg}, status=status_code)

# View cho PUT/PATCH (Update)
@api_view(['PUT', 'PATCH'])
def update_course_view(request, course_id):
    """
    Cập nhật thông tin khóa học.
    PATCH cho phép cập nhật một phần.
    (Cần xử lý upload ảnh nếu image_path là file upload)
    """
    partial_update = (request.method == 'PATCH')
    serializer = CourseSerializer(data=request.data, partial=partial_update)
    if serializer.is_valid():
        validated_data = serializer.validated_data

        # Xử lý upload ảnh mới (nếu cần)
        # image_file = request.FILES.get('image_file')
        # if image_file:
        #     # Logic upload và cập nhật validated_data['image_path']
        #     pass 
        # elif 'image_path' in validated_data and validated_data['image_path'] is None:
        #     # Cho phép xóa ảnh bằng cách gửi image_path = null
        #     pass

        result = CourseService.update_course(course_id, validated_data)
        if result['success']:
            response_serializer = CourseSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            error_msg = result.get('error', 'Update failed')
            status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
            return Response({'error': error_msg}, status=status_code)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho DELETE (Soft Delete)
@api_view(['DELETE'])
def delete_course_view(request, course_id):
    """
    Xóa mềm một khóa học.
    """
    result = CourseService.delete_course(course_id)
    if result['success']:
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        error_msg = result.get('error', 'Delete failed')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
        return Response({'error': error_msg}, status=status_code)