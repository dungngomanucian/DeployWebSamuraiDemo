// frontend/src/components/admin/SidebarMenuItem.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarMenuItem({ to, icon: IconComponent, label, isSidebarOpen }) {
  return (
    <li>
      <NavLink
        to={to}
        className={`flex gap-4 ${!isSidebarOpen && 'justify-center'}`}
      >
        <IconComponent className="w-6 h-6" />
        <span className={!isSidebarOpen ? 'hidden' : ''}>{label}</span>
      </NavLink>
    </li>
  );
}