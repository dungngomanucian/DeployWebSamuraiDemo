/**
 * Forgot Password Service - Gọi API cho chức năng quên mật khẩu
 * Sử dụng apiService.js làm base
 */
import { apiRequest } from './apiService.js';

// Base endpoint cho forgot password functionality
const FORGOT_PASSWORD_BASE_ENDPOINT = '/student/auth';

/**
 * Gửi yêu cầu đặt lại mật khẩu
 * @param {string} email - Địa chỉ email của người dùng
 * @returns {Promise} - Kết quả API call
 */
export const sendForgotPasswordRequest = async (email) => {
  return apiRequest(`${FORGOT_PASSWORD_BASE_ENDPOINT}/forgot-password/`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Xác thực token đặt lại mật khẩu
 * @param {string} token - Token xác thực từ email
 * @returns {Promise} - Kết quả API call
 */
export const verifyResetToken = async (token) => {
  return apiRequest(`${FORGOT_PASSWORD_BASE_ENDPOINT}/verify-reset-token/`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

/**
 * Đặt lại mật khẩu mới
 * @param {string} token - Token xác thực
 * @param {string} newPassword - Mật khẩu mới
 * @param {string} confirmPassword - Xác nhận mật khẩu mới
 * @returns {Promise} - Kết quả API call
 */
export const resetPassword = async (token, newPassword, confirmPassword) => {
  return apiRequest(`${FORGOT_PASSWORD_BASE_ENDPOINT}/reset-password/`, {
    method: 'POST',
    body: JSON.stringify({
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
};

/**
 * Kiểm tra trạng thái token (còn hiệu lực hay không)
 * @param {string} token - Token cần kiểm tra
 * @returns {Promise} - Kết quả API call
 */
export const checkTokenStatus = async (token) => {
  return apiRequest(`${FORGOT_PASSWORD_BASE_ENDPOINT}/check-token-status/`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

/**
 * Gửi lại email đặt lại mật khẩu (resend)
 * @param {string} email - Địa chỉ email
 * @returns {Promise} - Kết quả API call
 */
export const resendResetEmail = async (email) => {
  return apiRequest(`${FORGOT_PASSWORD_BASE_ENDPOINT}/resend-reset-email/`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Lấy thông tin về lần gửi email gần nhất
 * @param {string} email - Địa chỉ email
 * @returns {Promise} - Kết quả API call
 */
export const getLastEmailSentInfo = async (email) => {
  return apiRequest(`${FORGOT_PASSWORD_BASE_ENDPOINT}/last-email-info/`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};