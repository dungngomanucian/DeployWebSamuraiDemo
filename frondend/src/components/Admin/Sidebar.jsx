// frontend/src/components/admin/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import SidebarMenuItem from './SidebarMenuItem';

// 1. IMPORT CẢ BA LOGO
import logoFullDark from '../../assets/logo.png';     // Logo gốc (cho theme tối)
import logoFullLight from '../../assets/logo3.png';    // Logo mới (cho theme sáng - winter)
import logoIcon from '../../assets/logo-icon.png';     // Logo icon (khi thu gọn)

// 2. IMPORT ICON ĐĂNG XUẤT (Hoặc đổi sang PrimeIcons nếu muốn)
import { HiArrowLeftOnRectangle } from "react-icons/hi2"; 

// Mảng menuItems với icon PrimeIcons (giữ nguyên)
const menuItems = [
  { to: "/admin/dashboard", icon: "pi pi-chart-pie", label: "Dashboard" },
  { to: "/admin/accounts", icon: "pi pi-users", label: "Quản lý tài khoản" },
  { to: "/admin/students", icon: "pi pi-users", label: "Quản lý học viên" },
  { to: "/admin/teachers", icon: "pi pi-id-card", label: "Quản lý giáo viên" },
  { to: "/admin/courses", icon: "pi pi-book", label: "Quản lý khóa học" },
  { to: "/admin/classes", icon: "pi pi-building", label: "Quản lý lớp học" },
  { to: "/admin/levels", icon: "pi pi-sliders-h", label: "Quản lý level học" },
  { to: "/admin/jlpt-exams", icon: "pi pi-file-edit", label: "Quản lý đề thi" },
  { type: 'divider' },
  { to: "/admin/settings", icon: "pi pi-cog", label: "Cài đặt" },
];
const LIGHT_THEME = 'winter'; const DARK_THEME = 'black';
// Nhận currentTheme trực tiếp từ props
export default function Sidebar({ isSidebarOpen, currentTheme }) {


  // Logic chọn logo giờ dùng state local currentTheme
  let logoToShow;
  if (isSidebarOpen) {
    console.log(currentTheme);
    if(currentTheme === LIGHT_THEME) logoToShow = logoFullDark;
    else if(currentTheme === DARK_THEME) logoToShow = logoFullLight;
  } else {
    logoToShow = logoIcon;
  }

  return (
    <div className="drawer-side">
      <label
        htmlFor="my-drawer-2"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul
        className={`menu p-4 min-h-full bg-base-200 text-base-content transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-60' : 'w-24' // Giữ nguyên chiều rộng từ code của mày
        }`}
      >
        {/* Header với Logo */}
        <li className="mb-2">
          <div className="h-16 flex items-center justify-center">
            {/* 6. SỬ DỤNG BIẾN `logoToShow` */}
            <img
              src={logoToShow}
              alt="Samurai App Logo"
              // Giữ nguyên class width từ code của mày
              className={`transition-all duration-300 ${isSidebarOpen ? 'w-40' : 'w-16 h-16'}`} 
              style={{ objectFit: 'contain' }}
            />
          </div>
        </li>
        <div className="divider my-0"></div>

        {/* Lặp qua menuItems */}
        {menuItems.map((item, index) => 
          item.type === 'divider' ? (
            <div key={`divider-${index}`} className="divider my-1"></div> // Thêm my-1
          ) : (
            // 7. TRUYỀN `item` VÀ `currentTheme` XUỐNG `SidebarMenuItem`
            <SidebarMenuItem
              key={item.to}
              item={item} // Truyền cả object item
              isSidebarOpen={isSidebarOpen}
              currentTheme={currentTheme} // Truyền theme xuống
            />
          )
        )}

        {/* Mục Đăng xuất riêng */}
        <li>
          {/* Giữ nguyên icon HiArrowLeftOnRectangle hoặc đổi sang pi pi-sign-out */}
          <a href="#" className={`flex items-center gap-4 py-2 px-4 rounded-md transition-colors duration-200 hover:bg-base-300 ${!isSidebarOpen && 'justify-center'}`}>
            <HiArrowLeftOnRectangle className="w-6 h-6" /> 
            <span className={`transition-opacity duration-200 ${!isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>Đăng xuất</span>
          </a>
        </li>
      </ul>
    </div>
  );
}