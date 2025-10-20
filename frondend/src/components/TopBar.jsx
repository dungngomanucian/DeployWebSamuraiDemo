import React from 'react';
import { HiMenu, HiOutlineBell, HiSearch } from 'react-icons/hi';
import logoFull from '../assets/Logo Samurai (chữ ngang).png';

const TopBar = ({ isOpen, onToggleSidebar }) => { // Thêm prop 'isOpen'
  return (
    <div className="flex items-center justify-between w-full h-16 pl-5 pr-9 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-shrink-0">
        
        {/* Nút Hamburger */}
        <button 
          onClick={onToggleSidebar} 
          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiMenu className="w-6 h-6" />
        </button>
        
        {/* Logo Icon (Chỉ hiển thị khi sidebar đóng) */}
        <img
          src={logoFull}
          alt="Samurai Icon"
          className={`h-30 w-30 transition-all duration-300
            ${isOpen ? 'w-0 opacity-0' : 'w-30 opacity-100'}
          `}
          style={{ overflow: 'hidden' }}
        />
      </div>
      {/* Thanh tìm kiếm */}
      <div className="relative hidden md:block flex-grow max-w-xl mx-auto"> {/* Ẩn trên mobile nhỏ */}
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
          <HiSearch className="w-5 h-5" />
        </span>
        <input 
          type="text"
          placeholder="Tìm kiếm"
          className="pl-12 pr-5 py-2 w-full rounded-full bg-gray-100 border border-transparent focus:bg-white focus:border-blue-300 outline-none transition-colors"
        />
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-5">
        <button 
          className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <HiOutlineBell className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
            {/* <img src="..." alt="Avatar" /> */}
          </div>
          <span className="font-semibold text-gray-700 whitespace-nowrap hidden sm:block">
            Nguyễn Bình Minh
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;