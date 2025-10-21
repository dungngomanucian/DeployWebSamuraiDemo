import { apiRequest } from './apiService.js';

const DASHBOARD_BASE_ENDPOINT = '/admin';

export const getDashboard = async (answers) => {
  return apiRequest(`${EXAM_BASE_ENDPOINT}/answers/`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
};