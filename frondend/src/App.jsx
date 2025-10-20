import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import PracticeJLPT from "./pages/PracticeJLPT";
import PracticeEJU from "./pages/PracticeEJU";
import MockExamJLPT from "./pages/MockExamJLPT";
import PracticeByType from "./pages/PracticeByType";
import PracticeLevelDetail from "./pages/PracticeLevelDetail";
import HomePage from "./pages/HomePage";
import StudentDashboard from "./pages/student/StudentDashboard";

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
          
          <Route path="/student-dashboard" element={<StudentDashboard />} />


          
          {/* (Tùy chọn) Thêm một route để xử lý các trang không tồn tại */}
          <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}