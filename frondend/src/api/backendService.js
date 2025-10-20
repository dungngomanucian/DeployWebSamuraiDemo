/**
 * Gọi API từ phía Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/* Helper function to make API requests */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { data: null, error: error.message };
  }
}

/* Lấy thông tin đề thi theo ID */
export const getExamById = async (examId) => {
  return apiRequest(`/student/exams/${examId}/`);
};

/* Lấy danh sách đề thi theo level */
export const getExamsByLevel = async (levelId) => {
  return apiRequest(`/student/exams/level/${levelId}/`);
};

/* Lấy toàn bộ dữ liệu đề thi (sections, questions, answers) */
export const getFullExamData = async (examId) => {
  return apiRequest(`/student/exams/${examId}/full/`);
};

/*Lưu kết quả thi */
export const saveExamResult = async (resultData) => {
  return apiRequest('/student/results/', {
    method: 'POST',
    body: JSON.stringify(resultData),
  });
};

/* Lưu câu trả lời của học sinh */
export const saveStudentAnswers = async (answers) => {
  return apiRequest('/student/answers/', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
};

/* Lấy danh sách levels */
export const getLevels = async () => {
  return apiRequest('/student/levels/');
};

