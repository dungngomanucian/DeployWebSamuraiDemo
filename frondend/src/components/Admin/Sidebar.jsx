// frontend/src/components/admin/Sidebar.jsx
import React, {useRef } from 'react';
import SidebarMenuItem from './SidebarMenuItem';

import logoFullDark from '../../assets/logo.png';
import logoFullLight from '../../assets/logo3.png';
import logoIcon from '../../assets/logo-icon.png';
import { HiArrowLeftOnRectangle } from "react-icons/hi2"; 

const menuItems = [
  // ... (mảng menuItems giữ nguyên) ...
  { to: "/admin/dashboard", icon: "pi pi-chart-pie", label: "Dashboard" },
  { to: "/admin/accounts", icon: "pi pi-users", label: "Quản lý tài khoản" },
  { to: "/admin/students", icon: "pi pi-users", label: "Quản lý học viên" },
  { to: "/admin/teachers", icon: "pi pi-id-card", label: "Quản lý giáo viên" },
  { to: "/admin/courses", icon: "pi pi-book", label: "Quản lý khóa học" },
  { to: "/admin/classrooms", icon: "pi pi-building", label: "Quản lý lớp học" },
  { to: "/admin/levels", icon: "pi pi-sliders-h", label: "Quản lý level học" },
  { to: "/admin/jlpt-exams", icon: "pi pi-file-edit", label: "Quản lý đề thi" },
  { type: 'divider' },
];
const LIGHT_THEME = 'winter'; const DARK_THEME = 'black';

// 1. NHẬN THÊM PROP `onLogout`
export default function Sidebar({ isSidebarOpen, currentTheme, onLogout }) {
  const modalRef = useRef(null);
  // ... (logic logoToShow giữ nguyên) ...
  let logoToShow;
  if (isSidebarOpen) {
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
          isSidebarOpen ? 'w-60' : 'w-24'
        }`}
      >
        {/* ... (Phần Header/Logo giữ nguyên) ... */}
        <li className="mb-2">
          <div className="h-16 flex items-center justify-center">
            <img
              src={logoToShow}
              alt="Samurai App Logo"
              className={`transition-all duration-300 ${isSidebarOpen ? 'w-40' : 'w-16 h-16'}`} 
              style={{ objectFit: 'contain' }}
            />
          </div>
        </li>
        <div className="divider my-0"></div>

        {/* ... (Phần lặp qua menuItems giữ nguyên) ... */}
        {menuItems.map((item, index) => 
          item.type === 'divider' ? (
            <div key={`divider-${index}`} className="divider my-1"></div>
          ) : (
            <SidebarMenuItem
              key={item.to}
              item={item}
              isSidebarOpen={isSidebarOpen}
              currentTheme={currentTheme}
            />
          )
        )}

        {/* --- SỬA TẠI ĐÂY --- */}
        {/* Mục Đăng xuất riêng */}
        <li>
          {/* 3. Sửa onClick: Thay vì gọi onLogout, ta MỞ modal */}
          <button 
            onClick={() => modalRef.current.showModal()} // <-- MỞ MODAL
            className={`flex items-center gap-4 py-2 px-4 rounded-md transition-colors duration-200 hover:bg-base-300 w-full ${!isSidebarOpen && 'justify-center'}`}
          >
            <HiArrowLeftOnRectangle className="w-6 h-6" /> 
            <span className={`transition-opacity duration-200 ${!isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>Đăng xuất</span>
          </button>
        </li>
        {/* --- KẾT THÚC SỬA --- */}
      </ul>

      <dialog id="logout_confirm_modal" className="modal" ref={modalRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Xác nhận Đăng xuất</h3>
          <p className="py-4">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản admin không?</p>
          <div className="modal-action">
            {/* Nút Hủy: Chỉ đóng modal */}
            <button 
              className="btn" 
              onClick={() => modalRef.current.close()}
            >
              Hủy
            </button>
            
            {/* Nút Xác nhận: Đóng modal VÀ gọi onLogout */}
            <button 
              className="btn btn-error" // Nút màu đỏ
              onClick={() => {
                modalRef.current.close(); // Đóng modal
                onLogout(); // <-- Gọi hàm logout thật
              }}
            >
              Tôi chắc chắn
            </button>
          </div>
        </div>
        {/* Vùng nền mờ, click vào cũng đóng modal */}
        <form method="dialog" className="modal-backdrop">
            <button>close</button>
        </form>
      </dialog>
    </div>
  );
}