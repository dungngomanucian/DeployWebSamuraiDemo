from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from config.supabase_client import get_supabase_client
from django.conf import settings
import json, secrets, hashlib
from datetime import datetime, timedelta


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
    reset_link = f"http://http://localhost:5173/reset-password?token={token}"

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
