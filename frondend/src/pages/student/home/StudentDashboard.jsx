import React, { useState } from "react";
import Sidebar from "../../../components/SideBar";
import TopBar from "../../../components/TopBar";
import OnboardingModal from "../../../components/OnboardingModal";
import Calendar from "../../../components/Calendar";

// =============================
// COMPONENT CON: Onboarding Modal, DashboardGrid
// =============================

const DashboardGrid = () => {
  // Đây là nơi bạn sẽ build các card từ Ảnh 4
  // Tôi sẽ tạo các placeholder
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
              <p className="text-6xl font-bold">43</p>
              <p className="text-l">ngày</p>
            </div>
          </div>

          {/* Tần suất học */}
          <Calendar />
          
          {/* Streak */}
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg mb-4"></div>
            <p className="text-gray-600">Bạn đang giữ Streak học liên tục <span className="font-bold text-blue-600">5 ngày</span>. Hãy cố gắng nhé!</p>
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
          <h2 className="text-xl font-bold">Nguyễn Bình Minh</h2>
          <p className="text-gray-500 text-sm mb-6">2501.SAMURAI.N2</p>

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
                <p className="text-3xl font-bold">98</p>
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
               <span className="font-semibold">12 hours</span>
             </div>
             {/* Item */}
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-gray-200 rounded"></div>
                 <span className="text-gray-600">Tổng số bài test đã làm</span>
               </div>
               <span className="font-semibold">12/30</span>
             </div>
             {/* Item */}
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-gray-200 rounded"></div>
                 <span className="text-gray-600">Tổng số đề luyện</span>
               </div>
               <span className="font-semibold">10/30</span>
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
  const [showOnboarding, setShowOnboarding] = useState(true); // Đặt là true để test modal
  const [activeLink, setActiveLink] = useState('OVERVIEW');

  const [currentAccountId, setCurrentAccountId] = useState('account35');

  return (
    <div className="flex min-h-screen bg-blue-50">
      {/* Modal sẽ hiển thị par-dessus mọi thứ */}
      <OnboardingModal 
        show={showOnboarding} 
        onHide={() => setShowOnboarding(false)} 
        accountId={currentAccountId}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        activeLink={activeLink} // <-- TRUYỀN PROPS
        setActiveLink={setActiveLink} // <-- TRUYỀN PROPS
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar 
          isOpen={isSidebarOpen} // <-- THÊM PROP 'isOpen'
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        {/* Nội dung Dashboard (Grid) */}
        <main className="flex-1 overflow-y-auto">
          <DashboardGrid />
        </main>
      </div>
    </div>
  );
}