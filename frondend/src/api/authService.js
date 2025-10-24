// src/api/authService.js
import { apiRequest } from './apiService';

// Base endpoint cho Authentication 
// Giả định backend dùng '/auth' hoặc '/student/auth' cho các API xác thực
// Lưu ý: Django thường đặt các endpoint auth ở cấp độ cao, ví dụ: /auth/login/ hoặc /student/auth/login/
const AUTH_BASE_ENDPOINT = '/student/login'; 

/**
 * Đăng nhập học sinh/sinh viên
 * @param {string} email - Email của người dùng
 * @param {string} password - Mật khẩu
 * @param {boolean} rememberMe - Trạng thái 'ghi nhớ đăng nhập'
 * @returns {Promise<{data: any, error: string | null}>} - Đối tượng kết quả
 */
export const userlogin = async (email, password, rememberMe = false) => {
    // Tên endpoint đăng nhập cụ thể (ví dụ: /auth/login/). 
    // Chúng ta dùng /login/ để gọi tới 'http://.../api/v1/auth/login/'
    const endpoint = `${AUTH_BASE_ENDPOINT}/userlogin/`; 

    // Chuẩn bị dữ liệu gửi lên
    const resultData = {
        email: email,
        password: password,
        remember_me: rememberMe // Tên trường thường dùng trong backend (snake_case)
    };

    // Sử dụng apiRequest để gửi request POST
    // KHÔNG cần thêm Authorization header ở đây vì đây là request đăng nhập.
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(resultData),
    });
};

