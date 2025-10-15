// frontend/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {adminApiClient}  from '../../../api/axiosConfig'; // Import trung tâm liên lạc

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApiClient .get('/dashboard/')
      .then(response => {
        setStats(response.data);
      })
      .catch(err => {
        setError('Không thể tải dữ liệu hoặc bạn không có quyền truy cập.');
        console.error(err);
      });
  }, []);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Tổng số học viên: {stats.total_students}</p>
      <p>Khóa học đang hoạt động: {stats.active_courses}</p>
      <p>Đăng ký mới hôm nay: {stats.new_signups_today}</p>
    </div>
  );
}