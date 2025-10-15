import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các trang của bạn
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Admin/Dashboard/Dashboard"; // Trang admin chúng ta sẽ tạo

export default function App() {
  return (
    <div className="font-sans">
      <BrowserRouter>
        <Routes>
          {/* Đường dẫn 1: Trang chủ cho user */}
          <Route path="/" element={<HomePage />} />

          {/* Đường dẫn 2: Trang Dashboard cho admin */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          
          {/* Thêm các đường dẫn khác ở đây */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}