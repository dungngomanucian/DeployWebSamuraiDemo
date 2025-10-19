// frontend/src/api/axiosConfig.js

import axios from 'axios';

// --- Client cho Admin ---
export const adminApiClient  = axios.create({
  baseURL: import.meta.env.API_ADMIN_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Client cho Student ---
export const studentApiClient = axios.create({
  baseURL: import.meta.env.API_STUDENT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Client cho Teacher ---
export const teacherApiClient = axios.create({
  baseURL: import.meta.env.API_TEACHER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
