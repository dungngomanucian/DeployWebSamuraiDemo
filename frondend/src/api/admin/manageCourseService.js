// manageStudentService.js
import { apiRequest } from '../apiService.js';

const MANAGE_COURSE_BASE_ENDPOINT = '/admin/course'; // Đảm bảo endpoint này đúng

// Sửa lại hàm này
export const getAllCourse = async (page = 1, limit = 10) => {
  // Tạo query string từ page và limit
  const queryString = `?page=${page}&limit=${limit}`;
  return apiRequest(`${MANAGE_COURSE_BASE_ENDPOINT}${queryString}`);
};

