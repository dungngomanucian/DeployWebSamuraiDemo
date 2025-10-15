import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; // Thêm Routes và Route
import HomePage from './pages/HomePage.jsx';
import StudentLogin from './pages/StudentLogin.jsx';

export default function App() {
  return (
    <div className='font-sans'>
      {/* Định nghĩa các đường dẫn */}
      <Routes>
        {/* Đường dẫn mặc định: "/" sẽ hiển thị HomePage */}
        <Route path="/" element={<HomePage />} />
        
        {/* Đường dẫn "/login" sẽ hiển thị StudentLogin */}
        <Route path="/login" element={<StudentLogin />} />
      </Routes>
    </div>
  );
}