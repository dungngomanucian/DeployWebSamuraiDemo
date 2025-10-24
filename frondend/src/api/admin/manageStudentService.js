// manageStudentService.js
import { apiRequest } from '../apiService.js';

const MANAGE_STUDENT_BASE_ENDPOINT = '/admin/student'; // Đảm bảo endpoint này đúng

// Sửa lại hàm này
export const getAllStudent = async (page = 1, limit = 10) => {
  // Tạo query string từ page và limit
  const queryString = `?page=${page}&limit=${limit}`;
  return apiRequest(`${MANAGE_STUDENT_BASE_ENDPOINT}${queryString}`);
};

export const getAllClassroomActive = async ()=>{
  const queryString = `/get-classrooms-active/`;
  return apiRequest(`${MANAGE_STUDENT_BASE_ENDPOINT}/get-classrooms-active/`);
}