from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from config.supabase_client import get_supabase_client
from datetime import datetime, timezone
import json, hashlib
import bcrypt


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
    # Dùng bcrypt để mã hóa
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    supabase.table("account").update({"password": hashed_password}).eq("id", user_id).execute()

    # Đánh dấu token là đã dùng
    supabase.table("password_reset_tokens").update({"used": True}).eq("id", token_record["id"]).execute()

    return JsonResponse({"message": "Đặt lại mật khẩu thành công"})
