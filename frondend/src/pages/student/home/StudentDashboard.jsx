import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import TopBar from "../../../components/TopBar";
import OnboardingModal from "../../../components/OnboardingModal";
import Calendar from "../../../components/Calendar";
import PracticeSummary from "../../../components/PracticeSummary";

import DashboardGrid from "../../../components/DashboardGrid";
import ProfilePage from "../../../components/ProfilePage";

import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from "react-router-dom";

import { getStudentProfile, getDashboardGridData } from "../../../api/studentDashboardService";

// =============================
// COMPONENT CON: Onboarding Modal, DashboardGrid
// =============================

// =============================
// COMPONENT CHÍNH: DashboardPage
// =============================

export default function StudentDashboardPage() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeLink, setActiveLink] = useState('OVERVIEW');
  
  const [currentAccountId, setCurrentAccountId] = useState(null);
  
  const [profileData, setProfileData] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLinkClick = (link) => {
    if (link === 'TRANGCHU') {
      navigate('/'); // Điều hướng về trang chủ
      return;
    }
    
    setActiveLink(link);
    // Nếu màn hình nhỏ hơn lg, đóng sidebar
    if (window.innerWidth < 1024) { 
      setIsSidebarOpen(false);
    }
  };

  const fetchAllData = async () => {
    console.log("Đang gọi API cho:", currentAccountId);
    setIsLoading(true); // Bắt đầu loading

    const [profileResponse, gridResponse] = await Promise.all([
      getStudentProfile(currentAccountId),
      getDashboardGridData(currentAccountId)
    ]);
    
    if (profileResponse.data) {
      setProfileData(profileResponse.data);
    } else {
      console.error("Lỗi khi lấy profile:", profileResponse.error);
    }

    if (gridResponse.data) {
      setGridData(gridResponse.data);
      // Logic hiện modal (giữ nguyên)
      if (!gridResponse.data.target_date) { 
        setShowOnboarding(true); 
      } else {
        setShowOnboarding(false);
      }
    } else {
      console.error("Lỗi khi lấy grid data:", gridResponse.error);
      setShowOnboarding(true); 
    }
    
    setIsLoading(false); // Kết thúc loading
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      // Nếu không có token, "đá" về trang login
      console.error("Chưa đăng nhập. Đang chuyển về trang login...");
      navigate('/login'); // (Hoặc path trang login của bạn)
      return; 
    }

    try {
      // Dùng jwt-decode để "mở khóa" token
      const decodedToken = jwtDecode(token);

      // Lấy 'id' từ bên trong (payload của backend có 'id')
      const accountId = decodedToken.id; 

      if (accountId) {
        // Tìm thấy ID -> Set state để trigger useEffect 2
        setCurrentAccountId(accountId);
      } else {
        // Token hợp lệ nhưng không có 'id'
        console.error("Token không hợp lệ (thiếu ID). Đang đăng xuất...");
        localStorage.removeItem('auth_token');
        navigate('/login');
      }

    } catch (error) {
      // Lỗi (Token hết hạn hoặc bị sửa) -> Đăng xuất
      console.error("Token hết hạn hoặc không hợp lệ. Đang đăng xuất...", error);
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Chỉ fetch data NẾU currentAccountId đã được set (không còn là null)
    if (currentAccountId) {
      fetchAllData(); 
    }
  }, [currentAccountId]);

  // === HÀM RENDER TRANG ===
  const renderActivePage = () => {
    switch (activeLink) {
      case 'OVERVIEW':
        return <DashboardGrid gridData={gridData} isLoading={isLoading} />;
      case 'PROFILE':
        // Truyền profileData xuống để ProfilePage hiển thị tên/ảnh
        return <ProfilePage profileData={profileData} isLoading={isLoading} />;
      case 'BTVN':
        return <div className="p-8">Trang BTVN (đang xây dựng)...</div>;
      case 'HOCBAI':
        return <div className="p-8">Trang Học Bài (đang xây dựng)...</div>;
      case 'LUYENDE':
        return <div className="p-8">Trang Luyện Đề (đang xây dựng)...</div>;
      case 'FLASHCARD':
        return <div className="p-8">Trang Flashcard (đang xây dựng)...</div>;
      case 'SETTINGS':
        return <div className="p-8">Trang Settings (đang xây dựng)...</div>;
      // TRANG CHỦ sẽ điều hướng đi, không render ở đây
      default:
        return <DashboardGrid gridData={gridData} isLoading={isLoading} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50 h-screen overflow-hidden">
      <OnboardingModal 
        show={showOnboarding} 
        onHide={() => setShowOnboarding(false)} 
        accountId={currentAccountId}
        onSuccess={fetchAllData}
      />

      {/* === BACKDROP CHO MOBILE MENU === */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <Sidebar 
        isOpen={isSidebarOpen}
        activeLink={activeLink}
        setActiveLink={handleLinkClick}
      />
      <div className="flex-1 flex flex-col">

        <main className="flex-1 overflow-y-auto">
        
        {/* === CẬP NHẬT TOPBAR === */}
          <TopBar 
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          profileData={profileData} // <-- Truyền data xuống
          isLoading={isLoading}   // <-- Truyền trạng thái loading
        />
        
          {renderActivePage()}

        </main>
      </div>
    </div>
  );
}