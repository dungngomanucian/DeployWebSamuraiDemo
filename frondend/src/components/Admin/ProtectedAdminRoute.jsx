import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext'; // Import hook quản lý auth admin

/**
 * Component dùng để bảo vệ các route chỉ dành cho admin.
 * Kiểm tra trạng thái đăng nhập từ AdminAuthContext.
 * Nếu chưa đăng nhập, chuyển hướng về trang login admin.
 */
const ProtectedAdminRoute = () => {
  // Lấy trạng thái đăng nhập từ context
  const { isAdminLoggedIn } = useAdminAuth();

  // Kiểm tra trạng thái
  if (!isAdminLoggedIn) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login admin
    // `replace` sẽ thay thế lịch sử trình duyệt, tránh user nhấn back quay lại trang admin
    return <Navigate to="/admin/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị các route con được bọc bên trong
  return <Outlet />; 
};

export default ProtectedAdminRoute;