// manageStudentService.js
import { apiRequest } from '../apiService.js';

const MANAGE_TEACHER_BASE_ENDPOINT = '/admin/teacher'; // Đảm bảo endpoint này đúng

// Sửa lại hàm này
export const getAllTeacher = async (page = 1, limit = 10) => {
  // Tạo query string từ page và limit
  const queryString = `?page=${page}&limit=${limit}`;
  return apiRequest(`${MANAGE_TEACHER_BASE_ENDPOINT}${queryString}`);
};

