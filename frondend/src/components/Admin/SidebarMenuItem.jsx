// frontend/src/components/admin/SidebarMenuItem.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
// Không cần import useTheme

// *** NHẬN ĐÚNG PROPS: item, isSidebarOpen, currentTheme ***
export default function SidebarMenuItem({ item, isSidebarOpen, currentTheme }) {

  // Xác định theme sáng (phải khớp với AdminLayout)
  const LIGHT_THEME = 'winter'; 

  // *** CHỌN ICON TỪ item DỰA TRÊN currentTheme ***
  // Thêm optional chaining (?.) để phòng trường hợp item không có icon
  const currentIcon =  item.icon; 

  // Xử lý trường hợp không tìm thấy icon
  if (!currentIcon) {
      console.warn("SidebarMenuItem: Missing icon for item:", item);
      // Có thể trả về null hoặc một icon mặc định
      // return null; 
  }

  return (
    <li>
      <NavLink
        to={item.to} // Lấy 'to' từ item
        className={({ isActive }) =>
          `flex items-center gap-4 py-2 px-4 rounded-md transition-colors duration-200 hover:bg-base-300 ${
            !isSidebarOpen && 'justify-center' // Căn giữa khi đóng
          } ${
            isActive ? 'bg-primary text-primary-content font-semibold' : '' // Style active
          }`
        }
      >
        {/* Render icon đã chọn, thêm icon mặc định nếu currentIcon không có */}
        <i className={`${currentIcon} text-xl w-6 h-4`} /> 

        {/* Label (lấy từ item) */}
        <span className={`transition-opacity duration-200 ${!isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
          {item?.label || 'Missing Label'} {/* Thêm fallback cho label */}
        </span>
      </NavLink>
    </li>
  );
}