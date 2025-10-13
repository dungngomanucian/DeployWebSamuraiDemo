// frontend/src/api/axiosConfig.js

import axios from 'axios';

// Tạo một instance của Axios với các cấu hình mặc định
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sau này bạn có thể thêm các cấu hình khác như interceptor để tự động
// đính kèm token xác thực vào mỗi request.

export default apiClient;