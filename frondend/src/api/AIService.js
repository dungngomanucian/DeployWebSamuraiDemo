/**
 * AI Service - Gọi các API liên quan đến trí tuệ nhân tạo (ví dụ: Gemini)
 * Sử dụng apiService.js làm base
 */
import { apiRequest } from './apiService';

// Endpoint để dịch văn bản bằng Gemini
const AUTH_BASE_ENDPOINT = '/student/AISearch';

/**
 * Gửi văn bản đến backend để dịch bằng Gemini.
 * @param {string} text - Văn bản cần dịch.
 * @returns {Promise<{data: {translatedText: string}, error: string | null}>}
 */
export const translateTextWithGemini = async (text) => {
    const endpoint = `${AUTH_BASE_ENDPOINT}/translategemini/`;
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
};