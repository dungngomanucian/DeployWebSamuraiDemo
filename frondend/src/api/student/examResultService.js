// src/api/resultService.js (Tệp mới)

import { apiRequest } from '../apiService.js';

/**
 * Giả định:
 * Backend của bạn có 'api/results/'
 * Frontend (Vite/Nginx) có proxy '/student/results/' trỏ đến 'api/results/'
 * (Chúng ta làm theo mẫu của '/student/exam/' trỏ đến 'api/exam/')
 */
const RESULTS_BASE_ENDPOINT = '/student/exam-results';

/**
 * Lấy lịch sử bài làm của học sinh (từ API mới)
 */
export const getExamHistory = async () => {
  // GET /student/results/history/
  return apiRequest(`${RESULTS_BASE_ENDPOINT}/history/`);
};

/**
 * LẤY CHI TIẾT BÀI LÀM ĐỂ REVIEW (API MỚI)
 * Đây là hàm chúng ta cần cho Trang Review.
 * @param {string | number} examResultId - ID của *kết quả* bài làm (từ bảng exam_results)
 */
export const getExamResultDetail = async (examResultId) => {
  // GET /student/results/<exam_result_id>/
  return apiRequest(`${RESULTS_BASE_ENDPOINT}/${examResultId}/`);
};