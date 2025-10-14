# my_project/supabase_client.py
import os
from supabase import create_client, Client

# Lấy URL và Key từ môi trường
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_API_KEY") 

# Khởi tạo client Supabase
supabase: Client = create_client(url, key)