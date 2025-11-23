# ✅ Hướng Dẫn Kiểm Tra Deploy Thành Công

## 📍 Phân Biệt Frontend và Backend

- **Frontend (Vercel)**: URL như `https://your-app.vercel.app` - Giao diện người dùng
- **Backend (Railway)**: URL như `https://your-app.railway.app` - API server

Bạn cần deploy và test cả hai!

---

## 🎯 Các Cách Kiểm Tra Deploy trên Railway (Backend)

### 1. Kiểm Tra Trong Railway Dashboard

#### Bước 1: Xem Deployment Status

1. Vào **Railway Dashboard** → Chọn project của bạn
2. Vào tab **"Deployments"**
3. Xem deployment mới nhất:
   - ✅ **"Active"** (màu xanh) = Deploy thành công
   - ❌ **"Failed"** (màu đỏ) = Deploy thất bại
   - ⏳ **"Building"** = Đang build
   - ⏳ **"Deploying"** = Đang deploy

#### Bước 2: Xem Logs

1. Click vào deployment mới nhất
2. Xem tab **"Logs"**:
   - Tìm dòng: `Application startup complete` hoặc `Booting worker`
   - Không có lỗi màu đỏ = Thành công

#### Bước 3: Kiểm Tra Service Status

1. Vào tab **"Metrics"** hoặc **"Overview"**
2. Xem:
   - **Status**: "Running" = Đang chạy
   - **Uptime**: Thời gian đã chạy
   - **CPU/Memory**: Đang sử dụng tài nguyên

---

### 2. Kiểm Tra Domain/URL

#### Bước 1: Generate Domain (Nếu chưa có)

1. Vào **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy URL (ví dụ: `https://your-app.railway.app`)

#### Bước 2: Test URL trong Browser

1. Mở URL backend trong browser
2. Nếu thấy:
   - ✅ **Lỗi 404 hoặc 403** = Server đang chạy (Django chưa có route cho `/`)
   - ✅ **JSON response** = API đang hoạt động
   - ❌ **Connection refused** = Server chưa chạy hoặc lỗi

---

### 3. Test API Endpoints

#### Test Endpoint Cơ Bản

Mở Terminal/PowerShell và chạy:

```bash
# Test root endpoint (có thể trả về 404, đó là bình thường)
curl https://your-app.railway.app/

# Test API endpoint (thay URL bằng domain của bạn)
curl https://your-app.railway.app/api/v1/

# Test với verbose để xem response
curl -v https://your-app.railway.app/api/v1/
```

**Kết quả mong đợi:**
- ✅ Status code `200`, `404`, hoặc `403` = Server đang chạy
- ❌ `Connection refused` hoặc timeout = Server chưa chạy

#### Test API Endpoint Cụ Thể

Nếu bạn có endpoint cụ thể, test thử:

```bash
# Ví dụ: Test login endpoint (nếu có)
curl -X POST https://your-app.railway.app/api/v1/student/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Hoặc test GET endpoint
curl https://your-app.railway.app/api/v1/student/dashboard/
```

---

### 4. Kiểm Tra Logs Chi Tiết

#### Xem Logs Trong Railway

1. Vào **Deployments** → Click deployment mới nhất
2. Tab **"Logs"** → Xem các dòng cuối cùng

**Logs thành công thường có:**
```
[INFO] Starting gunicorn
[INFO] Listening at: http://0.0.0.0:PORT
[INFO] Booting worker with pid: XXX
[INFO] Application startup complete
```

**Logs lỗi thường có:**
```
[ERROR] ModuleNotFoundError: No module named 'xxx'
[ERROR] Database connection failed
[ERROR] Port already in use
```

#### Xem Logs Real-time

1. Vào tab **"Logs"** trong Railway
2. Click **"View Logs"** để xem logs real-time
3. Refresh trang web để xem logs mới

---

### 5. Kiểm Tra Environment Variables

Đảm bảo các biến môi trường đã được set:

1. Vào **Settings** → **Variables**
2. Kiểm tra các biến cần thiết:
   - ✅ `DJANGO_SECRET_KEY`
   - ✅ `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
   - ✅ `DEBUG=False`
   - ✅ `ALLOWED_HOSTS=your-app.railway.app`

**Lưu ý**: Nếu thiếu biến môi trường, server có thể crash khi khởi động.

---

## ✅ Checklist Deploy Thành Công

- [ ] Deployment status = **"Active"** (màu xanh)
- [ ] Logs không có lỗi màu đỏ
- [ ] Service status = **"Running"**
- [ ] Có thể truy cập URL backend (dù trả về 404 cũng OK)
- [ ] Test API endpoint có response (200, 404, hoặc 403)
- [ ] Environment variables đã được set đầy đủ
- [ ] Không có lỗi trong logs

---

## 🐛 Các Lỗi Thường Gặp

### Lỗi: "Connection refused" hoặc timeout

**Nguyên nhân:**
- Server chưa khởi động xong
- Port không đúng
- Firewall chặn

**Giải pháp:**
1. Kiểm tra logs xem server có start không
2. Đợi 1-2 phút rồi thử lại
3. Kiểm tra start command trong `railway.json`

### Lỗi: "502 Bad Gateway"

**Nguyên nhân:**
- Server crash khi khởi động
- Database connection failed
- Thiếu environment variables

**Giải pháp:**
1. Xem logs để tìm lỗi cụ thể
2. Kiểm tra environment variables
3. Kiểm tra database connection

### Lỗi: "404 Not Found"

**Đây là bình thường!** 
- Django không có route cho `/`
- Test endpoint cụ thể như `/api/v1/` thay vì `/`

### Lỗi: "500 Internal Server Error"

**Nguyên nhân:**
- Lỗi trong code
- Database connection failed
- Thiếu dependencies

**Giải pháp:**
1. Xem logs chi tiết
2. Kiểm tra database connection
3. Kiểm tra `requirements.txt`

---

## 🧪 Test Tự Động với Script

Tạo file `test-deploy.sh` (Mac/Linux) hoặc `test-deploy.bat` (Windows):

**test-deploy.sh:**
```bash
#!/bin/bash

