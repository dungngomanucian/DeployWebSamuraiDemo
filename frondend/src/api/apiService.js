// src/api/apiService.js

import { API_BASE_URL } from '../config/apiConfig';

/* * Helper function để thực hiện API requests
 * Tự động thêm JWT Authorization Header nếu token tồn tại.
 */
export async function apiRequest(endpoint, options = {}) {
    try {
        // 1. Lấy token từ Local Storage
        const token = localStorage.getItem('auth_token');

        // 2. Chuẩn bị headers mặc định
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        // 3. Thêm Authorization header nếu có token
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        // 4. Kết hợp headers mặc định và headers tùy chọn do người dùng cung cấp
        const finalHeaders = {
            ...defaultHeaders,
            ...options.headers,
        };

        // 5. Thực hiện fetch request
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: finalHeaders,
            // Đảm bảo không ghi đè body, method, etc.
            ...options, 
        });

        // 6. Xử lý lỗi HTTP (4xx hoặc 5xx)
        if (!response.ok) {
            // Status 499 = Client Closed Request - không cần hiển thị lỗi
            if (response.status === 499) {
                return { data: null, error: null }; // Silently ignore
            }
            
            let errorDetails = 'API request failed';
            
            try {
                // Thử đọc response body để lấy thông tin lỗi chi tiết từ backend (thường là JSON)
                const errorBody = await response.json();
                
                // Lấy thông báo lỗi từ các trường phổ biến: error, detail, message, hoặc body
                errorDetails = errorBody.error || errorBody.detail || errorBody.message || JSON.stringify(errorBody);
                
            } catch (e) {
                // Trường hợp response không phải JSON (ví dụ: trả về HTML trang lỗi)
                errorDetails = `HTTP Error ${response.status}: ${response.statusText}. Vui lòng kiểm tra logs backend.`;
            }
            
            // Ném lỗi để bắt ở khối catch ngoài cùng
            throw new Error(errorDetails);
        }

        // 7. Xử lý thành công
        
        // Kiểm tra 204 No Content (thành công nhưng không có body)
        const contentLength = response.headers.get('content-length');
        if (response.status === 204 || (contentLength !== null && parseInt(contentLength) === 0)) {
             return { data: null, error: null };
        }
        
        // Đọc body response
        const data = await response.json();
        return { data, error: null };
        
    } catch (error) {
        // Xử lý lỗi Mạng (Network error) hoặc lỗi throw từ bước 6
        
        // Ignore AbortError (request bị hủy) - không cần log hoặc hiển thị lỗi
        if (error.name === 'AbortError') {
            return { data: null, error: null };
        }
        
        // Ignore các lỗi connection khi client đóng kết nối
        if (error.message && (
            error.message.includes('Connection closed') ||
            error.message.includes('Client disconnected') ||
            error.message.includes('Connection error')
        )) {
            return { data: null, error: null };
        }
        
        console.error(`API Error [${endpoint}]:`, error);
        
        // Trả về thông báo lỗi cho component hiển thị
        return { data: null, error: error.message }; 
    }
}