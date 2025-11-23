# 🔧 Fix Lỗi: "undefined variable 'pip'" trong Railway Build

## 🐛 Lỗi Gặp Phải

```
error: undefined variable 'pip'
at /app/.nixpacks/nixpkgs-xxx.nix:19:9:
   18|         '')
   19|         pip python311
   20|       ];
```

## ✅ Giải Pháp Nhanh

### Cách 1: Xóa nixpacks.toml (Khuyến nghị)

Railway có thể tự động detect Python project từ `requirements.txt` và `runtime.txt`, không cần file `nixpacks.toml`.

**Bước 1**: Xóa file `nixpacks.toml`
```bash
rm backend/nixpacks.toml
```

**Bước 2**: Commit và push
```bash
git add backend/
git commit -m "Remove nixpacks.toml, use Railway auto-detection"
git push
```

**Bước 3**: Redeploy trên Railway

---

### Cách 2: Sửa lại nixpacks.toml (Nếu muốn giữ)

Nếu bạn muốn giữ file `nixpacks.toml`, sửa lại như sau:

**backend/nixpacks.toml**:
```toml
[phases.setup]
nixPkgs = { python = "311" }

[phases.install]
cmds = [
  "pip install --upgrade pip",
  "pip install -r requirements.txt"
]

[start]
cmd = "gunicorn config.wsgi:application --bind 0.0.0.0:$PORT"
```

**Lưu ý**: 
- Không cần `[phases.build]` với collectstatic
- Collectstatic sẽ chạy trong start command (xem `railway.json`)

---

## 🔍 Nguyên Nhân

Lỗi xảy ra vì:
1. **Cú pháp nixpacks.toml sai**: `nixPkgs = ["python311", "pip"]` không đúng format
2. **Railway auto-detection tốt hơn**: Railway có thể tự động detect Python project mà không cần `nixpacks.toml`

---

## ✅ Checklist

- [ ] Đã xóa `backend/nixpacks.toml` (hoặc sửa lại đúng cú pháp)
- [ ] Đã set Root Directory = `backend` trong Railway Settings
- [ ] File `runtime.txt` đã có trong `backend/` với nội dung: `python-3.11.9`
- [ ] File `requirements.txt` đã có trong `backend/`
- [ ] File `railway.json` đã được cập nhật
- [ ] Đã commit và push lên GitHub
- [ ] Đã redeploy trên Railway

---

## 📋 Cấu Hình Tối Thiểu Cần Thiết

Railway chỉ cần 3 file để tự động detect Django project:

1. **backend/requirements.txt** - Danh sách Python packages
2. **backend/runtime.txt** - Python version (ví dụ: `python-3.11.9`)
3. **backend/railway.json** - Cấu hình deploy (start command)

**Procfile** cũng có thể dùng thay cho start command trong `railway.json`.

---

## 🆘 Vẫn Còn Lỗi?

### Lỗi: "Python version not found"

**Giải pháp**: Kiểm tra `runtime.txt`:
```
python-3.11.9
```

Hoặc thử version khác:
```
python-3.12.0
python-3.10.12
```

### Lỗi: "No module named 'config'"

**Giải pháp**: Đảm bảo Root Directory = `backend` trong Railway Settings

### Lỗi: "collectstatic failed"

**Giải pháp**: Tạm thời bỏ collectstatic trong start command:

Cập nhật `railway.json`:
```json
{
  "deploy": {
    "startCommand": "gunicorn config.wsgi:application --bind 0.0.0.0:$PORT"
  }
}
```

---

## 📚 Tài Liệu Tham Khảo

- Railway Python Docs: https://docs.railway.app/guides/python
- Nixpacks Docs: https://nixpacks.com/docs

