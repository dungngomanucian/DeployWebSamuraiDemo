# account/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import AccountService
from .serializers import AccountSerializer # Import serializer account
import math

# View cho GET (List)
@api_view(['GET'])
def get_all_accounts_view(request):
    """
    Lấy danh sách tài khoản (có phân trang và sắp xếp).
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

    result = AccountService.get_all_accounts(
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_direction=sort_direction
    )

    if result['success']:
        # Không cần serializer ở đây vì service đã chọn lọc cột trả về
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
def create_account_view(request):
    """
    Tạo một tài khoản mới.
    """
    serializer = AccountSerializer(data=request.data)
    if serializer.is_valid():
        # (Quan trọng) Xử lý hash password ở đây trước khi gọi service
        validated_data = serializer.validated_data
        password = validated_data.get('password')
        if password:
            # validated_data['password'] = make_password(password) # Dùng hàm hash
            print(f"Password to be hashed: {password}") # Tạm thời in ra
        else:
             return Response({'error': {'password': ['Password is required.']}}, status=status.HTTP_400_BAD_REQUEST)

        result = AccountService.create_account(validated_data)
        if result['success']:
            # Dùng lại serializer để trả về đúng cấu trúc (không có password)
            response_serializer = AccountSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': result.get('error', 'Failed to create account')}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho GET (Detail)
@api_view(['GET'])
def get_account_by_id_view(request, account_id):
    """
    Lấy thông tin chi tiết của một tài khoản.
    """
    result = AccountService.get_account_by_id(account_id)
    if result['success']:
        # Dùng serializer để đảm bảo đúng cấu trúc trả về
        serializer = AccountSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        # Service trả về lỗi 404 nếu không tìm thấy
        error_msg = result.get('error', 'Account not found')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_500_INTERNAL_SERVER_ERROR
        return Response({'error': error_msg}, status=status_code)

# View cho PUT/PATCH (Update)
@api_view(['PUT', 'PATCH'])
def update_account_view(request, account_id):
    """
    Cập nhật thông tin tài khoản.
    PATCH cho phép cập nhật một phần.
    """
    # Kiểm tra xem có phải là PATCH không
    partial_update = (request.method == 'PATCH')

    serializer = AccountSerializer(data=request.data, partial=partial_update)
    if serializer.is_valid():
        validated_data = serializer.validated_data

        # (Quan trọng) Xử lý hash password nếu có cập nhật password
        password = validated_data.get('password')
        if password:
            # validated_data['password'] = make_password(password)
             print(f"Password to be hashed (update): {password}") # Tạm thời in ra
        elif 'password' in validated_data:
             # Nếu gửi lên key password rỗng thì bỏ qua, không update
             del validated_data['password']

        result = AccountService.update_account(account_id, validated_data)
        if result['success']:
            response_serializer = AccountSerializer(result['data'])
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            # Service trả về lỗi nếu không tìm thấy hoặc lỗi khác
            error_msg = result.get('error', 'Update failed')
            status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
            return Response({'error': error_msg}, status=status_code)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View cho DELETE (Soft Delete)
@api_view(['DELETE'])
def delete_account_view(request, account_id):
    """
    Xóa mềm một tài khoản.
    """
    result = AccountService.delete_account(account_id)
    if result['success']:
        return Response(status=status.HTTP_204_NO_CONTENT) # 204 No Content là chuẩn cho DELETE thành công
    else:
        error_msg = result.get('error', 'Delete failed')
        status_code = status.HTTP_404_NOT_FOUND if 'not found' in error_msg.lower() else status.HTTP_400_BAD_REQUEST
        return Response({'error': error_msg}, status=status_code)