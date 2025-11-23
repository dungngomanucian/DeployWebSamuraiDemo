// manageStudentService.js
import { apiRequest } from '../apiService.js';

const MANAGE_JLPTEXAM_BASE_ENDPOINT = '/admin/jlpt-exam'; // Đảm bảo endpoint này đúng

// Sửa lại hàm này
export const getAllJlptExam = async (page = 1, limit = 10) => {
  // Tạo query string từ page và limit
  const queryString = `?page=${page}&limit=${limit}`;
  return apiRequest(`${MANAGE_JLPTEXAM_BASE_ENDPOINT}${queryString}`);
};

