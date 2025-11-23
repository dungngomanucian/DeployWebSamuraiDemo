// frontend/src/components/common/ThemeToggleButton.jsx
import React, { useState, useEffect } from 'react';
import { HiSun, HiMoon } from 'react-icons/hi2'; // Dùng icon cho đẹp

const ThemeToggleButton = () => {
  // 1. State để lưu theme hiện tại ('winter' hoặc 'night')
  // Đọc theme đã lưu từ localStorage hoặc mặc định là 'winter'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'winter');

  // 2. useEffect để áp dụng theme vào thẻ <html>
  useEffect(() => {
    // Lấy thẻ <html>
    const htmlTag = document.documentElement;
    // Set thuộc tính data-theme
    htmlTag.setAttribute('data-theme', theme);
    // Lưu theme vào localStorage để nhớ lựa chọn
    localStorage.setItem('theme', theme);
  }, [theme]); // Chạy lại mỗi khi state `theme` thay đổi

  // 3. Hàm để chuyển đổi theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'winter' ? 'dark' : 'winter'));
  };

  return (
    <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
      {/* Hiển thị icon mặt trăng nếu đang là theme sáng, và ngược lại */}
      {theme === 'winter' ? (
        <HiMoon className="w-6 h-6" />
      ) : (
        <HiSun className="w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeToggleButton;