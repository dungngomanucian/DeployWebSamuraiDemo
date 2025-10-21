import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/student/home/HomePage";
import PracticeJLPT from "./pages/student/practice/PracticeJLPT";
import PracticeEJU from "./pages/student/practice/PracticeEJU";
import MockExamJLPT from "./pages/student/exam/MockExamJLPT";
import PracticeByType from "./pages/student/practice/PracticeByType";
import PracticeLevelDetail from "./pages/student/practice/PracticeLevelDetail";
import ExamListPage from "./pages/student/exam/ExamListPage";
import ExamIntro from "./pages/student/exam/ExamIntro";
import ExamPage from "./pages/student/exam/ExamPage";

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import ManageStudents from './pages/Admin/Student/Index';

export default function App() {
  return (
    <BrowserRouter>
      <div className="font-sans">
        <Routes>
          {/* Định nghĩa các đường dẫn và component tương ứng */}
          <Route path="/" element={<HomePage />} />
          <Route path="/practice-jlpt" element={<PracticeJLPT />} />
          <Route path="/practice-eju" element={<PracticeEJU />} />
          <Route path="/mock-exam-jlpt" element={<MockExamJLPT />} />
          <Route path="/practice-by-type" element={<PracticeByType />} />
          <Route path="/practice-level-detail" element={<PracticeLevelDetail />} />
          <Route path="/exam-list" element={<ExamListPage />} />
          <Route path="/exam-intro" element={<ExamIntro />} />
          <Route path="/exam-start" element={<ExamPage />} />
          
          {/* Cụm route dành cho Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Tự động chuyển /admin đến /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="courses" element={<div>Trang quản lý khóa học</div>} />
            <Route path="settings" element={<div>Trang Cài đặt</div>} />
          </Route>

          {/* (Tùy chọn) Thêm một route để xử lý các trang không tồn tại */}
          <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}