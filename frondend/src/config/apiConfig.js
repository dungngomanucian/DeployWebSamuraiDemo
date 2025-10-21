/**
 * API Configuration
 * 
 * Cách sử dụng an toàn:
 * 1. Development: Sử dụng .env file với VITE_API_BASE_URL
 * 2. Production: Set environment variable trên hosting platform
 * 3. Không bao giờ hardcode production URLs trong code
 */

// Detect environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration
const API_CONFIG = {
  // Development URL (có thể override bằng .env)
  development: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  
  // Production URL (sẽ được set bởi hosting platform)
  production: import.meta.env.VITE_API_BASE_URL || 'https://your-api-domain.com/api/v1',
  
  // Fallback URL nếu không có environment variable
  fallback: 'http://localhost:8000/api/v1'
};

// Get current API base URL
export const getApiBaseUrl = () => {
  if (isDevelopment) {
    return API_CONFIG.development;
  } else if (isProduction) {
    return API_CONFIG.production;
  }
  
  return API_CONFIG.fallback;
};

// Export the current API base URL
export const API_BASE_URL = getApiBaseUrl();

// Security notes:
// - API URLs không chứa thông tin nhạy cảm
// - VITE_ prefix là bắt buộc để Vite expose biến
// - Trong production, sử dụng environment variables của hosting platform
// - Không bao giờ commit file .env vào git
