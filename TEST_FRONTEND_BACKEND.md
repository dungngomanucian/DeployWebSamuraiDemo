# 🧪 Hướng Dẫn Test Frontend và Backend

## 📍 Phân Biệt Rõ Ràng

### Frontend (Vercel)
- **URL**: `https://your-app.vercel.app`
- **Vai trò**: Giao diện người dùng (React app)
- **Cách test**: Mở URL trong browser, xem giao diện

### Backend (Railway)
- **URL**: `https://your-app.railway.app`
- **Vai trò**: API server (Django REST API)
- **Cách test**: Dùng curl hoặc Postman để gọi API

---

## ✅ Checklist Deploy Đầy Đủ

### Backend (Railway)
- [ ] Deployment status = "Active"
- [ ] Có URL backend: `https://your-app.railway.app`
- [ ] Test API thành công: `curl https://your-app.railway.app/api/v1/`
- [ ] Environment variables đã set đầy đủ

### Frontend (Vercel)
- [ ] Deployment status = "Ready"
- [ ] Có URL frontend: `https://your-app.vercel.app`
- [ ] Environment variable `VITE_API_BASE_URL` đã set với URL backend
- [ ] Mở URL frontend thấy giao diện

### Kết Nối
- [ ] CORS đã được cấu hình trong Railway với URL frontend
- [ ] Frontend có thể gọi API backend thành công
- [ ] Không có lỗi CORS trong browser console

---

## 🧪 Cách Test

### 1. Test Backend (Railway)

```bash
# Test root endpoint
curl https://your-app.railway.app/

# Test API endpoint
curl https://your-app.railway.app/api/v1/

# Test với verbose để xem chi tiết
curl -v https://your-app.railway.app/api/v1/student/login/
```

**Kết quả mong đợi:**
- Status code `200`, `404`, hoặc `403` = Backend đang chạy
- JSON response = API hoạt động tốt

### 2. Test Frontend (Vercel)

1. **Mở URL frontend** trong browser:
   ```
   https://your-app.vercel.app
   ```

2. **Kiểm tra:**
   - ✅ Thấy giao diện ứng dụng
   - ✅ Không có lỗi trong console (F12)
   - ✅ Các API calls thành công (xem Network tab)

### 3. Test Kết Nối Frontend ↔ Backend

1. **Mở browser DevTools** (F12)
2. **Xem tab Console:**
   - ❌ `CORS policy: No 'Access-Control-Allow-Origin'` = Chưa cấu hình CORS
   - ❌ `Failed to fetch` = Backend chưa chạy hoặc URL sai
   - ✅ Không có lỗi = Kết nối thành công

3. **Xem tab Network:**
   - Click vào một request đến API
   - Xem Status code:
     - `200` = Thành công
     - `404` = Endpoint không tồn tại
     - `500` = Lỗi server
     - `CORS error` = Chưa cấu hình CORS

---

## 🔧 Cấu Hình Đúng

### Backend (Railway) - Environment Variables

```
DJANGO_SECRET_KEY=your-secret-key
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Frontend (Vercel) - Environment Variables

```
VITE_API_BASE_URL=https://your-app.railway.app/api/v1
```

**Lưu ý**: Sau khi set environment variable trong Vercel, cần **redeploy** để áp dụng!

---

## 🐛 Troubleshooting

### Frontend không load được

**Kiểm tra:**
1. Vercel deployment status = "Ready"?
2. URL frontend đúng chưa?
3. Console có lỗi gì không?

### Frontend không gọi được API

**Kiểm tra:**
1. `VITE_API_BASE_URL` đã set đúng chưa?
2. Backend đang chạy không? (test bằng curl)
3. CORS đã cấu hình chưa?

### Lỗi CORS

**Giải pháp:**
1. Vào Railway → Settings → Variables
2. Thêm `CORS_ALLOWED_ORIGINS` với URL frontend
3. Redeploy backend

### Backend trả về 500 Error

**Kiểm tra:**
1. Xem logs trong Railway
2. Kiểm tra environment variables
3. Kiểm tra database connection

---

## 📊 Flow Hoàn Chỉnh

```
User Browser
    ↓
Frontend (Vercel) - https://your-app.vercel.app
    ↓ (API calls)
Backend (Railway) - https://your-app.railway.app/api/v1/
    ↓ (Database queries)
Supabase Database
```

---

## ✅ Dấu Hiệu Mọi Thứ Hoạt Động Tốt

1. **Backend (Railway)**:
   - ✅ Status = "Active"
   - ✅ Test curl có response
   - ✅ Logs không có lỗi

2. **Frontend (Vercel)**:
   - ✅ Status = "Ready"
   - ✅ Mở URL thấy giao diện
   - ✅ Console không có lỗi

3. **Kết Nối**:
   - ✅ Frontend gọi được API backend
   - ✅ Không có lỗi CORS
   - ✅ API trả về data đúng

---

## 🎯 Tóm Tắt

- **Railway URL** = Backend API (test bằng curl)
- **Vercel URL** = Frontend (mở trong browser)
- **Cả hai** đều cần deploy và test riêng
- **Kết nối** qua environment variable `VITE_API_BASE_URL` và CORS

