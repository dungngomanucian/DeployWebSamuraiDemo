# tạo mã hash mật khẩu và gửi email

import random
import string
import os
from django.core.mail import send_mail
from django.conf import settings # Dùng để lấy EMAIL_HOST_USER
from django.contrib.auth.hashers import make_password # Dùng để hash password

# --- 1. HASH MẬT KHẨU ---
def hash_password(raw_password: str) -> str:
    """Hash mật khẩu bằng Argon2 (theo cấu hình của settings.py)"""
    # Django mặc định sử dụng thuật toán trong PASSWORD_HASHERS
    return make_password(raw_password) 

# --- 2. TẠO MÃ XÁC THỰC NGẪU NHIÊN ---
def generate_random_code(length: int = 6) -> str:
    """Tạo mã xác thực gồm các chữ số ngẫu nhiên"""
    return ''.join(random.choices(string.digits, k=length))

def generate_four_codes(correct_code: str) -> list[str]:
    """Tạo ra 4 mã code, trong đó có 1 mã đúng và 3 mã sai ngẫu nhiên."""
    codes = [correct_code]
    while len(codes) < 4:
        # Tạo mã sai đảm bảo không trùng với mã đúng hoặc các mã sai đã có
        fake_code = generate_random_code(len(correct_code))
        if fake_code not in codes:
            codes.append(fake_code)
    
    random.shuffle(codes) # Trộn ngẫu nhiên vị trí các mã
    return codes

# --- 3. GỬI EMAIL XÁC THỰC ---
def send_verification_email(recipient_email: str, correct_code: str) -> None:
    """Gửi mã xác thực qua email"""
    
    subject = 'Mã Xác Thực Đăng Ký Tài Khoản SAMURAI JAPANESE APP'
    
    # Body email sẽ chứa MÃ ĐÚNG. 
    # MÃ SAI sẽ được sinh và hiển thị trên frontend.
    message = f"""
    Xin chào,

    Cảm ơn bạn đã đăng ký tài khoản.
    
    Mã xác thực **ĐÚNG** của bạn là: {correct_code}
    
    Vui lòng quay lại ứng dụng và nhấp vào nút chứa mã code này trong 4 lựa chọn để hoàn tất việc đăng ký.

    Lưu ý: Mã này có thể chỉ có hiệu lực trong vài phút.

    Trân trọng,
    Đội ngũ Hỗ trợ SAMURAI
    """
    
    try:
        send_mail(
            subject,
            message,
            # Lấy email người gửi từ settings (cũng là biến môi trường)
            settings.DEFAULT_FROM_EMAIL, 
            [recipient_email],
            fail_silently=False, # Báo lỗi nếu việc gửi thất bại
        )
        print(f"DEBUG: Đã gửi mã {correct_code} tới {recipient_email}")
    except Exception as e:
        print(f"LỖI GỬI EMAIL: {e}")
        raise # Ném lỗi để API có thể xử lý