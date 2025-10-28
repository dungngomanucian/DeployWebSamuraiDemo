# auth_admin/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, Optional, Any
import bcrypt
# (Rất quan trọng) Import hàm kiểm tra password hash
# Nếu bạn dùng hệ thống hash của Django:
# from django.contrib.auth.hashers import check_password
# Nếu bạn dùng thư viện khác (ví dụ bcrypt):
# import bcrypt

ADMIN_TABLE = 'admins' # Tên bảng admin

class AuthAdminService:
    """Service layer for handling admin authentication"""

    @staticmethod
    def authenticate_admin(email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Xác thực admin dựa trên email và password từ bảng 'admins'.

        Args:
            email (str): Email của admin.
            password (str): Password (chưa hash) được gửi từ client.

        Returns:
            Optional[Dict[str, Any]]: Dictionary chứa thông tin admin nếu xác thực thành công,
                                      hoặc None nếu thất bại.
        """
        try:
            # 1. Tìm admin bằng email trong bảng 'admins'
            response = supabase.table(ADMIN_TABLE)\
                .select('*')\
                .eq('email', email)\
                .maybe_single()\
                .execute() # maybe_single() trả về None nếu không tìm thấy, không lỗi

            admin_data = response.data

            # 2. Kiểm tra xem admin có tồn tại không
            if not admin_data:
                print(f"AuthAdminService: Admin not found for email {email}")
                return None

            # 3. Kiểm tra password
            stored_password_hash = admin_data.get('password') # Lấy password hash từ DB
            if not stored_password_hash:
                 print(f"AuthAdminService: No password found for admin {email}")
                 return None # Lỗi: admin không có password trong DB?

            # --- PHẦN KIỂM TRA PASSWORD ---
            # IMPORTANT: Thay thế bằng cách kiểm tra hash thực tế của bạn
            # Ví dụ nếu dùng Django hasher:
            # is_password_valid = check_password(password, stored_password_hash)

            # Ví dụ nếu dùng bcrypt:
            is_password_valid = bcrypt.checkpw(password.encode('utf-8'), stored_password_hash.encode('utf-8'))
            
            # Tạm thời dùng so sánh chuỗi (CHỈ DÙNG ĐỂ TEST, RẤT KHÔNG AN TOÀN)
            # is_password_valid = (password == stored_password_hash) 
            print(f"AuthAdminService: Password check for {email}. Valid: {is_password_valid}")
            # --- HẾT PHẦN KIỂM TRA PASSWORD ---

            if is_password_valid:
                # Xác thực thành công, trả về thông tin admin (có thể bỏ password hash đi)
                # admin_data.pop('password', None) # Bỏ password trước khi trả về
                return admin_data
            else:
                # Sai password
                return None

        except Exception as e:
            print(f"AuthAdminService: Error during authentication for {email}: {e}")
            return None # Trả về None nếu có lỗi xảy ra