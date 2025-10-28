// frontend/src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react'; // <<<<<<< THÊM useEffect
import { Outlet } from 'react-router-dom';
import { HiBars3 } from "react-icons/hi2";
import Sidebar from '../components/Admin/Sidebar';
import ThemeToggleButton from '../components/Admin/ThemeToggleButton'; // Đường dẫn có thể khác

// CSS PrimeReact (Nên chuyển ra main.jsx)
import "primereact/resources/themes/lara-light-indigo/theme.css"; 
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Định nghĩa tên theme
const LIGHT_THEME = 'winter'; 
const DARK_THEME = 'black';   

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // --- LOGIC QUẢN LÝ THEME ---
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

  return (
    // 👇 ÁP DỤNG data-theme VÀO DIV GỐC
    <div className="drawer lg:drawer-open bg-base-100 min-h-screen" data-theme={theme}> 
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col items-stretch">
        
        {/* Header */}
        <div className="w-full p-4 flex justify-between items-center sticky top-0 z-20 bg-base-100/95 backdrop-blur shadow-sm">
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
            {/* 👇 Truyền theme và toggleTheme */}
            <ThemeToggleButton currentTheme={theme} toggleTheme={toggleTheme} /> 

            {/* Avatar Dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img alt="Admin Avatar" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                </div>
              </div>
              {/* <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[50] p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                <li><a>Hồ sơ</a></li>
                <li><a>Cài đặt</a></li>
                <div className="divider my-1"></div>
                <li><a>Đăng xuất</a></li>
              </ul> */}
            </div>
          </div>
        </div>

        <main className="flex-grow w-full p-6 overflow-auto">
          <Outlet />
        </main>
      </div> 

      {/* Truyền cả theme và isSidebarOpen xuống Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} currentTheme={theme} />
    </div>
  );
}