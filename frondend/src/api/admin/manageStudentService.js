// manageStudentService.js
import axiosAdmin from '../apiAdminService'; // <-- Import instance Axios đã cấu hình

// Giữ nguyên base endpoint
const MANAGE_STUDENT_BASE_ENDPOINT = '/admin/student'; 

// Sửa lại hàm getAllStudent (CHỈ FIX AXIOS, BỎ SORT)
export const getAllStudent = async (page = 1, limit = 10) => {
  // Tạo object params chỉ chứa page và limit
  let params = { page, limit }; 
  
  try {
    // Dùng axiosAdmin.get với params
    const response = await axiosAdmin.get(MANAGE_STUDENT_BASE_ENDPOINT, { params }); 
    // Trả về cấu trúc { data, error } giống apiRequest cũ
    return { data: response.data, error: null }; 
  } catch (error) {
    console.error(`API Lỗi [getAllStudent]:`, error.response?.data || error.message);
    // Trích xuất lỗi cụ thể hơn từ Axios error object
    return { data: null, error: error.response?.data?.detail || error.response?.data?.error || error.message || 'Lấy danh sách học viên thất bại' };
  }
};

// Sửa lại hàm getAllClassroomActive
export const getAllClassroomActive = async () => {
   try {
     // Endpoint này có thể không cần prefix /admin/student, tùy urls.py
     // Sửa lại endpoint cho đúng (ví dụ: /admin/classrooms/active/)
     const response = await axiosAdmin.get('/admin/classrooms/active/'); // <-- Đảm bảo endpoint đúng
     return { data: response.data, error: null };
   } catch (error) {
     console.error(`API Lỗi [getAllClassroomActive]:`, error.response?.data || error.message);
     return { data: null, error: error.response?.data?.detail || error.response?.data?.error || error.message || 'Lấy danh sách lớp học thất bại' };
   }
};

// --- QUAN TRỌNG ---
// Mày cần thêm các hàm CRUD khác (create, update, delete) 
// dùng axiosAdmin.post, .put, .delete tương tự như ví dụ dưới đây

export const createStudent = async (studentData) => {
    try {
        // Giả sử endpoint create là /admin/student/create/
        const response = await axiosAdmin.post(`${MANAGE_STUDENT_BASE_ENDPOINT}/create/`, studentData);
        return { data: response.data, error: null };
    } catch (error) {
        console.error(`API Lỗi [createStudent]:`, error.response?.data || error.message);
        return { data: null, error: error.response?.data || error.message || 'Tạo học viên thất bại' };
    }
};

// Ví dụ hàm delete
export const deleteStudent = async (studentId) => {
    try {
        // Giả sử endpoint delete là /admin/student/<id>/delete/
        await axiosAdmin.delete(`${MANAGE_STUDENT_BASE_ENDPOINT}/${studentId}/delete/`);
        return { data: { success: true }, error: null }; // Trả về success nếu không có lỗi
    } catch (error) {
        console.error(`API Lỗi [deleteStudent]:`, error.response?.data || error.message);
        return { data: null, error: error.response?.data || error.message || 'Xóa học viên thất bại' };
    }
};

// ... Thêm các hàm update, getById tương tự ...