echo "🧪 Testing Railway Deployment"
echo "=============================="
echo ""

# Thay URL bằng domain của bạn
API_URL="https://your-app.railway.app"

echo "1. Testing root endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" $API_URL/

echo ""
echo "2. Testing API endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" $API_URL/api/v1/

echo ""
echo "3. Testing with verbose..."
curl -v $API_URL/api/v1/ 2>&1 | head -20

echo ""
echo "✅ Test completed!"
```

**test-deploy.bat:**
```batch
@echo off
echo 🧪 Testing Railway Deployment
echo ==============================
echo.

REM Thay URL bằng domain của bạn
set API_URL=https://your-app.railway.app

echo 1. Testing root endpoint...
curl -s -o nul -w "Status: %%{http_code}\n" %API_URL%/

echo.
echo 2. Testing API endpoint...
curl -s -o nul -w "Status: %%{http_code}\n" %API_URL%/api/v1/

echo.
echo ✅ Test completed!
pause
```

---

## 📊 Monitoring Sau Khi Deploy

### 1. Xem Metrics

Railway Dashboard → **Metrics**:
- CPU usage
- Memory usage
- Network traffic
- Request count

### 2. Set Up Alerts (Nếu cần)

1. Vào **Settings** → **Notifications**
2. Set up email alerts khi deployment fail

### 3. Kiểm Tra Uptime

Railway Dashboard → **Overview**:
- Xem uptime percentage
- Xem số lần restart

---

## 🎉 Dấu Hiệu Deploy Thành Công

✅ **Deployment status = "Active"**  
✅ **Logs có dòng "Application startup complete"**  
✅ **Có thể truy cập URL (dù 404 cũng OK)**  
✅ **Test API endpoint có response**  
✅ **Không có lỗi trong logs**  
✅ **Service đang "Running"**

---

## 🎨 Kiểm Tra Deploy Frontend trên Vercel

### 1. Xem Deployment Status

1. Vào **Vercel Dashboard** → Chọn project
2. Xem tab **"Deployments"**:
   - ✅ **"Ready"** (màu xanh) = Deploy thành công
   - ❌ **"Error"** (màu đỏ) = Deploy thất bại
   - ⏳ **"Building"** = Đang build

### 2. Test URL Frontend

1. Lấy URL frontend:
   - Vercel tự động tạo URL: `https://your-app.vercel.app`
   - Hoặc custom domain nếu bạn đã set

2. Mở URL trong browser:
   - ✅ Thấy giao diện ứng dụng = Thành công
   - ❌ Blank page hoặc lỗi = Có vấn đề

### 3. Kiểm Tra Console (F12)

1. Mở browser DevTools (F12)
2. Xem tab **Console**:
   - ✅ Không có lỗi màu đỏ = OK
   - ❌ CORS error = Chưa cấu hình CORS
   - ❌ API error = Backend chưa chạy hoặc URL sai

3. Xem tab **Network**:
   - Kiểm tra các request đến API
   - Xem status code của API calls

---

## 🔄 Bước Tiếp Theo Sau Khi Deploy Thành Công

### Bước 1: Deploy Backend (Railway) ✅

1. **Copy URL backend** (ví dụ: `https://your-app.railway.app`)
2. **Test backend**:
   ```bash
   curl https://your-app.railway.app/api/v1/
   ```

### Bước 2: Deploy Frontend (Vercel)

1. **Deploy Frontend** trên Vercel:
   - Import repository từ GitHub
   - Set Root Directory: `frondend`
   - Set environment variable: `VITE_API_BASE_URL=https://your-app.railway.app/api/v1`
   - Deploy

2. **Lấy URL frontend** (ví dụ: `https://your-app.vercel.app`)

### Bước 3: Kết Nối Frontend và Backend

1. **Cập nhật CORS** trong Railway:
   - Settings → Variables
   - Thêm biến: `CORS_ALLOWED_ORIGINS`
   - Value: `https://your-app.vercel.app` (URL frontend)

2. **Redeploy backend** để áp dụng CORS

### Bước 4: Test Toàn Bộ Ứng Dụng

1. **Mở URL frontend** trong browser
2. **Test các chức năng**:
   - Đăng nhập/đăng ký
   - Test API calls
   - Kiểm tra console không có lỗi

---

## 📚 Tài Liệu Tham Khảo

- Railway Monitoring: https://docs.railway.app/develop/monitoring
- Railway Logs: https://docs.railway.app/develop/logs

