import os
# import psycopg2 # Đã loại bỏ vì chuyển sang API
import jwt
import uuid
from datetime import datetime, timedelta, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer # Giả định LoginSerializer đã được định nghĩa
from config.supabase_client import get_supabase_client
from django.contrib.auth.hashers import check_password

# Thư viện này dùng để kiểm tra mật khẩu đã hash an toàn
# from django.contrib.auth.hashers import check_password # Đã loại bỏ vì Supabase API xử lý
from supabase import create_client, Client # Thêm Supabase Client

# Định nghĩa SECRET_KEY ở đây (hoặc lấy từ biến môi trường)
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "b)-hy#9mu$@)@ahd5z+mp-t-4jsmkdq&gd#-@1+3g&4ss4e%_v")

# --- GIẢ LẬP QUẢN LÝ PHIÊN BẰNG REDIS (STATEFUL) ---
class RedisSessionManager:
    """
    Giả lập Redis/Cache để quản lý phiên và giới hạn thiết bị (MAX_DEVICES=2).
    Trong môi trường thực tế, hãy thay thế bằng thư viện Redis thật.
    """
    def __init__(self):
        # Giả lập Redis bằng một dictionary: {id: [jti_1, jti_2]}
        self.sessions = {}
        self.MAX_DEVICES = 2
    
    def get_user_sessions(self, id):
        """Lấy danh sách JTI (Session ID) của người dùng."""
        return self.sessions.get(id, [])

    def add_session(self, id, jti):
        """Thêm session mới và kiểm soát giới hạn 2 thiết bị."""
        session_list = self.sessions.get(id, [])
        
        # 1. Nếu vượt quá giới hạn, loại bỏ session cũ nhất (FIFO)
        if len(session_list) >= self.MAX_DEVICES:
            # Bỏ print
            session_list.pop(0) 

        # 2. Thêm session mới
        session_list.append(jti)
        self.sessions[id] = session_list

    def is_session_active(self, id, jti):
        """Kiểm tra JTI có còn hoạt động (nằm trong danh sách) hay không."""
        return jti in self.sessions.get(id, [])

redis_manager = RedisSessionManager()
# --- KẾT THÚC GIẢ LẬP REDIS ---

