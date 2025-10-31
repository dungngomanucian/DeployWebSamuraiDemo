import axios from 'axios';
// Import API_BASE_URL (hoặc hàm getApiBaseUrl)
import { API_BASE_URL } from '../config/apiConfig'; 
// Import hàm refresh token (đảm bảo đúng đường dẫn)
import { adminRefreshToken } from './admin/authAdminService'; 

// Tạo instance Axios cho Admin API
const axiosAdmin = axios.create({
  baseURL: API_BASE_URL, // Dùng base URL từ config của mày
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// Tự động thêm Access Token vào header
axiosAdmin.interceptors.request.use(
  (config) => {
    // Chỉ thêm token cho các API admin (ví dụ: bắt đầu bằng /admin/)
    // Không thêm cho login/refresh
    const isAdminPath = config.url?.startsWith('/admin/'); // Chỉnh lại nếu đường dẫn admin khác
    const isAuthPath = config.url?.includes('/auth/token'); 

    if (isAdminPath && !isAuthPath) {
      const token = localStorage.getItem('adminAccessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
// Xử lý khi Access Token hết hạn (lỗi 401)
let isRefreshing = false; // Cờ tránh gọi refresh liên tục
let failedQueue = []; // Hàng đợi request lỗi 401

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosAdmin.interceptors.response.use(
  (response) => response, // Trả về nếu thành công
  async (error) => {
    const originalRequest = error.config;

    // Check lỗi 401, chưa retry, không phải là API refresh bị lỗi
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/token/refresh')) {

      if (isRefreshing) {
        // Nếu đang refresh, chờ promise trả về token mới
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosAdmin(originalRequest); // Gửi lại request với token mới
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true; // Đánh dấu đã thử lại
      isRefreshing = true;
      const refreshToken = localStorage.getItem('adminRefreshToken');

      if (!refreshToken) {
        console.error("Admin Refresh Token: Không tìm thấy.");
        isRefreshing = false;
        // Xử lý logout (chuyển hướng hoặc dùng context)
        window.location.href = '/admin/login'; 
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        // Lưu ý: Đảm bảo hàm adminRefreshToken dùng axios cơ bản hoặc fetch
        // để tránh vòng lặp interceptor. Giả sử nó an toàn để gọi trực tiếp.
        const { data: refreshData, error: refreshError } = await adminRefreshToken(refreshToken);

        if (refreshError || !refreshData?.access) {
          throw new Error(refreshError || 'Làm mới token thất bại');
        }

        // Refresh thành công
        const newAccessToken = refreshData.access;
        localStorage.setItem('adminAccessToken', newAccessToken);
        // axiosAdmin.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`; // Cập nhật header mặc định (tùy chọn)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`; // Cập nhật header request gốc

        processQueue(null, newAccessToken); // Xử lý các request đang chờ
        return axiosAdmin(originalRequest); // Thử lại request gốc

      } catch (refreshErr) {
        console.error('Admin Refresh Token: Không thể làm mới:', refreshErr);
        processQueue(refreshErr, null); // Báo lỗi cho các request đang chờ

        // Xử lý logout khi refresh thất bại
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        // Gọi hàm logout từ context nếu có
        window.location.href = '/admin/login'; 

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    // Trả về các lỗi khác trực tiếp
    return Promise.reject(error);
  }
);

export default axiosAdmin; // Export instance đã cấu hình