# accounts/views.py

from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from config.supabase_client import get_supabase_client
from .utils import generate_random_code, generate_four_codes, send_verification_email, hash_password
import json
import time
import pytz

# Khởi tạo Supabase client
supabase = get_supabase_client()

# Tên bảng và cấu hình
ACCOUNT_TABLE = 'account'
TEMP_VERIFICATION_TABLE = 'temp_registration' # Bảng TẠM để lưu dữ liệu form và mã code

# YÊU CẦU: Bạn phải tạo bảng TEMP_VERIFICATION_TABLE trong Supabase
# Cấu trúc: id (UUID), email (text, unique), data (jsonb), correct_code (text), expires_at (timestamp)

# --- 1. API: /api/register-start-verification (Khởi tạo xác thực) ---
class RegisterStartVerificationView(APIView):
    """
    API nhận dữ liệu đăng ký, kiểm tra email tồn tại, 
    lưu tạm vào DB, gửi mã code qua email và trả về 4 mã code hiển thị.
    """
    def post(self, request):
        data = request.data
        email = data.get('email')
        phone_number = data.get('phone')
        
        if not email:
            return Response({"success": False, "message": "Thiếu email."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. KIỂM TRA EMAIL ĐÃ TỒN TẠI TRONG BẢNG CHÍNH CHƯA
            # RLS (Row Level Security) phải được tắt hoặc cấu hình cho Service Role Key
            check_account = supabase.table(ACCOUNT_TABLE).select('email').eq('email', email).execute()
            if check_account.data:
                return Response({"success": False, "message": "Email đã tồn tại trong hệ thống. Vui lòng nhập lại."}, 
                                status=status.HTTP_400_BAD_REQUEST)
            check_account = supabase.table(ACCOUNT_TABLE).select('phone_number').eq('phone_number', phone_number).execute()
            if check_account.data:
                return Response({"success": False, "message": "số điện thoại đã tồn tại trong hệ thống. Vui lòng nhập lại."}, 
                                status=status.HTTP_400_BAD_REQUEST)
            # 2. TẠO MÃ XÁC THỰC VÀ THỜI GIAN HẾT HẠN (Ví dụ: 10 phút)
            correct_code = generate_random_code(6)
            codes_for_frontend = generate_four_codes(correct_code)
            
            # 3. GỬI EMAIL THẬT
            # Hàm này sẽ ném ngoại lệ nếu gửi thất bại
            send_verification_email(email, correct_code) 
            
            # 4. LƯU TẠM DỮ LIỆU ĐĂNG KÝ VÀ MÃ CODE
            
            # Dữ liệu sẽ hết hạn sau 10 phút (600 giây)
            expires_at = int(time.time()) + 600 
            
            temp_data = {
                "email": email,
                # Lưu toàn bộ data form, bao gồm cả password (chưa hash)
                "data": json.dumps(data), 
                "correct_code": correct_code,
                "expires_at": expires_at
            }
            
            # Insert hoặc Upsert (nếu email đã có trong bảng tạm do người dùng nhấn gửi lại)
            # Chúng ta sẽ sử dụng Upsert để tiện cho chức năng Gửi lại mã (Resend)
            response_temp = supabase.table(TEMP_VERIFICATION_TABLE).upsert(temp_data, on_conflict='email').execute()
            
            if not response_temp.data:
                raise Exception("Không thể lưu dữ liệu tạm vào bảng temp_registration.")

            # 5. TRẢ VỀ CÁC MÃ CODE CHO FRONTEND
            return Response({
                "success": True, 
                "message": "Đã gửi 4 mã code đến email. Vui lòng kiểm tra hộp thư.", 
                "codes": codes_for_frontend
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Lỗi khởi tạo xác thực: {e}")
            return Response({"success": False, "message": f"Lỗi hệ thống hoặc gửi email: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- 2. API: /api/verify-and-register (Xác thực và tạo tài khoản) ---
class VerifyAndRegisterView(APIView):
    """
    API nhận mã code, kiểm tra mã code và hoàn tất việc tạo tài khoản vào bảng account.
    """
    def post(self, request):
        selected_code = request.data.get('code')
        email = request.data.get('email') # Email được gửi trong pendingFormData từ frontend

        if not email or not selected_code:
            return Response({"success": False, "message": "Thiếu thông tin email hoặc mã xác thực."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 1. TÌM DỮ LIỆU TẠM THỜI TỪ BẢNG TEMP
            response_temp = supabase.table(TEMP_VERIFICATION_TABLE).select('*').eq('email', email).limit(1).execute()
            temp_record = response_temp.data[0] if response_temp.data else None
            if temp_record:
                # Lấy giá trị khóa chính (ví dụ: 'id') của bản ghi bạn vừa tìm thấy
                # Giả sử khóa chính là 'id' - bạn có thể cần thay đổi nó tùy theo thiết kế bảng
                record_email = temp_record.get('email') 
                
                # Thực hiện lệnh xóa
                response_delete = (
                    supabase.table(TEMP_VERIFICATION_TABLE)
                    .delete()
                    .eq('email', record_email)
                    .execute()
                )

            if not temp_record:
                return Response({"success": False, "message": "Phiên đăng ký không tồn tại. Vui lòng đăng ký lại."}, 
                                status=status.HTTP_400_BAD_REQUEST)

            # 2. KIỂM TRA MÃ CODE
            if selected_code != temp_record.get('correct_code'):
                return Response({"success": False, "message": "Mã xác thực không hợp lệ. Vui lòng kiểm tra email và chọn lại mã đúng."}, 
                                status=status.HTTP_400_BAD_REQUEST)

            # 3. KIỂM TRA THỜI GIAN HẾT HẠN
            expires_at = temp_record.get('expires_at', 0)
            if int(time.time()) > expires_at:
                # Xóa bản ghi hết hạn
                supabase.table(TEMP_VERIFICATION_TABLE).delete().eq('email', email).execute()
                return Response({"success": False, "message": "Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới."}, 
                                status=status.HTTP_400_BAD_REQUEST)

            # 4. CHUẨN BỊ DỮ LIỆU VÀ HASH MẬT KHẨU
            form_data = json.loads(temp_record['data'])
            now_utc = datetime.now(pytz.utc).isoformat() # type: ignore
            # Hash mật khẩu trước khi lưu vào bảng account
            hashed_password = hash_password(form_data['password'])
            
            new_account_data = {
                # Map các trường: name -> user_name, email -> email, phone -> phone_number, password -> password (hashed)
                "user_name": form_data['name'],
                "email": form_data['email'],
                "phone_number": form_data['phone'],
                "password": hashed_password, 
                "created_at": now_utc
            }
            
            # 5. TẠO TÀI KHOẢN CHÍNH THỨC (Insert vào bảng 'account')
            response_account = supabase.table("account").insert(new_account_data).execute()

            if not response_account.data:
                raise Exception("Không thể tạo tài khoản Supabase. Lỗi DB.")
                
            # 6. XÓA BẢN GHI TẠM THỜI
            supabase.table(TEMP_VERIFICATION_TABLE).delete().eq('email', email).execute()

            return Response({
                "success": True, 
                "message": "Đăng ký và xác thực email thành công! Bạn có thể đăng nhập."
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Lỗi xác thực và đăng ký: {e}")
            return Response({"success": False, "message": f"Lỗi không xác định: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)