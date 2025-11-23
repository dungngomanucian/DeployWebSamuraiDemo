// frontend/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {

  }, []);

  if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>;
  if (!stats) return <div className="flex justify-center items-center h-32"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div className="stat-title">Tổng số học viên</div>
          <div className="stat-value">{stats.total_students}</div>
          <div className="stat-desc">Tính đến hiện tại</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="stat-title">Khóa học đang hoạt động</div>
          <div className="stat-value">{stats.active_courses}</div>
          <div className="stat-desc">Đang mở đăng ký</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <div className="stat-title">Đăng ký mới hôm nay</div>
          <div className="stat-value">{stats.new_signups_today}</div>
          <div className="stat-desc text-secondary">↗︎ 25% so với hôm qua</div>
        </div>
      </div>
      
      {/* Vùng trống để thêm các biểu đồ hoặc bảng biểu sau này */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Biểu đồ thống kê</h2>
        <div className="mockup-window border bg-base-300 mt-4">
          <div className="flex justify-center px-4 py-16 bg-base-200">Khu vực này để hiển thị biểu đồ!</div>
        </div>
      </div>
    </div>
  );
}