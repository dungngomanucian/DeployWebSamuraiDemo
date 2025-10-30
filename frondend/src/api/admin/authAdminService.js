// frontend/src/api/admin/authAdminService.js
import axiosAdmin from '../apiAdminService'; // <-- Import instance Axios Admin
// (Optional) Import axios cơ bản nếu muốn dùng riêng cho refresh call
// import axios from 'axios';
// import { API_BASE_URL } from '../../config/apiConfig'; 

const AUTH_ADMIN_BASE_ENDPOINT = '/admin/auth'; 

/**
 * Gọi API để đăng nhập admin.
 */
export const adminLogin = async (email, password) => {
  try {
    // Dùng axiosAdmin.post
    const response = await axiosAdmin.post(`${AUTH_ADMIN_BASE_ENDPOINT}/token`, { 
      email, 
      password 
    });
    // Trả về cấu trúc { data, error }
    return { data: response.data, error: null }; 
  } catch (error) {
    console.error(`API Lỗi [adminLogin]:`, error.response?.data || error.message);
    // Trả về lỗi chi tiết hơn nếu có
    return { data: null, error: error.response?.data?.detail || error.response?.data?.non_field_errors?.join(', ') || error.message || 'Đăng nhập thất bại' };
  }
};

/**
 * Gọi API để làm mới access token cho admin bằng refresh token.
 * QUAN TRỌNG: Hàm này được gọi TỪ interceptor. Để tránh vòng lặp,
 * cân nhắc dùng instance axios cơ bản thay vì axiosAdmin nếu có vấn đề.
 */
export const adminRefreshToken = async (refreshToken) => {
  //  try {
  //    // Tạm thời vẫn dùng axiosAdmin, nhưng cần theo dõi lỗi vòng lặp
  //    const response = await axiosAdmin.post(`${AUTH_ADMIN_BASE_ENDPOINT}/token/refresh/`, { 
  //      refresh: refreshToken 
  //    });
  //    // Chỉ cần trả về access token mới
  //    return { data: response.data, error: null }; 
  //  } catch (error) {
  //    console.error(`API Lỗi [adminRefreshToken]:`, error.response?.data || error.message);
  //    return { data: null, error: error.response?.data?.detail || error.message || 'Làm mới token thất bại' };
  //  }

   
   try {
     // Dùng axios cơ bản, không qua interceptor
     const response = await axios.post(`${API_BASE_URL}${AUTH_ADMIN_BASE_ENDPOINT}/token/refresh/`, { 
       refresh: refreshToken 
     }, {
       headers: { 'Content-Type': 'application/json' }
     });
     return { data: response.data, error: null };
   } catch (error) {
     console.error(`API Lỗi [adminRefreshToken]:`, error.response?.data || error.message);
     return { data: null, error: error.response?.data?.detail || error.message || 'Làm mới token thất bại' };
   }

};