# auth_admin/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, Optional, Any
# (QUAN TRỌNG) Import Argon2
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError # Lỗi khi xác thực sai

ADMIN_TABLE = 'admins' # Tên bảng admin

# Tạo một instance của PasswordHasher để sử dụng lại
ph = PasswordHasher()

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

            # --- PHẦN KIỂM TRA PASSWORD (SỬ DỤNG ARGON2) ---
            is_password_valid = False # Đặt mặc định là không hợp lệ
            try:
                # ph.verify() nhận vào hash (string) và password (string)
                # Nếu khớp: hàm chạy thành công
                # Nếu không khớp: ném ra lỗi VerifyMismatchError
                ph.verify(stored_password_hash, password)
                
                # Nếu không có lỗi, mật khẩu là đúng
                is_password_valid = True 
                
            except VerifyMismatchError:
                # Lỗi này có nghĩa là password KHÔNG khớp
                is_password_valid = False
            except Exception as e:
                # Bắt các lỗi Argon2 khác (ví dụ: hash không hợp lệ)
                print(f"AuthAdminService: Argon2 verification error for {email}: {e}")
                is_password_valid = False
            
            print(f"AuthAdminService: Password check for {email}. Valid: {is_password_valid}")
            # --- HẾT PHẦN KIỂM TRA PASSWORD ---

            if is_password_valid:
                # Xác thực thành công, trả về thông tin admin
                admin_data.pop('password', None) 
                return admin_data
            else:
                # Sai password
                return None

        except Exception as e:
            print(f"AuthAdminService: Error during authentication for {email}: {e}")
            return None # Trả về None nếu có lỗi chung xảy ra