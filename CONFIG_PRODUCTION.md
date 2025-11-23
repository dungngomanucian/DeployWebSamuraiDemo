# ⚙️ Cấu Hình Production - Thay Localhost

## 📋 Tóm Tắt

**KHÔNG cần thay tất cả localhost trong code!** Chỉ cần cấu hình **Environment Variables** đúng.

---

## ✅ Những Gì ĐÃ ĐƯỢC CẤU HÌNH ĐÚNG (Không Cần Sửa)

### 1. Frontend - API Config ✅

**File:** `frondend/src/config/apiConfig.js`

- ✅ Đã dùng environment variable: `VITE_API_BASE_URL`
- ✅ Localhost chỉ là fallback cho development
- ✅ Production sẽ tự động dùng env variable từ Vercel

**Cấu hình trên Vercel:**
```
VITE_API_BASE_URL=https://deploywebsamuraidemo-production.up.railway.app/api/v1
```

### 2. Backend - CORS ✅

**File:** `backend/config/settings.py`

- ✅ Đã có cơ chế override bằng environment variable
- ✅ Localhost chỉ cho development
- ✅ Production sẽ dùng `CORS_ALLOWED_ORIGINS` từ Railway

**Cấu hình trên Railway:**
```
CORS_ALLOWED_ORIGINS=https://deploy-web-samurai-demo.vercel.app
```

### 3. Backend - ALLOWED_HOSTS ✅

**File:** `backend/config/settings.py`

- ✅ Đã dùng environment variable
- ✅ Production sẽ dùng `ALLOWED_HOSTS` từ Railway

**Cấu hình trên Railway:**
```
ALLOWED_HOSTS=deploywebsamuraidemo-production.up.railway.app
```

---

## 🔧 Những Gì ĐÃ ĐƯỢC SỬA (Reset Password Link)

### File: `backend/student/auth/views.py`

**Đã sửa:** Reset password link giờ dùng environment variable `FRONTEND_URL`

**Cấu hình trên Railway:**
```
FRONTEND_URL=https://deploy-web-samurai-demo.vercel.app
```

---

## 📝 Checklist Cấu Hình Environment Variables

### Railway (Backend) - Environment Variables

```
# Database (Supabase)
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432

# Django
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=deploywebsamuraidemo-production.up.railway.app

# CORS
CORS_ALLOWED_ORIGINS=https://deploy-web-samurai-demo.vercel.app

# Frontend URL (cho reset password email)
FRONTEND_URL=https://deploy-web-samurai-demo.vercel.app

# Email (nếu dùng)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis (nếu dùng)
REDIS_URL=your-redis-url
```

### Vercel (Frontend) - Environment Variables

```
VITE_API_BASE_URL=https://deploywebsamuraidemo-production.up.railway.app/api/v1
```

---

## 🎯 Các URL Cần Dùng

### Backend (Railway)
```
https://deploywebsamuraidemo-production.up.railway.app
```

**Dùng cho:**
- `ALLOWED_HOSTS` trong Railway
- `VITE_API_BASE_URL` trong Vercel (thêm `/api/v1`)

### Frontend (Vercel)
```
https://deploy-web-samurai-demo.vercel.app
```

**Dùng cho:**
- `CORS_ALLOWED_ORIGINS` trong Railway
- `FRONTEND_URL` trong Railway (cho reset password email)

---

## ❌ KHÔNG Cần Thay Trong Code

### 1. Localhost trong Frontend Config ✅

**File:** `frondend/src/config/apiConfig.js`

```javascript
// KHÔNG cần sửa - đây là fallback cho development
fallback: 'http://localhost:8000/api/v1'
```

### 2. Localhost trong Backend CORS ✅

**File:** `backend/config/settings.py`

```python
# KHÔNG cần sửa - đây là cho development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Giữ lại cho dev
    "http://127.0.0.1:5173",  # Giữ lại cho dev
]
# Production sẽ override bằng env variable
```

### 3. Localhost trong Redis Config ✅

**File:** `backend/config/settings.py`

```python
# KHÔNG cần sửa - đây là default cho development
"LOCATION": os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/1")
# Production sẽ dùng REDIS_URL từ env variable
```

---

## ✅ Đã Sửa Trong Code

### Reset Password Link

**File:** `backend/student/auth/views.py`

**Trước:**
```python
reset_link = f"http://localhost:5173/reset-password?token={token}"
```

**Sau:**
```python
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
reset_link = f"{frontend_url}/reset-password?token={token}"
```

**Lý do:** Reset password email cần link đến frontend production, không phải localhost.

---

## 🔄 Cách Hoạt Động

### Development (Local)
- Frontend: `http://localhost:5173` → Gọi API `http://localhost:8000`
- Backend: Chấp nhận CORS từ `localhost:5173`
- Reset link: `http://localhost:5173/reset-password?token=...`

### Production
- Frontend: `https://deploy-web-samurai-demo.vercel.app` → Gọi API `https://deploywebsamuraidemo-production.up.railway.app/api/v1`
- Backend: Chấp nhận CORS từ `https://deploy-web-samurai-demo.vercel.app` (từ env var)
- Reset link: `https://deploy-web-samurai-demo.vercel.app/reset-password?token=...` (từ env var)

---

## 📋 Checklist Hoàn Chỉnh

### Railway (Backend)
- [ ] `ALLOWED_HOSTS=deploywebsamuraidemo-production.up.railway.app`
- [ ] `CORS_ALLOWED_ORIGINS=https://deploy-web-samurai-demo.vercel.app`
- [ ] `FRONTEND_URL=https://deploy-web-samurai-demo.vercel.app`
- [ ] `DEBUG=False`
- [ ] Database credentials (Supabase)
- [ ] `DJANGO_SECRET_KEY`

### Vercel (Frontend)
- [ ] `VITE_API_BASE_URL=https://deploywebsamuraidemo-production.up.railway.app/api/v1`

### Test
- [ ] Frontend load được
- [ ] Frontend gọi được API backend
- [ ] Không có lỗi CORS
- [ ] Reset password email có link đúng

---

## 🎯 Tóm Tắt

1. **KHÔNG cần thay localhost trong code** - Chỉ cần set environment variables
2. **Đã sửa reset password link** - Giờ dùng `FRONTEND_URL` env variable
3. **Cấu hình đúng trên Railway và Vercel** - Xem checklist ở trên

**Quan trọng:** Code đã được thiết kế để tự động dùng environment variables trong production, không cần hardcode URL!

