// frontend/src/api/studentDashboardService.js

import { studentApiClient } from './axiosConfig'; // Import "công cụ" axios đã cấu hình

/**
 * Cập nhật dữ liệu Onboarding (Step 1-5) cho sinh viên.
 * @param {object} onboardingData Dữ liệu từ form (bao gồm account_id, target_exam, v.v.)
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export const updateOnboardingData = async (onboardingData) => {
  try {
    // studentApiClient đã có baseURL là '.../api/v1/student'
    // File urls.py của bạn định nghĩa phần còn lại là 'dashboard/onboarding/'
    // File views.py của bạn dùng phương thức PATCH
    const response = await studentApiClient.patch('/dashboard/onboarding/', onboardingData);
    
    // Thành công: Trả về data, lỗi là null
    return { data: response.data, error: null };

  } catch (error) {
    // Thất bại: Axios tự động ném lỗi cho các status 4xx/5xx
    // Chúng ta chuẩn hóa lỗi và trả về
    
    const errorData = error.response?.data;
    let errorMsg = "Lỗi không xác định";

    if (errorData) {
      // Lỗi validation từ serializers.py
      if (errorData.target_date) errorMsg = errorData.target_date[0];
      else if (errorData.hour_per_day) errorMsg = errorData.hour_per_day[0];
      else if (errorData.target_jlpt_degree) errorMsg = errorData.target_jlpt_degree[0];
      // Lỗi chung từ views.py
      else if (errorData.error) errorMsg = errorData.error;
    } else {
      // Lỗi mạng (không kết nối được, v.v.)
      errorMsg = error.message || "Không thể kết nối đến máy chủ.";
    }

    console.error("Lỗi khi cập nhật onboarding (Service):", errorMsg);
    return { data: null, error: errorMsg };
  }
};
