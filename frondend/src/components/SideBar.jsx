import React from 'react';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineBookOpen,
  HiOutlinePencilAlt,
  HiOutlineCollection,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineHome,
} from 'react-icons/hi';

import logoFull from '../assets/Logo Samurai (chữ ngang).png';
// logoIcon sẽ được dùng bên TopBar

// Component con cho từng mục menu (KHÔNG THAY ĐỔI)
const NavItem = ({ icon, text, active = false, isOpen, onClick }) => (
  <a
    href="#"
    onClick={onClick} 
    className={`flex items-center gap-4 h-12 my-1 rounded-lg cursor-pointer group transition-colors
      ${active ? 'bg-blue-100' : 'text-gray-600 hover:bg-gray-100'}
      px-2
    `}
  >
    {/* Icon: Có nền xanh đậm và icon trắng khi active */}
    <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors
      ${active 
         ? 'bg-blue-600 text-white' 
         : 'text-gray-500 group-hover:text-gray-600'}
    `}>
      {icon}
    </span>
    
    {/* Text: Trượt vào/ra, có màu xanh và đậm khi active */}
    <span
      className={`whitespace-nowrap transition-all duration-200
        ${active ? 'text-blue-700 font-semibold' : ''} 
        ${isOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}
      `}
      style={{ overflow: 'hidden' }} // Ẩn text khi co lại
    >
      {text}
    </span>
  </a>
);

// Component Sidebar chính
const Sidebar = ({ isOpen, activeLink, setActiveLink }) => { 
  return (
    <div
      className={`bg-white h-screen flex flex-col transition-all duration-300 ease-in-out sticky top-0 left-0 z-20
        ${isOpen ? 'w-50 p-4' : 'w-16 px-2 py-4'}
      `}
      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Logo Section */}
      <div className={`flex items-center justify-center mb-1/4 h-14 transition-all duration-300 overflow-hidden py-2`}> {/* <-- SỬA Ở ĐÂY: Tăng h-16 (64px) lên h-20 (80px) */}
        <img
          src={logoFull}
          alt="Samurai Japanese"
          className={`object-contain transition-all duration-300
            ${isOpen ? 'h-40 opacity-100' : 'h-0 opacity-0'}
          `}
        />
      </div>

      {/* Navigation chính */}
      <nav className="flex-1 flex flex-col gap-1">
        <NavItem 
          icon={<HiOutlineViewGrid className="w-5 h-5" />} 
          text="OVERVIEW" 
          isOpen={isOpen}
          active={activeLink === 'OVERVIEW'} 
          onClick={() => setActiveLink('OVERVIEW')} 
        />
        <NavItem 
          icon={<HiOutlineClipboardList className="w-5 h-5" />} 
          text="BTVN" 
          isOpen={isOpen}
          active={activeLink === 'BTVN'}
          onClick={() => setActiveLink('BTVN')}
        />
        <NavItem 
          icon={<HiOutlineBookOpen className="w-5 h-5" />} 
          text="HỌC BÀI" 
          isOpen={isOpen}
          active={activeLink === 'HOCBAI'}
          onClick={() => setActiveLink('HOCBAI')}
        />
        <NavItem 
          icon={<HiOutlinePencilAlt className="w-5 h-5" />} 
          text="LUYỆN ĐỀ" 
          isOpen={isOpen}
          active={activeLink === 'LUYENDE'}
          onClick={() => setActiveLink('LUYENDE')}
        />
        <NavItem 
          icon={<HiOutlineCollection className="w-5 h-5" />} 
          text="FLASHCARD" 
          isOpen={isOpen}
          active={activeLink === 'FLASHCARD'}
          onClick={() => setActiveLink('FLASHCARD')}
        />
        <NavItem 
          icon={<HiOutlineUser className="w-5 h-5" />} 
          text="PROFILE" 
          isOpen={isOpen}
          active={activeLink === 'PROFILE'}
          onClick={() => setActiveLink('PROFILE')}
        />
      </nav>

      {/* Navigation phụ (dưới cùng) */}
      <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-gray-100">
        <NavItem 
          icon={<HiOutlineCog className="w-5 h-5" />} 
          text="SETTINGS" 
          isOpen={isOpen}
          active={activeLink === 'SETTINGS'}
          onClick={() => setActiveLink('SETTINGS')}
        />
        <NavItem 
          icon={<HiOutlineHome className="w-5 h-5" />} 
          text="TRANG CHỦ" 
          isOpen={isOpen}
          active={activeLink === 'TRANGCHU'}
          onClick={() => setActiveLink('TRANGCHU')}
        />
      </div>
    </div>
  );
};

export default Sidebar;