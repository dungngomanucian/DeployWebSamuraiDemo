# 🔧 Fix Lỗi Railway Build: "Error creating build plan with Railpack"

## 🐛 Lỗi Gặp Phải

```
Deployment failed during the build process
Build Image Error creating build plan with Railpack
```

## ✅ Giải Pháp

### Bước 1: Cấu Hình Root Directory trong Railway

1. Vào **Railway Dashboard** → Chọn project của bạn
2. Vào **Settings** → **Source**
3. Tìm phần **"Root Directory"**
4. Đặt: `backend`
5. Click **"Save"**

### Bước 2: Kiểm Tra Các File Đã Tạo

Đảm bảo các file sau đã có trong thư mục `backend/`:

- ✅ `requirements.txt` (đã có)
- ✅ `Procfile` (đã có)
- ✅ `railway.json` (đã có)
- ✅ `runtime.txt` (mới tạo - chỉ định Python version)

**Lưu ý**: Railway sẽ tự động detect Python project từ `requirements.txt` và `runtime.txt`, không cần `nixpacks.toml`.

### Bước 3: Redeploy

1. Vào **Deployments** tab
2. Click **"Redeploy"** hoặc push một commit mới
3. Railway sẽ build lại với cấu hình mới

---

## 🔍 Nguyên Nhân

Lỗi này xảy ra vì:

1. **Root Directory chưa được set**: Railway đang tìm ở root project thay vì thư mục `backend`
2. **Thiếu file cấu hình**: Railway cần `runtime.txt` và `nixpacks.toml` để detect đúng Python/Django project
3. **Build command không rõ ràng**: Cần chỉ định rõ các bước build

---

## 📋 Checklist

- [ ] Đã set Root Directory = `backend` trong Railway Settings
- [ ] File `runtime.txt` đã có trong `backend/`
- [ ] File `nixpacks.toml` đã có trong `backend/`
- [ ] File `railway.json` đã được cập nhật
- [ ] Đã commit và push các file mới lên GitHub
- [ ] Đã redeploy trên Railway

---

## 🆘 Vẫn Còn Lỗi?

### Lỗi: "undefined variable 'pip'" hoặc "Error creating build plan"

**Giải pháp**: Xóa file `nixpacks.toml` nếu có. Railway sẽ tự động detect từ `requirements.txt` và `runtime.txt`.

```bash
# Xóa file nixpacks.toml
rm backend/nixpacks.toml

# Commit và push
git add backend/
git commit -m "Remove nixpacks.toml, use auto-detection"
git push
```

### Lỗi: "No module named 'gunicorn'"

**Giải pháp**: Đảm bảo `gunicorn` có trong `requirements.txt`

```bash
# Kiểm tra
cat backend/requirements.txt | grep gunicorn

# Nếu không có, thêm vào
echo "gunicorn==21.2.0" >> backend/requirements.txt
```

### Lỗi: "ModuleNotFoundError: No module named 'config'"

**Giải pháp**: Đảm bảo Root Directory đã được set đúng là `backend`

### Lỗi: "Python version not found"

**Giải pháp**: Kiểm tra `runtime.txt` có đúng format không:
```
python-3.11.9
```

Hoặc thử version khác:
```
python-3.12.0
python-3.10.12
```

### Lỗi: "collectstatic failed"

**Giải pháp**: Tạm thời bỏ qua collectstatic trong build:

Cập nhật `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  }
}
```

Và chạy collectstatic trong start command:
```json
{
  "deploy": {
    "startCommand": "python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT"
  }
}
```

---

## 🔄 Các Bước Tiếp Theo Sau Khi Build Thành Công

1. **Thêm Environment Variables** trong Railway:
   - `DJANGO_SECRET_KEY`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=your-app.railway.app`

2. **Generate Domain**:
   - Settings → Generate Domain
   - Copy URL backend

3. **Test API**:
   - Mở URL backend trong browser
   - Kiểm tra xem có response không

---

## 📚 Tài Liệu Tham Khảo

- Railway Docs: https://docs.railway.app
- Nixpacks Docs: https://nixpacks.com/docs

