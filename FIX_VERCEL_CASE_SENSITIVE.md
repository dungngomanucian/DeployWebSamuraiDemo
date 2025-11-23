# 🔧 Fix Lỗi Case Sensitivity trên Vercel

## 🐛 Lỗi Gặp Phải

```
Could not resolve "./components/admin/ProtectedAdminRoute" from "src/App.jsx"
```

## 🔍 Nguyên Nhân

**Case Sensitivity (Phân biệt hoa/thường):**

- **Windows**: Không phân biệt hoa/thường → `admin` = `Admin` ✅
- **Linux/Mac (Vercel)**: Phân biệt hoa/thường → `admin` ≠ `Admin` ❌

**Vấn đề:**
- Thư mục thực tế: `components/Admin/` (chữ A hoa)
- Import trong code: `components/admin/` (chữ a thường)
- Trên Windows chạy OK, nhưng trên Vercel build lỗi!

---

## ✅ Giải Pháp

### Đã Sửa Các File Sau:

1. ✅ `frondend/src/App.jsx`
   - `./components/admin/ProtectedAdminRoute` → `./components/Admin/ProtectedAdminRoute`
   - `./pages/admin/*` → `./pages/Admin/*`

2. ✅ `frondend/src/pages/Admin/student/Index.jsx`
   - `../../../components/admin/*` → `../../../components/Admin/*`

3. ✅ `frondend/src/pages/Admin/teacher/Index.jsx`
   - `../../../components/admin/*` → `../../../components/Admin/*`

4. ✅ `frondend/src/pages/Admin/account/Index.jsx`
   - `../../../components/admin/*` → `../../../components/Admin/*`

5. ✅ `frondend/src/pages/Admin/level/Index.jsx`
   - `../../../components/admin/*` → `../../../components/Admin/*`

6. ✅ `frondend/src/pages/Admin/jlptExam/Index.jsx`
   - `../../../components/admin/*` → `../../../components/Admin/*`

7. ✅ `frondend/src/pages/Admin/classroom/Index.jsx`
   - `../../../components/admin/*` → `../../../components/Admin/*`

8. ✅ `frondend/src/pages/Admin/course/Index.jsx`
   - `../../../components/admin/*` → `../../../components/Admin/*`

---

## 📋 Các Bước Tiếp Theo

### 1. Commit và Push

```bash
git add frondend/src/
git commit -m "Fix case sensitivity: admin -> Admin for Vercel build"
git push
```

### 2. Redeploy trên Vercel

Vercel sẽ tự động detect commit mới và deploy lại.

### 3. Kiểm Tra Build

- Vào Vercel Dashboard → Deployments
- Xem build mới nhất
- Nếu thành công → Status = "Ready" ✅

---

## 🎯 Quy Tắc Để Tránh Lỗi Này

### 1. Luôn Dùng Case Đúng

**Thư mục:**
- `components/Admin/` (A hoa)
- `pages/Admin/` (A hoa)

**Import:**
- `import ... from './components/Admin/...'` ✅
- `import ... from './components/admin/...'` ❌

### 2. Kiểm Tra Trước Khi Commit

```bash
# Tìm tất cả import sai case
grep -r "components/admin" frondend/src/
grep -r "pages/admin" frondend/src/
```

### 3. Test Build Locally

```bash
cd frondend
npm run build
```

Nếu build thành công local, thường sẽ OK trên Vercel.

---

## 🆘 Vẫn Còn Lỗi?

### Kiểm Tra Tất Cả Import

```bash
# Tìm tất cả import có 'admin' (chữ thường)
grep -r "from.*admin" frondend/src/ --include="*.jsx" --include="*.js"

# Tìm tất cả import có 'Admin' (chữ hoa)
grep -r "from.*Admin" frondend/src/ --include="*.jsx" --include="*.js"
```

### Sửa Từng File

Nếu còn file nào import sai, sửa thủ công:
- Tìm: `components/admin/` hoặc `pages/admin/`
- Thay: `components/Admin/` hoặc `pages/Admin/`

---

## 📚 Lưu Ý

1. **Windows vs Linux**: Luôn test build trên môi trường giống production
2. **Git Config**: Có thể set `git config core.ignorecase false` để Git cảnh báo
3. **ESLint**: Có thể dùng rule để check case sensitivity

---

## ✅ Checklist

- [ ] Đã sửa tất cả import `admin` → `Admin`
- [ ] Đã sửa tất cả import `pages/admin` → `pages/Admin`
- [ ] Đã commit và push code
- [ ] Vercel build thành công
- [ ] Test ứng dụng hoạt động bình thường

