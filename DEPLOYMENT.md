# Hướng dẫn Deploy Dự án Samurai Japanese App

## Tổng quan
Dự án này gồm 2 phần:
- **Frontend**: React + Vite (thư mục `frondend`)
- **Backend**: Django REST API (thư mục `backend`)

Database đã được lưu trữ trên Supabase, nên bạn chỉ cần deploy code.

---

## 🚀 Tùy chọn Hosting Miễn phí

### Frontend (React/Vite)
1. **Vercel** (Khuyến nghị) - https://vercel.com
   - Miễn phí, tự động deploy từ GitHub
   - Hỗ trợ Vite tốt
   - CDN toàn cầu

2. **Netlify** - https://netlify.com
   - Miễn phí, dễ sử dụng
   - Hỗ trợ Vite tốt

### Backend (Django)
1. **Railway** (Khuyến nghị) - https://railway.app
   - Miễn phí $5 credit/tháng
   - Tự động detect Django
   - Dễ cấu hình

2. **Render** - https://render.com
   - Miễn phí với giới hạn (có thể sleep sau 15 phút không dùng)
   - Hỗ trợ Django tốt

3. **Fly.io** - https://fly.io
   - Miễn phí với giới hạn
   - Performance tốt

---

## 📋 Bước 1: Chuẩn bị Code

### 1.1. Tạo file .gitignore (nếu chưa có)
Đảm bảo không commit các file nhạy cảm:
- `.env` files
- `venv/`
- `__pycache__/`
- `node_modules/`

### 1.2. Kiểm tra Environment Variables
Backend cần các biến môi trường:
- `DJANGO_SECRET_KEY`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (Supabase)
- `SUPABASE_URL`, `SUPABASE_KEY` (nếu có)
- `REDIS_URL` (nếu dùng Redis)
- `SMTP_USER`, `SMTP_PASSWORD` (nếu dùng email)

Frontend cần:
- `VITE_API_BASE_URL` (URL của backend sau khi deploy)

---

## 🎨 Bước 2: Deploy Frontend (Vercel)

### 2.1. Chuẩn bị
1. Đăng ký tài khoản Vercel: https://vercel.com
2. Cài đặt Vercel CLI (tùy chọn):
   ```bash
   npm i -g vercel
   ```

### 2.2. Deploy qua GitHub (Khuyến nghị)
1. Push code lên GitHub repository
2. Vào Vercel Dashboard → New Project
3. Import repository từ GitHub
4. Cấu hình:
   - **Root Directory**: `frondend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Thêm Environment Variable:
   - `VITE_API_BASE_URL`: URL backend của bạn (sẽ có sau khi deploy backend)
   - Ví dụ: `https://your-backend.railway.app/api/v1`

6. Click Deploy

### 2.3. Deploy qua CLI
```bash
cd frondend
vercel
```

---

## 🐍 Bước 3: Deploy Backend (Railway)

### 3.1. Chuẩn bị
1. Đăng ký tài khoản Railway: https://railway.app
2. Cài đặt Railway CLI (tùy chọn):
   ```bash
   npm i -g @railway/cli
   ```

### 3.2. Tạo file cấu hình cho Railway
Đã tạo file `railway.json` và `Procfile` (xem bên dưới)

### 3.3. Deploy qua GitHub
1. Push code lên GitHub
2. Vào Railway Dashboard → New Project
3. Deploy from GitHub repo
4. Chọn repository và branch
5. Railway sẽ tự động detect Django

### 3.4. Cấu hình Environment Variables
Trong Railway Dashboard → Variables, thêm:
```
DJANGO_SECRET_KEY=your-secret-key-here
DB_NAME=your-supabase-db-name
DB_USER=your-supabase-user
DB_PASSWORD=your-supabase-password
DB_HOST=your-supabase-host
DB_PORT=5432
REDIS_URL=redis://default:password@host:port (nếu dùng Redis)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALLOWED_HOSTS=your-backend-domain.railway.app,localhost
DEBUG=False
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app
```

**Lưu ý quan trọng:**
- Sau khi deploy backend, lấy URL backend và thêm vào `CORS_ALLOWED_ORIGINS` cùng với URL frontend
- `ALLOWED_HOSTS` phải chứa domain backend của Railway
- `DEBUG=False` trong production để bảo mật

### 3.5. Cấu hình Settings
1. Settings → Generate Domain → Lấy URL backend
2. Update CORS settings trong Django (xem bên dưới)

### 3.6. Deploy qua CLI
```bash
cd backend
railway login
railway init
railway up
```

---

## ⚙️ Bước 4: Cấu hình Django cho Production

### 4.1. Cập nhật settings.py
Cần cập nhật:
- `DEBUG = False`
- `ALLOWED_HOSTS` với domain backend
- `CORS_ALLOWED_ORIGINS` với domain frontend
- Static files configuration

### 4.2. Cập nhật CORS
CORS đã được cấu hình tự động từ environment variable `CORS_ALLOWED_ORIGINS`.
Chỉ cần thêm URL frontend vào biến môi trường này trong Railway.

**Ví dụ:**
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app.netlify.app
```

---

## 🔄 Bước 5: Kết nối Frontend và Backend

1. Sau khi deploy backend, lấy URL (ví dụ: `https://your-app.railway.app`)
2. Cập nhật Environment Variable trong Vercel:
   - `VITE_API_BASE_URL=https://your-app.railway.app/api/v1`
3. Redeploy frontend để áp dụng thay đổi

---

## 📝 Checklist Deploy

- [ ] Code đã được push lên GitHub
- [ ] Backend đã được deploy và có URL
- [ ] Environment variables đã được cấu hình cho backend (bao gồm Supabase credentials)
- [ ] `ALLOWED_HOSTS` đã được set với domain backend
- [ ] `CORS_ALLOWED_ORIGINS` đã được set với URL frontend
- [ ] Frontend đã được deploy
- [ ] Environment variable `VITE_API_BASE_URL` đã được set trong frontend với URL backend
- [ ] Test kết nối giữa frontend và backend
- [ ] Kiểm tra static files có load được không

---

## 🐛 Troubleshooting

### Backend không kết nối được database
- Kiểm tra environment variables trong Railway
- Kiểm tra Supabase connection string
- Kiểm tra firewall settings của Supabase

### CORS Error
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong Django settings
- Đảm bảo domain frontend đã được thêm vào

### Frontend không gọi được API
- Kiểm tra `VITE_API_BASE_URL` trong Vercel
- Kiểm tra network tab trong browser console
- Đảm bảo backend đã chạy và accessible

---

## 📚 Tài liệu tham khảo
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/