class StudentLoginAPIView(APIView):
    """
    API xác thực người dùng bằng email/mật khẩu sử dụng Supabase API và phát hành JWT.
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        # Lấy trạng thái Ghi nhớ Đăng nhập (Mặc định là False nếu không có)
        remember_me = serializer.validated_data.get('rememberMe', False) 
        
        print(f"DEBUG: Email đang đăng nhập: {email}")
        print(f"DEBUG: Mật khẩu (KHÔNG NÊN IN TRONG MÔI TRƯỜNG PRODUCTION!): {password}")
        print(f"DEBUG: Ghi nhớ Đăng nhập: {remember_me}") 
        
        user_data = None
        
        try:
            supabase = get_supabase_client()
        except Exception as e:
            print(f"Lỗi khởi tạo Supabase Client: {e}")
            return Response({"error": "Lỗi hệ thống: Không thể khởi tạo dịch vụ xác thực."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # --- 2. XÁC THỰC VỚI SUPABASE API ---
        try:
            # 1. Truy vấn bảng 'account'
            response = supabase.table('account') \
                .select('id, email, password,user_name') \
                .eq('email', email) \
                .limit(1) \
                .execute()
            user_records = response.data

            # 2. Kiểm tra kết quả
            if not user_records:
                # Nếu không tìm thấy email
                return Response({"error": "Email hoặc mật khẩu không chính xác."}, 
                                status=status.HTTP_401_UNAUTHORIZED)
            
            user = user_records[0]  
            stored_password_hash = user.get('password') # Lấy hash từ DB
                
            # --- 2.1. KIỂM TRA MẬT KHẨU (Sử dụng Django check_password) ---
            
            if not stored_password_hash:
                 # Trường hợp tài khoản tồn tại nhưng không có mật khẩu
                 return Response({"error": "Lỗi cấu hình tài khoản."}, 
                                 status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Sử dụng hàm check_password: so sánh mật khẩu thô và hash đã lưu
            # Trả về True nếu khớp, False nếu không khớp
            if check_password(password, stored_password_hash):
                # Xác thực thành công
                id = user.get('id')
                user_data = {'id': id, 'email': user.get('email'),'user_name':user.get('user_name')}
                print(f"✅ Đăng nhập thành công. ID: {id}, Dữ liệu: {user_data}")
            else:
                # Mật khẩu không khớp
                return Response({"error": "Email hoặc mật khẩu không chính xác."}, 
                                status=status.HTTP_401_UNAUTHORIZED)

        # Bắt các lỗi API (mạng, cấu hình...)
        except Exception as e:
            # Supabase thường ném lỗi nếu email/mật khẩu sai hoặc người dùng không tồn tại
            error_message = str(e)
            if 'Invalid login credentials' in error_message or 'not confirmed' in error_message:
                 return Response({"error": "Email hoặc mật khẩu không chính xác."}, 
                                 status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({"error": "Lỗi hệ thống: Không thể kết nối dịch vụ xác thực."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # --- 3. TẠO JWT VÀ QUẢN LÝ PHIÊN (SESSION) ---
        
        jti = str(uuid.uuid4()) # ID phiên duy nhất
        
        # LOGIC MỚI: Thiết lập thời gian hết hạn dựa trên remember_me
        if remember_me:
            # Ghi nhớ Đăng nhập: 7 ngày
            access_token_lifetime = timedelta(days=365)
            print("DEBUG: Thời gian sống token: 7 ngày (Ghi nhớ Đăng nhập)")
        else:
            # Phiên ngắn hạn (Không ghi nhớ): 24 giờ
            access_token_lifetime = timedelta(days=364) 
            print("DEBUG: Thời gian sống token: 24 giờ (Phiên ngắn hạn)")
        
        access_token_expires = datetime.now(timezone.utc) + access_token_lifetime

        payload = {
            'id': user_data['id'],
            'email': user_data['email'],
            'user_name': user_data["user_name"],
            'exp': int(access_token_expires.timestamp()),
            'jti': jti, # KHÓA CHÍNH để kiểm soát phiên
            'iat': int(datetime.now(timezone.utc).timestamp()),
        }
        
        try:
            jwt_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        except Exception as e:
            print(f"Lỗi tạo JWT: {e}")
            return Response({"error": "Lỗi hệ thống: Không thể tạo token."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Thêm Session ID (JTI) vào Redis để kiểm soát giới hạn 2 thiết bị
        redis_manager.add_session(user_data['id'], jti)

        return Response({
            "message": "Đăng nhập thành công!",
            "token": jwt_token,
            "id": user_data['id']
        }, status=status.HTTP_200_OK)

# TẠO MỘT VIEW ĐỂ KIỂM TRA PHIÊN (DEMO)
class TestSessionAPIView(APIView):
    """
    API được bảo vệ: Kiểm tra token hợp lệ VÀ JTI (phiên) còn hoạt động.
    """
    def get(self, request):
        auth_header = request.headers.get('Authorization', None)
        # Lấy SECRET_KEY đã định nghĩa ở trên
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({"error": "Thiếu token xác thực."}, status=status.HTTP_401_UNAUTHORIZED)
        
        jwt_token = auth_header.split(' ')[1]
        
        try:
            # Giải mã JWT
            payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=["HS256"])
            id = payload.get('id')
            jti = payload.get('jti')
            
            # Kiểm tra trạng thái phiên trong Redis
            if not redis_manager.is_session_active(id, jti):
                return Response({"error": "Phiên đã bị thu hồi hoặc hết hạn (do giới hạn thiết bị). Vui lòng đăng nhập lại."}, 
                                status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                "message": f"Truy cập thành công. User ID: {id}. Phiên (JTI) đang hoạt động.",
                "current_sessions": redis_manager.get_user_sessions(id),
            }, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Token đã hết hạn."}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Token không hợp lệ."}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": f"Lỗi không xác định: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
