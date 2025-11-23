# 🚀 Quick Start - Deploy trong 10 phút

## Bước nhanh để deploy dự án

### 1. Deploy Backend (Railway) - 5 phút

1. **Đăng ký Railway**: https://railway.app (dùng GitHub login)

2. **Tạo Project mới**:
   - Click "New Project"
   - Chọn "Deploy from GitHub repo"
   - Chọn repository của bạn

3. **Cấu hình Service**:
   - Railway tự động detect Django
   - Root Directory: `backend`

4. **Thêm Environment Variables** (Settings → Variables):
   ```
   DJANGO_SECRET_KEY=<tạo secret key mới>
   DB_NAME=<từ Supabase>
   DB_USER=<từ Supabase>
   DB_PASSWORD=<từ Supabase>
   DB_HOST=<từ Supabase>
   DB_PORT=5432
   DEBUG=False
   ALLOWED_HOSTS=<domain-railway>.railway.app
   ```

5. **Lấy URL Backend**:
   - Settings → Generate Domain
   - Copy URL (ví dụ: `https://your-app.railway.app`)

---

### 2. Deploy Frontend (Vercel) - 5 phút

1. **Đăng ký Vercel**: https://vercel.com (dùng GitHub login)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import từ GitHub repository

3. **Cấu hình Build**:
   - Root Directory: `frondend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Thêm Environment Variable**:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-app.railway.app/api/v1` (URL backend từ bước 1)

5. **Deploy**:
   - Click "Deploy"
   - Đợi build xong

6. **Cập nhật CORS trong Railway**:
   - Quay lại Railway
   - Thêm biến: `CORS_ALLOWED_ORIGINS`
   - Value: URL frontend từ Vercel (ví dụ: `https://your-app.vercel.app`)

---

### 3. Test

1. Mở URL frontend từ Vercel
2. Kiểm tra console (F12) xem có lỗi CORS không
3. Thử đăng nhập/đăng ký để test API

---

## ⚠️ Lưu ý

- **Secret Key**: Tạo mới cho production, không dùng key development
- **Database**: Đảm bảo Supabase cho phép connection từ Railway IP
- **CORS**: Phải cấu hình đúng URL frontend và backend
- **Environment Variables**: Không commit file `.env` lên GitHub

---

## 🆘 Gặp lỗi?

Xem file `DEPLOYMENT.md` để có hướng dẫn chi tiết và troubleshooting.

