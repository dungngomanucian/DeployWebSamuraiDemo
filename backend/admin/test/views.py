# admin/test/views.py
from django.http import JsonResponse
# 👇 1. Import hàm get_supabase_client thay vì đối tượng supabase
from config.supabase_client import get_supabase_client

def get_test_data(request):
    """
    View này sẽ truy vấn và trả về tất cả các dòng
    trong bảng 'admins' từ Supabase.
    """
    try:
        # 👇 2. Gọi hàm để lấy một đối tượng client mới
        supabase = get_supabase_client()

        # 3. Sử dụng đối tượng client đó để thực hiện truy vấn
        response = supabase.table('account').select('*').execute()

        return JsonResponse({'admins': response.data})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)