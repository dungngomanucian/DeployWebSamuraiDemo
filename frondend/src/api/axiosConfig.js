// frontend/src/api/axiosConfig.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// --- Client cho Admin ---
export const adminApiClient = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Client cho Student ---
export const studentApiClient = axios.create({
  baseURL: `${API_BASE_URL}/student`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Client cho Teacher ---
export const teacherApiClient = axios.create({
  baseURL: `${API_BASE_URL}/teacher`,
  headers: {
    'Content-Type': 'application/json',
  },
});
