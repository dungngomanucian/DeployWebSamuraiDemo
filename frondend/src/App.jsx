// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import ManageStudents from './pages/Admin/Student/Index';
// Import các trang khác nếu có
// import ManageStudents from './pages/admin/ManageStudents'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các route cho người dùng thông thường */}
        <Route path="/" element={<div>Trang chủ</div>} />

        {/* Cụm route dành cho Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Tự động chuyển /admin đến /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="courses" element={<div>Trang quản lý khóa học</div>} />
          <Route path="settings" element={<div>Trang Cài đặt</div>} />
        </Route>

        {/* Route cho trang 404 */}
        <Route path="*" element={<div>404 - Trang không tồn tại</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;