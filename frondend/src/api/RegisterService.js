// src/api/authService.js
import { apiRequest } from './apiService';

// Base endpoint cho Authentication 
// Giả định backend dùng '/auth' hoặc '/student/auth' cho các API xác thực
// Lưu ý: Django thường đặt các endpoint auth ở cấp độ cao, ví dụ: /auth/login/ hoặc /student/auth/login/
const AUTH_BASE_ENDPOINT = '/student/register'; 
/**
 * [BƯỚC 1 Đăng ký] Khởi tạo xác thực, gửi dữ liệu form và yêu cầu Backend gửi mã.
 * Endpoint: /auth/register-start-verification/
 * @param {object} formData - Toàn bộ dữ liệu form (name, email, password, phone, confirmPassword)
 * @returns {Promise<{data: {success: boolean, codes: string[]}, error: string | null}>}
 */
export const startRegistrationVerification = async (formData) => {
    const endpoint = `${AUTH_BASE_ENDPOINT}/register-start-verification`; 
    
    // Lưu ý: apiRequest đã tự động thêm Content-Type: application/json
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
    });
};


/**
 * [BƯỚC 2 Đăng ký] Xác thực mã code và hoàn tất tạo tài khoản.
 * Endpoint: /auth/verify-and-register/
 * @param {object} verificationPayload - Dữ liệu form đầy đủ + mã code (code)
 * @returns {Promise<{data: {success: boolean, token?: string}, error: string | null}>}
 */
export const verifyRegistrationCode = async (verificationPayload) => {
    const endpoint = `${AUTH_BASE_ENDPOINT}/verify-and-register`; 
    
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(verificationPayload),
    });
};
