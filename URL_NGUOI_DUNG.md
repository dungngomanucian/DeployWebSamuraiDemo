# 🌐 URL Người Dùng Truy Cập

## 📍 Câu Trả Lời Ngắn Gọn

**Người dùng truy cập vào URL Frontend (Vercel):**

```
https://your-app.vercel.app
```

Hoặc nếu bạn đã set custom domain:

```
https://yourdomain.com
```

---

## 🔍 Giải Thích Chi Tiết

### URL Người Dùng Thấy (Frontend - Vercel)

✅ **Đây là URL công khai** mà người dùng:
- Mở trong browser (Chrome, Firefox, Safari...)
- Bookmark để truy cập lại
- Share với người khác
- Tìm kiếm trên Google (nếu public)

**Ví dụ:**
```
https://samurai-japanese-app.vercel.app
```

### URL Backend (Railway) - Người Dùng KHÔNG Thấy

❌ **Người dùng KHÔNG truy cập trực tiếp** vào URL này:
```
https://your-app.railway.app
```

**Tại sao?**
- Đây là API server, không phải giao diện web
- Frontend tự động gọi API đến đây ở background
- Người dùng không cần biết URL này

---

## 🔄 Cách Hoạt Động

```
1. Người dùng mở browser
   ↓
2. Gõ URL: https://your-app.vercel.app
   ↓
3. Frontend (Vercel) load giao diện
   ↓
4. Frontend tự động gọi API đến Backend (Railway)
   ↓
5. Backend trả về data
   ↓
6. Frontend hiển thị data cho người dùng
```

**Người dùng chỉ thấy và tương tác với Frontend!**

---

## 🎯 Ví Dụ Thực Tế

### Khi Người Dùng Sử Dụng

1. **Người dùng mở browser** và gõ:
   ```
   https://samurai-japanese-app.vercel.app
   ```

2. **Frontend hiển thị:**
   - Giao diện đăng nhập
   - Form đăng ký
   - Dashboard
   - Tất cả các trang web

3. **Khi người dùng đăng nhập:**
   - Frontend gọi API: `https://your-app.railway.app/api/v1/student/login/`
   - Backend xử lý và trả về kết quả
   - Frontend hiển thị kết quả cho người dùng

**Người dùng không cần biết URL backend!**

---

## 🌍 Custom Domain (Tùy Chọn)

Nếu bạn muốn URL đẹp hơn, có thể set custom domain:

### Trên Vercel:

1. Vào **Settings** → **Domains**
2. Thêm domain của bạn (ví dụ: `samurai-app.com`)
3. Cấu hình DNS theo hướng dẫn
4. Người dùng sẽ truy cập: `https://samurai-app.com`

**Lưu ý**: Cần mua domain trước (từ Namecheap, GoDaddy, etc.)

---

## 📱 Share URL với Người Dùng

### URL Công Khai (Frontend)

✅ **Có thể share:**
```
https://your-app.vercel.app
```

### URL Backend

❌ **KHÔNG share:**
```
https://your-app.railway.app  ← Chỉ dùng nội bộ
```

---

## ✅ Checklist

- [ ] Frontend đã deploy trên Vercel
- [ ] Có URL frontend: `https://your-app.vercel.app`
- [ ] Mở URL frontend thấy giao diện ứng dụng
- [ ] Frontend đã kết nối với backend (không có lỗi CORS)
- [ ] Test đăng nhập/đăng ký hoạt động
- [ ] (Tùy chọn) Đã set custom domain

---

## 🎯 Tóm Tắt

| Loại | URL | Ai Truy Cập |
|------|-----|-------------|
| **Frontend** | `https://your-app.vercel.app` | ✅ **Người dùng** |
| **Backend** | `https://your-app.railway.app` | ❌ Chỉ frontend gọi API |

**Kết luận: Người dùng chỉ cần biết URL Frontend (Vercel)!**

---

## 📚 Lưu Ý

1. **URL Frontend là công khai**: Ai cũng có thể truy cập
2. **URL Backend nên bảo mật**: Không share công khai
3. **CORS bảo vệ**: Chỉ cho phép frontend gọi API
4. **Custom domain**: Làm URL chuyên nghiệp hơn

---

## 🆘 FAQ

**Q: Người dùng có thể truy cập trực tiếp URL backend không?**  
A: Có thể, nhưng sẽ không thấy giao diện web, chỉ thấy JSON response hoặc lỗi. Không nên share URL backend.

**Q: Làm sao để URL đẹp hơn?**  
A: Set custom domain trên Vercel (cần mua domain).

**Q: Có thể ẩn URL backend không?**  
A: CORS đã bảo vệ, nhưng tốt nhất là không share URL backend công khai.

