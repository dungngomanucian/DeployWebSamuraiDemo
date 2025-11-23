// frontend/src/api/studentDashboardService.js

import { apiRequest } from './apiService.js'; //

// URL của chúng ta là: .../api/v1/student/dashboard/...
// nên base endpoint là '/student/dashboard'
const DASHBOARD_BASE_ENDPOINT = '/student/dashboard';

export const updateOnboardingData = async (onboardingData) => {
  return apiRequest(`${DASHBOARD_BASE_ENDPOINT}/onboarding/`, {
    method: 'PATCH',
    body: JSON.stringify(onboardingData),
  });
};

export const getStudentProfile = async (accountId) => {
  // Gửi request GET đến: .../student/dashboard/profile/?account_id=account35
  return apiRequest(`${DASHBOARD_BASE_ENDPOINT}/profile/?account_id=${accountId}`);
  // apiRequest đã xử lý GET mặc định, nên không cần 'method'
};

export const getDashboardGridData = async (accountId) => {
  // Gửi request GET đến: .../student/dashboard/main/?account_id=account35
  return apiRequest(`${DASHBOARD_BASE_ENDPOINT}/main/?account_id=${accountId}`);
};
