from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from config.supabase_client import get_supabase_client
from django.conf import settings
from django.contrib.auth.hashers import make_password
import json, secrets, hashlib, os
from datetime import datetime, timezone, timedelta
from rest_framework.decorators import api_view

@api_view(['POST'])
@csrf_exempt
def forgot_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        email = body.get("email")
        if not email:
            return JsonResponse({"error": "Thiếu email"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)

    # Kết nối Supabase
    supabase = get_supabase_client()

    try:
        user = supabase.table("account").select("id").eq("email", email).execute()
    except Exception as e:
        return JsonResponse({"error": f"Lỗi truy vấn Supabase: {str(e)}"}, status=500)

    if not user.data:
        return JsonResponse({"error": "Email không tồn tại"}, status=404)

    # Tạo token ngẫu nhiên
    token = secrets.token_urlsafe(32)

    # Gửi email reset
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password?token={token}"

    subject = "Đặt lại mật khẩu của bạn"
    message = (
        f"Xin chào,\n\n"
        f"Bạn đã yêu cầu đặt lại mật khẩu.\n"
        f"Nhấn vào liên kết sau để tạo mật khẩu mới:\n{reset_link}\n\n"
        f"Nếu bạn không yêu cầu, hãy bỏ qua email này."
    )

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Lỗi khi gửi email: {e}")
        return JsonResponse({"error": f"Lỗi gửi mail: {str(e)}"}, status=500)

    # print("Token gốc:", token)
    # print("Hash lưu DB:", hashlib.sha256(token.encode()).hexdigest())
    # Hash token & lưu DB
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()

    try:
        supabase.table("password_reset_tokens").insert({
            "user_id": user.data[0]["id"],
            "token_hash": token_hash,
            "expires_at": expires_at,
            "used": False,
        }).execute()
    except Exception as e:
        return JsonResponse({"error": f"Lỗi lưu token: {str(e)}"}, status=500)

    return JsonResponse({"message": "Đã gửi email đặt lại mật khẩu"})

@api_view(['POST'])
@csrf_exempt
def reset_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        token = body.get("token")
        new_password = body.get("new_password")
        if not token or not new_password:
            return JsonResponse({"error": "Thiếu token hoặc mật khẩu mới"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)

    # Hash token để so sánh
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    supabase = get_supabase_client()

    # Tìm token trong DB
    result = supabase.table("password_reset_tokens")\
        .select("*")\
        .eq("token_hash", token_hash)\
        .eq("used", False)\
        .execute()

    if not result.data:
        return JsonResponse({"error": "Token không hợp lệ hoặc đã được sử dụng"}, status=400)

    token_record = result.data[0]

    # Kiểm tra hết hạn
    expires_at = datetime.fromisoformat(token_record["expires_at"].replace("Z", "+00:00"))
    if expires_at < datetime.now(timezone.utc):
        return JsonResponse({"error": "Token đã hết hạn"}, status=400)

    user_id = token_record["user_id"]

    # Cập nhật mật khẩu mới 
    # Dùng Argon2 với salt để mã hóa 
    hashed_password = make_password(new_password)
    supabase.table("account").update({"password": hashed_password}).eq("id", user_id).execute()

    # Đánh dấu token là đã dùng
    supabase.table("password_reset_tokens").update({"used": True}).eq("id", token_record["id"]).execute()

    return JsonResponse({"message": "Đặt lại mật khẩu thành công"})

@api_view(['POST'])
@csrf_exempt
def verify_reset_token(request):
    """Xác thực token đặt lại mật khẩu"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        token = body.get("token")
        if not token:
            return JsonResponse({"error": "Thiếu token"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)

    # Hash token để so sánh
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    supabase = get_supabase_client()

    # Tìm token trong DB
    result = supabase.table("password_reset_tokens")\
        .select("*")\
        .eq("token_hash", token_hash)\
        .eq("used", False)\
        .execute()

    if not result.data:
        return JsonResponse({"error": "Token không hợp lệ hoặc đã được sử dụng"}, status=400)

    token_record = result.data[0]

    # Kiểm tra hết hạn
    expires_at = datetime.fromisoformat(token_record["expires_at"].replace("Z", "+00:00"))
    if expires_at < datetime.now(timezone.utc):
        return JsonResponse({"error": "Token đã hết hạn"}, status=400)

    return JsonResponse({"message": "Token hợp lệ", "valid": True})

@api_view(['POST'])
@csrf_exempt
def check_token_status(request):
    """Kiểm tra trạng thái token"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        token = body.get("token")
        if not token:
            return JsonResponse({"error": "Thiếu token"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)

    # Hash token để so sánh
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    supabase = get_supabase_client()

    # Tìm token trong DB
    result = supabase.table("password_reset_tokens")\
        .select("*")\
        .eq("token_hash", token_hash)\
        .execute()

    if not result.data:
        return JsonResponse({"valid": False, "message": "Token không tồn tại"})

    token_record = result.data[0]

    # Kiểm tra hết hạn
    expires_at = datetime.fromisoformat(token_record["expires_at"].replace("Z", "+00:00"))
    is_expired = expires_at < datetime.now(timezone.utc)
    is_used = token_record["used"]

    return JsonResponse({
        "valid": not is_expired and not is_used,
        "expired": is_expired,
        "used": is_used,
        "expires_at": token_record["expires_at"]
    })

@api_view(['POST'])
@csrf_exempt
def resend_reset_email(request):
    """Gửi lại email đặt lại mật khẩu"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        email = body.get("email")
        if not email:
            return JsonResponse({"error": "Thiếu email"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)

    # Kết nối Supabase
    supabase = get_supabase_client()

    try:
        user = supabase.table("account").select("id").eq("email", email).execute()
    except Exception as e:
        return JsonResponse({"error": f"Lỗi truy vấn Supabase: {str(e)}"}, status=500)

    if not user.data:
        return JsonResponse({"error": "Email không tồn tại"}, status=404)

    # Tạo token mới
    token = secrets.token_urlsafe(32)
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password?token={token}"

    subject = "Đặt lại mật khẩu của bạn (Gửi lại)"
    message = (
        f"Xin chào,\n\n"
        f"Bạn đã yêu cầu gửi lại email đặt lại mật khẩu.\n"
        f"Nhấn vào liên kết sau để tạo mật khẩu mới:\n{reset_link}\n\n"
        f"Nếu bạn không yêu cầu, hãy bỏ qua email này."
    )

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Lỗi khi gửi email: {e}")
        return JsonResponse({"error": f"Lỗi gửi mail: {str(e)}"}, status=500)

    # Hash token & lưu DB
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()

    try:
        supabase.table("password_reset_tokens").insert({
            "user_id": user.data[0]["id"],
            "token_hash": token_hash,
            "expires_at": expires_at,
            "used": False,
        }).execute()
    except Exception as e:
        return JsonResponse({"error": f"Lỗi lưu token: {str(e)}"}, status=500)

    return JsonResponse({"message": "Đã gửi lại email đặt lại mật khẩu"})

@api_view(['POST'])
@csrf_exempt
def get_last_email_sent_info(request):
    """Lấy thông tin về lần gửi email gần nhất"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        email = body.get("email")
        if not email:
            return JsonResponse({"error": "Thiếu email"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)

    # Kết nối Supabase
    supabase = get_supabase_client()

    try:
        user = supabase.table("account").select("id").eq("email", email).execute()
    except Exception as e:
        return JsonResponse({"error": f"Lỗi truy vấn Supabase: {str(e)}"}, status=500)

    if not user.data:
        return JsonResponse({"error": "Email không tồn tại"}, status=404)

    user_id = user.data[0]["id"]

    # Lấy token gần nhất
    result = supabase.table("password_reset_tokens")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()

    if not result.data:
        return JsonResponse({"message": "Chưa có email nào được gửi"})

    token_record = result.data[0]
    expires_at = datetime.fromisoformat(token_record["expires_at"].replace("Z", "+00:00"))
    is_expired = expires_at < datetime.now(timezone.utc)

    return JsonResponse({
        "last_sent": token_record["created_at"],
        "expires_at": token_record["expires_at"],
        "expired": is_expired,
        "used": token_record["used"]
    })