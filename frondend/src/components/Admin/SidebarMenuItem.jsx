// frontend/src/components/admin/SidebarMenuItem.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarMenuItem({ to, icon, label, isSidebarOpen }) {
  return (
    <li>
      <NavLink
        to={to}
        // 👇 Class này là quan trọng nhất để căn chỉnh
        className={({ isActive }) => 
          `flex items-center gap-4 py-2 px-4 rounded-md transition-colors duration-200 hover:bg-base-300 ${!isSidebarOpen && 'justify-center'} ${isActive ? 'bg-primary text-primary-content font-semibold' : ''}`
        }
      >
        {/* Icon */}
        <i className={`${icon} text-xl w-6 h-4`} /> 
        
        {/* Label */}
        <span className={`transition-opacity duration-200 ${!isSidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>{label}</span>
      </NavLink>
    </li>
  );
}