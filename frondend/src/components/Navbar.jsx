import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
// SỬA LỖI: Sử dụng Default Import (hoặc Named Import tùy phiên bản)
// Trong môi trường hiện đại, thường sử dụng Named Import nếu thư viện hỗ trợ
// Nếu lỗi, hãy thử lại: import jwtDecode from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { User, LogOut } from "lucide-react"; // Bỏ Notebook icon, dùng emoji

export default function Navbar({ showNotepadButton = false, onNotepadClick, noteCount = 0 }) { // 🌟 THÊM PROPS noteCount
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate(); // Sử dụng hook điều hướng

  // 1. State để lưu trạng thái đăng nhập và thông tin user
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);

  const closeMobileMenu = () => setIsMenuOpen(false);

  // Hàm giải mã và lấy thông tin user từ token
  const getAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Sử dụng jwtDecode
        const decoded = jwtDecode(token);
        let name = decoded.user_name ? decoded.user_name  :decoded.email.split('@')[0];
        setIsLoggedIn(true);
        setUserName(name); 
      } catch (error) {
        // Token hết hạn hoặc không hợp lệ
        console.warn("Token không hợp lệ hoặc hết hạn. Đang đăng xuất tự động.", error);
        handleLogout(); 
      }
    } else {
      setIsLoggedIn(false);
      setUserName(null);
    }
  };
  // 2. Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setUserName(null);
    closeMobileMenu();
    // Điều hướng về trang chủ hoặc trang đăng nhập
    navigate('/login'); 
  };
  // 3. useEffect để kiểm tra trạng thái đăng nhập khi component được mount
  useEffect(() => {
    getAuthStatus();
    // Thêm listener để cập nhật trạng thái nếu token thay đổi ở tab khác
    window.addEventListener('storage', getAuthStatus); 
    return () => {
        window.removeEventListener('storage', getAuthStatus);
    };
  }, []);
  // Hàm tùy chỉnh cho NavLink
  const getNavLinkClass = ({ isActive }) => 
    `cursor-pointer transition-all hover:text-[#4338CA] ${isActive ? 'text-[#4F46E5] font-semibold' : 'text-[#111827]'}`;
  // Hàm tùy chỉnh cho Link (dùng cho mobile menu)
  const getMobileNavLinkClass = (path) => 
    `block py-2 ${pathname === path ? 'text-[#4F46E5] font-semibold' : 'text-[#111827] hover:text-[#4F46E5]'}`;


  return (
    <header className="bg-white shadow-sm border-b border-gray-100 w-full sticky top-0 z-50" style={{fontFamily: "Inter"}}>
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-24 py-4">
        
        {/* Logo bên trái */}
        <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            {/* ... Logo image ... */}
            <img
                src={logo}
                alt="Samurai Japanese"
                className="h-[50px] sm:h-[60px] w-auto object-contain"
            />
        </Link>

        {/* Menu desktop - ẩn trên mobile */}
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-6 lg:gap-10 text-sm lg:text-base font-medium">
            <li><NavLink to="/" className={getNavLinkClass}>Trang chủ</NavLink></li>
            <li><a className="text-[#111827] hover:text-[#4F46E5] cursor-pointer transition-all">Học bài</a></li>
            {/* ... (Luyện đề) ... */}
            <li className="relative group">
              <span className={`${pathname.startsWith('/practice') || pathname.startsWith('/mock-exam') || pathname.startsWith('/exam-') || pathname.startsWith('/listening') ? 'text-[#4F46E5] font-semibold' : 'text-[#111827]'} hover:text-[#4F46E5] cursor-pointer transition-all inline-block px-2 py-1`}>
                Luyện đề
              </span>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                <div className="bg-white border rounded-lg shadow-xl py-2 w-48 whitespace-nowrap">
                  <Link to="/practice-jlpt" className={`block px-4 py-2 text-base font-medium hover:bg-gray-100 ${pathname === '/practice-jlpt' ? 'text-[#4F46E5]' : 'text-[#111827]'}`}>Luyện thi JLPT</Link>
                  <Link to="/practice-eju" className={`block px-4 py-2 text-base font-medium hover:bg-gray-100 ${pathname === '/practice-eju' ? 'text-[#4F46E5]' : 'text-[#111827]'}`}>Luyện thi EJU</Link>
                </div>
              </div>
            </li>
            
            {/* Hồ sơ học viên (Hiển thị có điều kiện) */}
            {isLoggedIn && (
              <li>
                <NavLink 
                  to="/student-dashboard" 
                  className={getNavLinkClass}
                >
                  Hồ sơ học viên
                </NavLink>
              </li>
            )}

          </ul>
        </nav>

        {/* 4. Vùng hiển thị ĐĂNG NHẬP / AVATAR (DESKTOP) */}
        <div className="hidden sm:flex items-center space-x-4">
          {/* 🌟 NÚT NOTEPAD (DESKTOP) 🌟 */}
          {showNotepadButton && (
            <button
              onClick={onNotepadClick}
              className="px-4 py-2 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-semibold hover:bg-[#5427B4] hover:text-white transition-all relative text-sm"
              style={{ fontFamily: "Nunito" }}
              aria-label="Mở Notepad"
            >
              📝 Notepad
              {noteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{noteCount}</span>
              )}
            </button>
          )}

          {isLoggedIn ? (
            // TRẠNG THÁI 1: ĐÃ ĐĂNG NHẬP (Avatar/Username - Ảnh 2)
            <div className="flex items-center space-x-2 relative group cursor-pointer">
                {/* Avatar icon */}
                <User size={28} className="text-gray-600 border border-gray-300 rounded-full p-1" />
                <span className="font-semibold text-gray-800 text-base">{userName}</span>
                
                {/* Dropdown Menu (Logout) */}
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute right-0 top-full pt-2 z-50">
                    <div className="bg-white border rounded-lg shadow-xl py-2 w-40 whitespace-nowrap">
                        <Link to="/student-dashboard" className="flex items-center px-4 py-2 text-base font-medium text-[#111827] hover:bg-gray-100">
                           <User size={18} className="mr-2"/> Hồ sơ
                        </Link>
                        {/* Nút Đăng xuất trong Dropdown */}
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 border-t mt-1 pt-1">
                           <LogOut size={18} className="mr-2"/> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
          ) : (
            // TRẠNG THÁI 2: CHƯA ĐĂNG NHẬP (Nút Đăng nhập - Ảnh 1)
            <Link 
              to="/login" 
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 lg:px-8 py-2.5 rounded-lg font-medium transition-all text-sm lg:text-base"
            >
              Đăng nhập
            </Link>
          )}
        </div>

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
            <NavLink to="/" onClick={closeMobileMenu} className={getMobileNavLinkClass('/')}>Trang chủ</NavLink>
            <a onClick={closeMobileMenu} className="block text-[#111827] hover:text-[#4F46E5] py-2">Học bài</a>
            <div className="py-2">
              <div className={`text-xs mb-1 ${pathname.startsWith('/practice') || pathname.startsWith('/mock-exam') || pathname.startsWith('/exam-') || pathname.startsWith('/listening') ? 'text-[#4F46E5] font-semibold' : 'text-gray-500'}`}>Luyện đề</div>
              <Link to="/practice-jlpt" onClick={closeMobileMenu} className="block text-[#111827] hover:text-[#4F46E5] py-2">Luyện thi JLPT</Link>
              <Link to="/practice-eju" onClick={closeMobileMenu} className="block text-[#111827] hover:text-[#4F46E5] py-2">Luyện thi EJU</Link>
            </div>
            
            {/* 🌟 NÚT NOTEPAD (MOBILE) 🌟 */}
            {showNotepadButton && (
                <button onClick={() => { onNotepadClick(); closeMobileMenu(); }} className="w-full flex items-center justify-start text-[#111827] hover:text-[#4F46E5] py-2 font-medium relative">
                    <span className="mr-3">📝</span> Notepad
                    {noteCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{noteCount}</span>
                    )}
                </button>
            )}

            {/* Mobile: Hồ sơ và Đăng xuất */}
            {isLoggedIn && (
              <NavLink to="/student-dashboard" onClick={closeMobileMenu} className={getMobileNavLinkClass('/student-dashboard')}>Hồ sơ học viên</NavLink>
            )}

            {/* Mobile: Nút Đăng nhập/Đăng xuất */}
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                <LogOut size={20} className="mr-2"/> Đăng xuất ({userName})
              </button>
            ) : (
              <Link 
                to="/login"
                onClick={closeMobileMenu} 
                className="w-full block text-center bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}