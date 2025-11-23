# 📦 Hướng Dẫn Nhanh: Chuyển Code sang GitHub của Bạn

## 🎯 Cách Đơn Giản Nhất (3 bước)

### Bước 1: Tạo Repository Mới trên GitHub

1. Đăng nhập GitHub của bạn
2. Click **"+"** → **"New repository"**
3. Đặt tên: `samurai-japanese-app` (hoặc tên bạn muốn)
4. Chọn **Public** hoặc **Private**
5. **KHÔNG** tích "Initialize with README"
6. Click **"Create repository"**
7. **Copy URL** repository (ví dụ: `https://github.com/your-username/samurai-japanese-app.git`)

---

### Bước 2: Chạy Script Tự Động

**Windows:**
```bash
migrate-repo.bat
```

**Mac/Linux:**
```bash
chmod +x migrate-repo.sh
./migrate-repo.sh
```

Script sẽ hỏi bạn URL repository mới, sau đó tự động:
- Xóa remote cũ
- Thêm remote mới
- Push code lên (nếu bạn chọn)

---

### Bước 3: Hoặc Làm Thủ Công

Nếu không dùng script, mở Terminal/PowerShell và chạy:

```bash
# 1. Xem remote hiện tại
git remote -v

# 2. Xóa remote cũ
git remote remove origin

# 3. Thêm remote mới (thay URL bằng repository của bạn)
git remote add origin https://github.com/your-username/samurai-japanese-app.git

# 4. Kiểm tra lại
git remote -v

# 5. Push code lên
git push -u origin main
# Hoặc nếu branch của bạn là 'master':
# git push -u origin master
```

---

## ⚠️ Lưu Ý Quan Trọng

### ✅ Trước Khi Push, Kiểm Tra:

1. **File .env không được commit:**
   ```bash
   # Kiểm tra xem .env có trong git không
   git ls-files | grep .env
   
   # Nếu có, xóa khỏi git (nhưng giữ file trên máy)
   git rm --cached .env
   git commit -m "Remove .env from git"
   ```

2. **Kiểm tra .gitignore:**
   - Đảm bảo `.env`, `venv/`, `node_modules/` đã có trong `.gitignore`
   - File `.gitignore` đã được tạo sẵn trong project

3. **Không commit passwords/keys:**
   - Kiểm tra lại code xem có hardcode passwords không
   - Tất cả secrets phải dùng environment variables

---

## 🔄 Sau Khi Chuyển Repository

### 1. Cập nhật Deploy Settings

**Railway:**
- Vào project → Settings → Source
- Chọn repository mới của bạn

**Vercel:**
- Vào project → Settings → Git
- Chọn repository mới của bạn

### 2. Test Deploy

- Push một commit nhỏ để test auto-deploy
- Kiểm tra xem Railway và Vercel có tự động deploy không

---

## 🆘 Gặp Lỗi?

### "Permission denied" hoặc "Authentication failed"
```bash
# Cấu hình Git credentials
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Hoặc dùng Personal Access Token
# Tạo token: GitHub → Settings → Developer settings → Personal access tokens
```

### "Repository not found"
- Kiểm tra URL repository đúng chưa
- Kiểm tra bạn có quyền truy cập repository không
- Đảm bảo repository đã được tạo trên GitHub

### "Large files" error
- GitHub giới hạn file 100MB
- Xóa file lớn hoặc dùng Git LFS

---

## ✅ Checklist

- [ ] Đã tạo repository mới trên GitHub
- [ ] Đã chạy script hoặc lệnh git để đổi remote
- [ ] Đã kiểm tra file .env không bị commit
- [ ] Đã push code thành công
- [ ] Đã cập nhật deploy settings (Railway, Vercel)
- [ ] Đã test auto-deploy

---

## 📚 Xem Thêm

- File `MIGRATE_REPOSITORY.md` - Hướng dẫn chi tiết đầy đủ
- File `DEPLOYMENT.md` - Hướng dẫn deploy sau khi chuyển repo

