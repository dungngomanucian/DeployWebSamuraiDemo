import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/student/home/HomePage";
import StudentLogin from "./pages/student/home/StudentLogin";
import SignUpForm from "./pages/student/home/SignUpForm";
import ForgotPassword from "./pages/student/home/ForgotPassword";
import ResetPassword from "./pages/student/home/ResetPassword";
import PracticeJLPT from "./pages/student/practice/PracticeJLPT";
import PracticeEJU from "./pages/student/practice/PracticeEJU";
import MockExamJLPT from "./pages/student/exam/MockExamJLPT";
import PracticeByType from "./pages/student/practice/PracticeByType";
import PracticeLevelDetail from "./pages/student/practice/PracticeLevelDetail";
import ExamListPage from "./pages/student/exam/ExamListPage";
import ExamIntro from "./pages/student/exam/ExamIntro";
import ExamPage from "./pages/student/exam/ExamPage";
import StudentDashboard from "./pages/student/home/StudentDashboard";

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import ManageStudents from './pages/admin/student/Index';
import ManageAccounts from './pages/admin/account/Index';
import ManageTeachers from './pages/admin/teacher/Index';
import ManageJlptExams from './pages/admin/jlptExam/Index';
import ManageCourses from './pages/admin/course/Index';
import ManageClassrooms from './pages/admin/classroom/Index';
import ManageLevels from './pages/admin/level/Index';
import CreateStudentPage from "./pages/admin/student/Form";

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
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/register" element={<SignUpForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/exam-list" element={<ExamListPage />} />
          <Route path="/exam-intro" element={<ExamIntro />} />
          <Route path="/exam-start" element={<ExamPage />} />
          
          <Route path="/student-dashboard" element={<StudentDashboard />} />     

          
          {/* Cụm route dành cho Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Tự động chuyển /admin đến /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="students" element={<ManageStudents />} />
            <Route path="students/new" element={<CreateStudentPage />} />

            <Route path="accounts" element={<ManageAccounts />} />

            <Route path="teachers" element={<ManageTeachers />} />

            <Route path="jlpt-exams" element={<ManageJlptExams />} />

            <Route path="courses" element={<ManageCourses />} />
 
            <Route path="classrooms" element={< ManageClassrooms/>} />

            <Route path="levels" element={< ManageLevels/>} />
            <Route path="settings" element={<div>Trang Cài đặt</div>} />
          </Route>

          {/* (Tùy chọn) Thêm một route để xử lý các trang không tồn tại */}
          <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}