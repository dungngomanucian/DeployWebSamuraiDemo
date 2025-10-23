// frontend/src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HiBars3 } from "react-icons/hi2";
import Sidebar from '../components/admin/Sidebar';
import ThemeToggleButton from '../components/admin/ThemeToggleButton'; // <-- Import nút mới
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="drawer lg:drawer-open bg-base-100">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col items-center justify-start">
        {/* Header với nút Toggle Sidebar, Nút Theme, và Avatar */}
        <div className="w-full p-4 flex justify-between items-center sticky top-0 z-20 bg-base-100/95 backdrop-blur">
          {/* Nút Toggle Sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="btn btn-ghost btn-square hidden lg:inline-flex"
          >
            <HiBars3 className="w-6 h-6" />
          </button>
          
          {/* Spacer để đẩy các nút sang phải */}
          <div className="flex-grow"></div> 

          {/* Cụm nút bên phải */}
          <div className="flex items-center gap-2"> 
            {/* Nút Chuyển Theme */}
            <ThemeToggleButton /> 

            {/* Avatar Dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img alt="Admin Avatar" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><a>Hồ sơ</a></li>
                <li><a>Cài đặt</a></li>
                <li><a>Đăng xuất</a></li>
              </ul>
            </div>
          </div>
        </div>

        <main className="w-full p-6">
          <Outlet />
        </main>
      </div> 

      <Sidebar isSidebarOpen={isSidebarOpen} />
    </div>
  );
}