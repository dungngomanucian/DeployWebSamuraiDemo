import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import TopBar from "../components/TopBar";

// =============================
// COMPONENT CON: Onboarding Modal (Ảnh 1, 2, 3)
// =============================
const OnboardingModal = ({ show, onHide }) => {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Exam Type, 3: Goal Setting
  
  // Dữ liệu cho việc thiết lập mục tiêu
  const [examType, setExamType] = useState('JLPT');
  const [goalLevel, setGoalLevel] = useState('N1');

  if (!show) {
    return null;
  }

  // Nút đóng "X" chung
  const CloseButton = ({ onStep }) => (
    <button 
      onClick={() => onStep ? setStep(onStep) : onHide()}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  // Nội dung cho từng bước
  const renderStep = () => {
    switch (step) {
      // Bước 1: Welcome (Ảnh 1 - image_462d84.png)
      case 1:
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            <CloseButton onStep={null} />
            <h2 className="text-3xl font-bold text-blue-600 mb-4">Chào mừng bạn với Samurai!</h2>
            <p className="text-gray-600 mb-8">Hãy cùng đặt mục tiêu để Sam-chan support bạn trong học tập nhé!</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={onHide} 
                className="px-8 py-3 rounded-full text-blue-600 bg-gray-100 hover:bg-gray-200 font-semibold"
              >
                Để sau
              </button>
              <button 
                onClick={() => setStep(2)} 
                className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Sẵn sàng
              </button>
            </div>
          </div>
        );

      // Bước 2: Chọn kỳ thi (Ảnh 2 - image_462d45.png)
      case 2:
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {/* Thanh tiến trình */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div className="w-1/3 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <CloseButton onStep={1} />
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Sắp tới bạn sẽ tham dự kỳ thi nào:</h2>
            <div className="flex justify-center gap-6">
              <button 
                onClick={() => { setExamType('EJU'); setStep(3); }} 
                className="flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
                <span className="text-2xl font-bold text-gray-700">EJU</span>
              </button>
              <button 
                onClick={() => { setExamType('JLPT'); setStep(3); }} 
                className="flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 border-blue-500 bg-blue-50"
              >
                <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
                <span className="text-2xl font-bold text-blue-600">JLPT</span>
              </button>
            </div>
          </div>
        );

      // Bước 3: Đặt mục tiêu (Ảnh 3 - image_462d24.png)
      // Gộp 3 phần của Ảnh 3 vào 1 modal cho đơn giản
      case 3:
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {/* Thanh tiến trình */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div className="w-2/3 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <CloseButton onStep={2} />
            
            {/* Mục tiêu */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mục tiêu của bạn là</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                <button 
                  key={level}
                  onClick={() => setGoalLevel(`JLPT ${level}`)}
                  className={`px-5 py-2 rounded-full font-semibold ${goalLevel === `JLPT ${level}` ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  JLPT {level}
                </button>
              ))}
            </div>

            {/* Thời gian */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thời gian bạn định thi:</h2>
            <div className="flex justify-center gap-4 mb-8">
              <select defaultValue="12" className="p-3 border rounded-lg bg-gray-50">
                {/* Thêm các tháng */}
                <option value="12">Tháng 12</option>
              </select>
              <select defaultValue="2025" className="p-3 border rounded-lg bg-gray-50">
                {/* Thêm các năm */}
                <option value="2025">2025</option>
              </select>
            </div>
            
            {/* Thời gian học */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Một ngày bạn có thể dành bao nhiêu thời gian học</h2>
            <input type="text" placeholder="Ví dụ: 2 giờ" className="w-1/2 p-3 border rounded-lg text-center mb-8"/>

            <br/>
            <button 
              onClick={onHide} // Hoàn thành
              className="px-10 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Hoàn thành
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // Lớp phủ (Overlay)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      {renderStep()}
    </div>
  );
};

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