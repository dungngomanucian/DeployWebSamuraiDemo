/**
 * Exam Service - Gọi API cho chức năng đề thi
 * Sử dụng apiService.js làm base
 */
import { apiRequest } from './apiService.js';

// Base endpoint cho exam functionality
const EXAM_BASE_ENDPOINT = '/student/exam';

/**
 * Lấy danh sách tất cả levels
 */
export const getLevels = async () => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/levels/`);
};

/**
 * Lấy thông tin đề thi theo ID
 */
export const getExamById = async (examId) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/exams/${examId}/`);
};

/**
 * Lấy danh sách đề thi theo level
 */
export const getExamsByLevel = async (levelId) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/exams/${levelId}/list/`);
};

/**
 * Lấy toàn bộ dữ liệu đề thi (sections, questions, answers)
 */
export const getFullExamData = async (examId) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/exams/${examId}/full_data/`);
};

/**
 * Lưu kết quả thi
 */
export const saveExamResult = async (resultData) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/results/`, {
    method: 'POST',
    body: JSON.stringify(resultData),
  });
};

/**
 * Lưu câu trả lời của học sinh
 */
export const saveStudentAnswers = async (answers) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/answers/`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
};

/**
 * Lấy thông tin chi tiết về một câu hỏi
 */
export const getQuestionDetails = async (questionId) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/questions/${questionId}/`);
};

/**
 * Lấy danh sách câu hỏi theo section
 */
export const getQuestionsBySection = async (sectionId) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/sections/${sectionId}/questions/`);
};

/**
 * Lấy lịch sử làm bài của sinh viên
 */
export const getExamHistory = async (studentId) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/history/${studentId}/`);
};

/**
 * Lấy thống kê điểm số của sinh viên
 */
export const getExamStatistics = async (studentId) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/statistics/${studentId}/`);
};