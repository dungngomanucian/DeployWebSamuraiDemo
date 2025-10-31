// frontend/src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
// 1. Import hook
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext'; // Đảm bảo đường dẫn đúng

import { HiBars3,HiUserCircle } from "react-icons/hi2";
import Sidebar from '../components/Admin/Sidebar'; // Sidebar được import ở đây
import ThemeToggleButton from '../components/Admin/ThemeToggleButton';

const LIGHT_THEME = 'winter'; 
const DARK_THEME = 'black';   

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 2. Lấy hàm logout và navigate
  const { logout, adminUser } = useAdminAuth();
  const navigate = useNavigate();

  // ... (logic theme giữ nguyên) ...
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('adminTheme'); 
    return savedTheme && [LIGHT_THEME, DARK_THEME].includes(savedTheme) ? savedTheme : LIGHT_THEME;
  });
  
  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const nextTheme = prevTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
      return nextTheme; 
    });
  };
  // --- KẾT THÚC LOGIC THEME ---

  // 3. Định nghĩa hàm xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm từ context
    navigate('/admin/login', { replace: true }); // Chuyển về trang login
  };

  return (
    <div className="drawer lg:drawer-open bg-base-100 min-h-screen" data-theme={theme}> 
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col items-stretch">
        
        {/* Header */}
        <div className="w-full p-4 flex justify-between items-center sticky top-0 z-20 bg-base-100/95 backdrop-blur shadow-sm">
          {/* ... (Nút toggle sidebar giữ nguyên) ... */}
          <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="btn btn-ghost btn-square hidden lg:inline-flex mr-2"
              >
                <HiBars3 className="w-6 h-6" />
              </button>
              <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost lg:hidden">
                 <HiBars3 className="w-6 h-6" />
              </label>
          </div>
          
          <div className="flex items-center gap-2"> 
            <ThemeToggleButton currentTheme={theme} toggleTheme={toggleTheme} /> 
            {adminUser && (
              <span className="text-sm font-medium hidden sm:inline">
                {adminUser.email}
              </span>
            )}
            {/* Avatar Dropdown (Đã xóa nút Đăng xuất) */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10">
                  <HiUserCircle className="w-9.5 h-9.5 item-center" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-grow w-full p-6 overflow-auto">
          <Outlet />
        </main>
      </div> 

      {/* 4. TRUYỀN HÀM handleLogout XUỐNG CHO SIDEBAR */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        currentTheme={theme} 
        onLogout={handleLogout} // <-- Prop mới
      />
    </div>
  );
}