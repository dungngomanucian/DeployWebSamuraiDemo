import React, { useState } from "react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 w-full">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-24 py-4">
        {/* Logo bên trái */}
        <a href="/" className="flex items-center">
          <img
            src={logo}
            alt="Samurai Japanese"
            className="h-[50px] sm:h-[60px] w-auto object-contain"
          />
        </a>

        {/* Menu desktop - ẩn trên mobile */}
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-6 lg:gap-10 text-sm lg:text-base font-medium">
            <li>
              <a href="/" className={`${pathname === '/' ? 'text-[#4F46E5] font-semibold' : 'text-[#111827]'} cursor-pointer transition-all hover:text-[#4338CA]`}>
                Trang chủ
              </a>
            </li>
            <li>
              <a className="text-[#111827] hover:text-[#4F46E5] cursor-pointer transition-all">
                Học bài
              </a>
            </li>
            
                {/* START: ĐÃ SỬA VẤN ĐỀ DROPDOWN - SỬ DỤNG VÙNG ĐỆM */}
            <li className="relative group">
              <span className={`${pathname.startsWith('/practice') || pathname === '/mock-exam-jlpt' ? 'text-[#4F46E5] font-semibold' : 'text-[#111827]'} hover:text-[#4F46E5] cursor-pointer transition-all inline-block px-2 py-1`}>Luyện đề</span>
                
                {/* Thêm một vùng đệm (pt-2) vào dropdown container để giữ vùng hover */}
                {/* Vùng này có pt-2 (8px) tương ứng với khoảng cách top-[calc(100%+8px)] */}
              <div 
                    className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 
                                absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
                >
                    {/* Hộp dropdown thực tế */}
                    <div className="bg-white border rounded-lg shadow-xl py-2 w-48 whitespace-nowrap">
                        <a href="/practice-jlpt" className={`block px-4 py-2 text-base font-medium hover:bg-gray-100 ${pathname === '/practice-jlpt' ? 'text-[#4F46E5]' : 'text-[#111827]'}`}>Luyện thi JLPT</a>
                        <a href="/practice-eju" className={`block px-4 py-2 text-base font-medium hover:bg-gray-100 ${pathname === '/practice-eju' ? 'text-[#4F46E5]' : 'text-[#111827]'}`}>Luyện thi EJU</a>
                    </div>
              </div>
            </li>
                {/* END: ĐÃ SỬA VẤN ĐỀ DROPDOWN */}
                
            <li>
              <a className="text-[#111827] hover:text-[#4F46E5] cursor-pointer transition-all">
                Hồ sơ học viên
              </a>
            </li>
          </ul>
        </nav>

        {/* Nút đăng nhập - ẩn trên mobile */}
        <button className="hidden sm:block bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 lg:px-8 py-2.5 rounded-lg font-medium transition-all text-sm lg:text-base">
          Đăng nhập
        </button>

        {/* Mobile menu button */}
        <button 
          className="md:hidden btn btn-ghost btn-sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <a className="block text-[#4F46E5] font-semibold py-2">Trang chủ</a>
            <a className="block text-[#111827] hover:text-[#4F46E5] py-2">Học bài</a>
            <div className="py-2">
              <div className={`text-xs mb-1 ${pathname.startsWith('/practice') || pathname === '/mock-exam-jlpt' ? 'text-[#4F46E5] font-semibold' : 'text-gray-500'}`}>Luyện đề</div>
              <a href="/practice-jlpt" className="block text-[#111827] hover:text-[#4F46E5] py-2">Luyện thi JLPT</a>
              <a href="/practice-eju" className="block text-[#111827] hover:text-[#4F46E5] py-2">Luyện thi EJU</a>
            </div>
            <a className="block text-[#111827] hover:text-[#4F46E5] py-2">Hồ sơ học viên</a>
            <button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-lg font-medium transition-all">
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </header>
  );
}