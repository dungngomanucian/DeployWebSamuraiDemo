import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import TopBar from "../../../components/TopBar";
import OnboardingModal from "../../../components/OnboardingModal";
import Calendar from "../../../components/Calendar";

import { getStudentProfile, getDashboardGridData } from "../../../api/studentDashboardService";
// =============================
// COMPONENT CON: Onboarding Modal, DashboardGrid
// =============================

const DashboardGrid = ({ gridData, isLoading }) => {
  // === LOGIC COUNTDOWN ===
  let countdownDays = 0;
  if (gridData && gridData.target_date) {
    const targetDate = new Date(gridData.target_date);
    const today = new Date();
    // Bỏ qua phần giờ, chỉ tính ngày
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate - today;
    countdownDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  // Hiển thị loading nếu chưa có data
  if (isLoading) {
    return <div className="p-8">Đang tải dữ liệu dashboard...</div>;
  }

  // Hiển thị nếu có lỗi (gridData là null)
  if (!gridData) {
     return <div className="p-8 text-red-500">Không thể tải dữ liệu dashboard.</div>;
  }
  
  //build các card (Nếu có data, render)
  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Cột 1 & 2: Nội dung chính */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-6">
          
          {/* Countdown */}
          <div className="relative w-35">
            
            {/* 2. Header "tab" */}
            <div className="absolute top-0 left-0 w-full bg-blue-800 text-white px-3 py-2 rounded-t-xl z-1 text-center shadow-md">
              <p className="text-base font-bold uppercase tracking-wider">COUNTDOWN</p>
            </div>
            
            {/* 3. Body (Khối 43 ngày) */}
            <div className="relative w-10/12 mx-auto bg-blue-600 text-white pt-10 pb-3 px-5 rounded-b-xl text-center border-5 border-white shadow-lg">
              <p className="text-6xl font-bold">{countdownDays > 0 ? countdownDays : '0'}</p>
              <p className="text-l">ngày</p>
            </div>
          </div>

          {/* Tần suất học */}
          <Calendar />
          
          {/* Streak */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg mb-4"></div>
            <p className="text-gray-600">Bạn đang giữ Streak học liên tục <span className="font-bold text-blue-600">{gridData.streak_day || 0} ngày</span>. Hãy cố gắng nhé!</p>
          </div>

        </div>
        
        <div className="py-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BTVN */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">BTVN</h3>
            {/* ... Thêm nội dung BTVN ... */}
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p className="font-bold">Đã có BTVN buổi 20. Hãy lưu ý và làm đúng deadline nhé!</p>
              <p className="text-sm">Deadline: Thứ 2 ngày 24/11/2025</p>
            </div>
          </div>
          
          {/* HỌC BÀI */}
          <div className="bg-white p-6 rounded-xl shadow-md min-h-[200px]">
            <h3 className="text-xl font-bold mb-4">HỌC BÀI</h3>
          </div>          
        </div>
        
         <div className="bg-white p-6 rounded-xl shadow-md min-h-[300px]">
          {/* Placeholder cho card trống lớn ở dưới */}
        </div>
      </div>
      
      {/* Cột 3: Profile */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 pt-0 rounded-xl shadow-md border-black text-center">
          <div className="w-full bg-blue-600 text-white text-xl py-3 rounded-lg font-bold mb-6">PROFILE HỌC VIÊN</div>
          <div className="w-32 h-32 bg-gray-300 mx-auto rounded-full mb-4"></div>
          <h2 className="text-xl font-bold">{`${gridData.first_name} ${gridData.last_name}`}</h2>
          <p className="text-gray-500 text-sm mb-6">{gridData.id}</p>

          <div className="flex justify-around mb-6">
            {/* Mục tiêu */}
            <div className="flex flex-col items-center gap-2">
              <span className="bg-gray-200 text-gray-700 text-xm font-semibold px-2 py-1 rounded-full">Mục tiêu</span>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex flex-col justify-center items-center shadow-inner">
                <p className="text-3xl font-bold">130</p>
                <p className="text-sm text-gray-400">/180</p>
              </div>
            </div>
            {/* Latest Score */}
            <div className="flex flex-col items-center gap-2">
              <span className="bg-gray-200 text-gray-700 text-xm font-semibold px-2 py-1 rounded-full">Latest Score</span>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex flex-col justify-center items-center shadow-inner">
                <p className="text-3xl font-bold">{gridData.score_latest || 0}</p>
                <p className="text-sm text-gray-400">/180</p>
              </div>
            </div>
          </div>
          
          {/* SỬA 4: Cập nhật Learning Summary */}
          <div className="text-left space-y-3 text-sm">
             <div className="text-center mb-5">
              <span className="bg-gray-200 text-gray-700 text-xm font-semibold px-3 py-1 rounded-full">Learning Summary</span>
             </div>
             
             {/* Item */}
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-gray-200 rounded"></div>
                 <span className="text-gray-600">Tổng thời lượng học</span>
               </div>
               <span className="font-semibold">{gridData.total_exam_hour || 0} hours</span>
             </div>
             {/* Item */}
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-gray-200 rounded"></div>
                 <span className="text-gray-600">Tổng số bài test đã làm</span>
               </div>
               <span className="font-semibold">{gridData.total_test || 0}/30</span>
             </div>
             {/* Item */}
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-gray-200 rounded"></div>
                 <span className="text-gray-600">Tổng số đề luyện</span>
               </div>
               <span className="font-semibold">{gridData.total_exam || 0}/30</span>
             </div>
          </div>

          {/* SỬA 5: Cập nhật link "Xem thêm" */}
          <div className="flex justify-end mt-4">
            <a href="#" className="flex items-center gap-2 text-blue-600 text-sm font-medium">
              Xem thêm
              <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                {/* SVG for arrow */}
                <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

// =============================
// COMPONENT CHÍNH: DashboardPage
// =============================

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeLink, setActiveLink] = useState('OVERVIEW');
  
  const [currentAccountId, setCurrentAccountId] = useState('account35');
  
  const [profileData, setProfileData] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchAllData(); 
  }, [currentAccountId]);

  return (
    <div className="flex min-h-screen bg-blue-50">
      <OnboardingModal 
        show={showOnboarding} 
        onHide={() => setShowOnboarding(false)} 
        accountId={currentAccountId}
        onSuccess={fetchAllData}
      />
      <Sidebar 
        isOpen={isSidebarOpen}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
      />
      <div className="flex-1 flex flex-col">
        {/* === CẬP NHẬT TOPBAR === */}
        <TopBar 
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          profileData={profileData} // <-- Truyền data xuống
          isLoading={isLoading}   // <-- Truyền trạng thái loading
        />
        
        <main className="flex-1 overflow-y-auto">

          <DashboardGrid gridData={gridData} isLoading={isLoading} />

        </main>
      </div>
    </div>
  );
}