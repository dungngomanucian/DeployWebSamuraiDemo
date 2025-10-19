# my_project/supabase_client.py
import os
from supabase import create_client, Client
from django.conf import settings

def get_supabase_client(key: Optional[str] = None, url: Optional[str] = None) -> Client:
    """
    Trả về Supabase client. Tham số dùng cho test hoặc override.
    """
    supabase_url = url or settings.SUPABASE_URL
    supabase_key = key or settings.SUPABASE_SECRET_KEY  # hoặc SUPABASE_ANON_KEY tuỳ use-case
    # --- BẮT ĐẦU PHẦN THÊM VÀO ĐỂ DEBUG ---
    print("--- get_supabase_client() was called ---")
    print(f"URL being used: {supabase_url}")

    # ⚠️ Cảnh báo bảo mật: Không nên in toàn bộ secret key ra ngoài.
    # Cách an toàn hơn là chỉ kiểm tra xem nó có tồn tại hay không.
    print(f"Key is loaded: {bool(supabase_key)}")
    # Hoặc in ra vài ký tự cuối để xác nhận
    if supabase_key:
        print(f"Key ends with: ...{supabase_key[-4:]}")
    print("--------------------------------------")
    # --- KẾT THÚC PHẦN THÊM VÀO ---
    return create_client(supabase_url, supabase_key)