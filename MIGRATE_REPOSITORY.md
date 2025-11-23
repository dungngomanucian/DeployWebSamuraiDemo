# 📦 Hướng dẫn Chuyển Code sang Repository GitHub của Bạn

## Tùy chọn 1: Fork Repository (Nếu có quyền)

Nếu bạn có quyền truy cập repository của bạn bè:

1. Vào repository trên GitHub
2. Click nút **"Fork"** ở góc trên bên phải
3. Chọn tài khoản GitHub của bạn
4. Repository sẽ được copy sang tài khoản của bạn

**Lưu ý**: Fork sẽ giữ lại lịch sử commit và liên kết với repo gốc.

---

## Tùy chọn 2: Tạo Repository Mới và Push Code (Khuyến nghị)

Cách này tạo repository hoàn toàn mới, độc lập.

### ⚡ Sử dụng Script Tự Động (Nhanh nhất)

Tôi đã tạo script để tự động chuyển repository:

**Windows:**
```bash
migrate-repo.bat
```

**Mac/Linux:**
```bash
chmod +x migrate-repo.sh
./migrate-repo.sh
```

Script sẽ:
- Hiển thị remote hiện tại
- Hỏi URL repository mới
- Tự động xóa remote cũ và thêm remote mới
- Hỏi có muốn push ngay không

### Bước 1: Tạo Repository Mới trên GitHub

1. Đăng nhập GitHub
2. Click **"+"** → **"New repository"**
3. Đặt tên repository (ví dụ: `samurai-japanese-app`)
4. Chọn **Public** hoặc **Private**
5. **KHÔNG** tích "Initialize with README" (vì bạn đã có code)
6. Click **"Create repository"**

### Bước 2: Clone Repository Cũ (Nếu chưa có)

**Hoặc nếu bạn đã có code trên máy**, bỏ qua bước này và chuyển sang Bước 3.

Nếu bạn chưa có code trên máy:

```bash
# Clone repository của bạn bè
git clone https://github.com/username-friend/samurai-japanese-app.git
cd samurai-japanese-app
```

### Bước 3: Xóa Remote Cũ và Thêm Remote Mới

```bash
# Xem remote hiện tại
git remote -v

# Xóa remote cũ (thường tên là 'origin')
git remote remove origin

# Thêm remote mới (thay URL bằng repository của bạn)
git remote add origin https://github.com/your-username/samurai-japanese-app.git

# Kiểm tra lại
git remote -v
```

### Bước 4: Push Code Lên Repository Mới

```bash
# Push tất cả branches và tags
git push -u origin main

# Hoặc nếu branch của bạn là 'master'
git push -u origin master
```

---

## Tùy chọn 3: Download ZIP và Upload (Nếu không dùng Git)

Nếu bạn không quen dùng Git:

1. **Download code**:
   - Vào repository của bạn bè
   - Click **"Code"** → **"Download ZIP"**
   - Giải nén file ZIP

2. **Tạo repository mới trên GitHub** (giống Bước 1 ở trên)

3. **Upload code**:
   - Vào repository mới của bạn
   - Click **"uploading an existing file"**
   - Kéo thả toàn bộ thư mục code vào
   - Commit message: "Initial commit"
   - Click **"Commit changes"**

**Lưu ý**: Cách này sẽ mất lịch sử commit.

---

## Tùy chọn 4: Sử dụng GitHub CLI (Nhanh nhất)

Nếu bạn đã cài GitHub CLI:

```bash
# Clone repository cũ
git clone https://github.com/username-friend/samurai-japanese-app.git
cd samurai-japanese-app

# Tạo repository mới trên GitHub
gh repo create samurai-japanese-app --public --source=. --remote=origin --push
```

---

## ⚠️ Lưu ý Quan Trọng

### 1. Kiểm tra File Nhạy Cảm

Trước khi push, đảm bảo các file sau **KHÔNG** có trong repository:

- `.env` files
- `venv/` hoặc `node_modules/`
- File chứa passwords, API keys
- File database local

**Kiểm tra:**
```bash
# Xem các file sẽ được commit
git status

# Xem nội dung .gitignore
cat .gitignore
```

### 2. Xóa Lịch Sử Git (Nếu muốn bắt đầu mới)

Nếu bạn muốn bắt đầu với lịch sử commit mới:

```bash
# Xóa thư mục .git
rm -rf .git

# Khởi tạo Git mới
git init
git add .
git commit -m "Initial commit"

# Thêm remote và push
git remote add origin https://github.com/your-username/samurai-japanese-app.git
git branch -M main
git push -u origin main
```

### 3. Cập nhật Remote URL (Nếu đã có code local)

Nếu bạn đã có code trên máy và chỉ cần đổi remote:

```bash
# Xem remote hiện tại
git remote -v

# Đổi URL remote
git remote set-url origin https://github.com/your-username/samurai-japanese-app.git

# Kiểm tra lại
git remote -v

# Push code
git push -u origin main
```

---

## ✅ Sau Khi Chuyển Repository

1. **Cập nhật Deploy Settings**:
   - Railway: Cập nhật repository trong project settings
   - Vercel: Cập nhật repository trong project settings

2. **Kiểm tra Deploy**:
   - Đảm bảo auto-deploy vẫn hoạt động
   - Test lại ứng dụng

3. **Thông báo cho Team** (nếu có):
   - Gửi link repository mới
   - Cập nhật documentation

---

## 🆘 Gặp Lỗi?

### Lỗi: "Permission denied"
- Kiểm tra bạn đã đăng nhập GitHub đúng chưa
- Kiểm tra quyền truy cập repository

### Lỗi: "Repository already exists"
- Repository đã tồn tại, dùng tên khác hoặc xóa repository cũ

### Lỗi: "Large files"
- GitHub có giới hạn file 100MB
- Xóa file lớn hoặc dùng Git LFS

---

## 📝 Checklist

- [ ] Đã tạo repository mới trên GitHub
- [ ] Đã xóa/đổi remote cũ
- [ ] Đã kiểm tra file nhạy cảm (.env, passwords)
- [ ] Đã push code lên repository mới
- [ ] Đã cập nhật deploy settings (Railway, Vercel)
- [ ] Đã test deploy lại

