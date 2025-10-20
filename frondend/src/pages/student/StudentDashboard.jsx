import React, { useState } from "react";
import Sidebar from "../../components/SideBar";
import TopBar from "../../components/TopBar";
import OnboardingModal from "../../components/OnboardingModal";

// =============================
// COMPONENT CON: Onboarding Modal
// =============================


// =============================
// COMPONENT CON: DashboardGrid (Nội dung chính - Ảnh 4)
// =============================
const DashboardGrid = () => {
  // Đây là nơi bạn sẽ build các card từ Ảnh 4
  // Tôi sẽ tạo các placeholder
  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Cột 1 & 2: Nội dung chính */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Countdown */}
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
            <p className="text-sm font-medium opacity-80">COUNTDOWN</p>
            <p className="text-6xl font-bold">43</p>
            <p className="text-lg">ngày</p>
          </div>
          {/* Tần suất học */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <p className="font-bold">TẦN SUẤT HỌC</p>
            {/* ... Thêm Lịch vào đây ... */}
            <p className="mt-4 text-sm text-gray-600">Calendar placeholder</p>
          </div>
        </div>
        
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
        
         <div className="bg-white p-6 rounded-xl shadow-md min-h-[300px]">
          {/* Placeholder cho card trống lớn ở dưới */}
        </div>
      </div>
      
      {/* Cột 3: Profile */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Streak */}
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg mb-4"></div>
          <p className="text-gray-600">Bạn đang giữ Streak học liên tục <span className="font-bold text-blue-600">5 ngày</span>. Hãy cố gắng nhé!</p>
        </div>
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mb-6">PROFILE HỌC VIÊN</button>
          <div className="w-32 h-32 bg-gray-300 mx-auto rounded-full mb-4"></div>
          <h2 className="text-xl font-bold">Nguyễn Bình Minh</h2>
          <p className="text-gray-500 text-sm mb-6">2501.SAMURAI.N2</p>

          <div className="flex justify-around mb-6">
            <div>
              <p className="text-gray-500 text-sm">Mục tiêu</p>
              <p className="text-3xl font-bold">130<span className="text-lg text-gray-400">/180</span></p>
            </div>
             <div>
              <p className="text-gray-500 text-sm">Latest Score</p>
              <p className="text-3xl font-bold">98<span className="text-lg text-gray-400">/180</span></p>
            </div>
          </div>
          
          <div className="text-left space-y-2 text-sm">
             <h4 className="font-semibold mb-3">Learning Summary</h4>
             <div className="flex justify-between"><span className="text-gray-600">Tổng thời lượng học</span> <span className="font-semibold">12 hours</span></div>
             <div className="flex justify-between"><span className="text-gray-600">Tổng số bài test đã làm</span> <span className="font-semibold">12/30</span></div>
             <div className="flex justify-between"><span className="text-gray-600">Tổng số đề luyện</span> <span className="font-semibold">10/30</span></div>
          </div>
          <a href="#" className="text-blue-600 text-sm mt-4 inline-block">Xem thêm</a>
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Modal sẽ hiển thị par-dessus mọi thứ */}
      <OnboardingModal 
        show={showOnboarding} 
        onHide={() => setShowOnboarding(false)} 
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