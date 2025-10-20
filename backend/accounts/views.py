import psycopg2
import jwt
import uuid
from datetime import datetime, timedelta, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer
# Thư viện này dùng để kiểm tra mật khẩu đã hash an toàn
from django.contrib.auth.hashers import check_password 

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
            removed_jti = session_list.pop(0) 
            print(f"User {id}: Session cũ {removed_jti} đã bị loại bỏ để nhường chỗ.")

        # 2. Thêm session mới
        session_list.append(jti)
        self.sessions[id] = session_list
        print(f"User {id}: Session mới {jti} đã được thêm. Tổng số session: {len(session_list)}")

    def is_session_active(self, id, jti):
        """Kiểm tra JTI có còn hoạt động (nằm trong danh sách) hay không."""
        return jti in self.sessions.get(id, [])

redis_manager = RedisSessionManager()
# --- KẾT THÚC GIẢ LẬP REDIS ---

class StudentLoginAPIView(APIView):
    """
    API xác thực người dùng bằng email/mật khẩu và phát hành JWT.
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user_data = None
        
        # --- THÔNG TIN KẾT NỐI SUPABASE CỦA BẠN ---
        db_host = "db.oreasnlyzhaeteipyylw.supabase.co" 
        db_name = "postgres" 
        db_user = "postgres"
        db_password = "Utc@20032025OK" 
        SECRET_KEY = "b)-hy#9mu$@)@ahd5z+mp-t-4jsmkdq&gd#-@1+3g&4ss4e%_v" 
        # --- KẾT THÚC THÔNG TIN KẾT NỐI ---
        
        # --- 1. KẾT NỐI VÀ XÁC THỰC VỚI SUPABASE ---
        try:
            conn = psycopg2.connect(
                host=db_host, database=db_name, user=db_user,
                password=db_password, port=5432
            )
            cursor = conn.cursor()
            
            
            cursor.execute("SELECT id, password FROM account WHERE email = %s", (email,))
            result = cursor.fetchone()
            
            if result:
                id, hashed_password = result
                # PHẢI DÙNG check_password VÌ MẬT KHẨU CỦA BẠN PHẢI ĐƯỢC HASH
                if check_password(password, hashed_password):
                    user_data = {'id': id, 'email': email}
                else:
                    return Response({"error": "Email hoặc mật khẩu không chính xác."}, 
                                    status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({"error": "Email hoặc mật khẩu không chính xác."}, 
                                status=status.HTTP_401_UNAUTHORIZED)

        except psycopg2.Error as e:
            print(f"Lỗi kết nối hoặc truy vấn DB: {e}")
            return Response({"error": "Lỗi hệ thống: Không thể kết nối cơ sở dữ liệu."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'conn' in locals() and conn:
                conn.close()

        # --- 2. TẠO JWT VÀ QUẢN LÝ PHIÊN (SESSION) ---
        
        jti = str(uuid.uuid4()) # ID phiên duy nhất
        access_token_lifetime = timedelta(hours=1)
        access_token_expires = datetime.now(timezone.utc) + access_token_lifetime

        payload = {
            'id': user_data['id'],
            'email': user_data['email'],
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
        SECRET_KEY = "b)-hy#9mu$@)@ahd5z+mp-t-4jsmkdq&gd#-@1+3g&4ss4e%_v" 
        
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
