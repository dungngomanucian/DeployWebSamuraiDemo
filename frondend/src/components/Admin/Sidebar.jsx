// frontend/src/components/admin/Sidebar.jsx
import React from 'react';
import SidebarMenuItem from './SidebarMenuItem';

// 1. IMPORT CẢ HAI LOGO
import logoFull from '../../assets/logo.png';      // Logo đầy đủ
import logoIcon from '../../assets/logo-icon.png';  // Logo icon (bạn cần tạo file này)

import {
  HiChartPie, HiUsers, HiBookOpen, HiBuildingLibrary, HiSignal,
  HiAcademicCap, HiPencilSquare, HiCog6Tooth, HiArrowLeftOnRectangle
} from 'react-icons/hi2';

const menuItems = [
  { to: "/admin/dashboard", icon: HiChartPie, label: "Dashboard" },
  { to: "/admin/students", icon: HiUsers, label: "Quản lý học viên" },
  { to: "/admin/teachers", icon: HiAcademicCap, label: "Quản lý giáo viên" },
  { to: "/admin/courses", icon: HiBookOpen, label: "Quản lý khóa học" },
  { to: "/admin/classes", icon: HiBuildingLibrary, label: "Quản lý lớp học" },
  { to: "/admin/levels", icon: HiSignal, label: "Quản lý level học" },
  { to: "/admin/exams", icon: HiPencilSquare, label: "Quản lý đề thi" },
  { type: 'divider' },
  { to: "/admin/settings", icon: HiCog6Tooth, label: "Cài đặt" },
];

export default function Sidebar({ isSidebarOpen }) {
  return (
    <div className="drawer-side">
      <label
        htmlFor="my-drawer-2"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul
        className={`menu p-4 min-h-full bg-base-200 text-base-content transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-80' : 'w-24'
        }`}
      >
        {/* Header với Logo */}
        <li className="mb-2">
          <div className="h-16 flex items-center justify-center">
            {/* 2. SỬ DỤNG LOGO CÓ ĐIỀU KIỆN TẠI ĐÂY */}
            <img
              src={isSidebarOpen ? logoFull : logoIcon}
              alt="Samurai App Logo"
              className={`transition-all duration-300 ${isSidebarOpen ? 'w-48' : 'w-16 h-16'}`}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </li>
        <div className="divider my-0"></div>

        {/* Lặp qua mảng dữ liệu để tạo các mục menu */}
        {menuItems.map((item, index) => 
          item.type === 'divider' ? (
            <div key={`divider-${index}`} className="divider"></div>
          ) : (
            <SidebarMenuItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isSidebarOpen={isSidebarOpen}
            />
          )
        )}

        {/* Mục Đăng xuất riêng */}
        <li>
          <a href="#" className={`flex gap-4 ${!isSidebarOpen && 'justify-center'}`}>
            <HiArrowLeftOnRectangle className="w-6 h-6" />
            <span className={!isSidebarOpen ? 'hidden' : ''}>Đăng xuất</span>
          </a>
        </li>
      </ul>
    </div>
  );
}