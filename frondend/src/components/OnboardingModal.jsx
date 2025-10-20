import React, { useState, useEffect, useRef } from "react";

// Component con để bọc các step, tránh lặp code
const ModalCard = ({ children, onBackStep, onHide }) => (
  <div className={`
    bg-white p-8 rounded-4xl shadow-xl w-full max-w-lg text-center relative
    transition-all duration-300 ease-in-out
  `}>
    
    {/* Nút X: Luôn luôn onHide (đóng modal) */}
    <button 
      onClick={onHide}
      className="absolute top-4 right-3 text-gray-400 hover:text-gray-600"
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    {/* Nút Back (chỉ hiển thị từ step 2 trở đi) */}
    {onBackStep && (
      <button 
        onClick={onBackStep}
        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        aria-label="Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
    )}
    {children}
  </div>
);

// Thanh tiến trình
const ProgressBar = ({ step }) => {
  // Chúng ta có 4 bước sau khi "Sẵn sàng"
  // 1: Exam, 2: Goal, 3: Time, 4: Hours
  const widths = ['w-1/4', 'w-2/4', 'w-3/4', 'w-4/4'];
  const currentWidth = widths[step - 1] || 'w-1/4';

  return (
    <div className="mx-10 h-2 bg-gray-200 rounded-full mb-6">
      <div className={`h-2 bg-blue-600 rounded-full transition-all duration-300 ${currentWidth}`}></div>
    </div>
  );
};

// Component OnboardingModal chính
const OnboardingModal = ({ show, onHide }) => {
  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState('JLPT');
  const [goalLevel, setGoalLevel] = useState('N1');
  const [isVisible, setIsVisible] = useState(false);

  // SỬA: Thêm state cho animation NỘI DUNG
  const [contentVisible, setContentVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(null);
  const contentRef = useRef(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setIsVisible(true); // Fade-in backdrop
        setContentVisible(true); // Fade-in content
      }, 10);
    }
  }, [show]);

  useEffect(() => {
    if (contentVisible && contentRef.current) {
      // 1. Khi content hiện ra, đo chiều cao của nó
      const newHeight = contentRef.current.scrollHeight;
      setContentHeight(newHeight); // Set chiều cao
      isInitialLoad.current = false; // Đánh dấu không còn là lần đầu
    } else if (!contentVisible && !isInitialLoad.current) {
      setContentHeight(0);
    }
  }, [contentVisible, step]); // Chạy lại mỗi khi content (step) thay đổi

  const handleClose = () => {
    setContentVisible(false); // Fade-out content
    setIsVisible(false); // Fade-out backdrop
    setTimeout(() => {
      onHide();
    }, 300);
  };

  // SỬA: Hàm xử lý chuyển step mượt mà
  const handleStepChange = (newStep) => {
    setContentVisible(false); // 1. Bắt đầu fade-out
    setTimeout(() => {
      setStep(newStep); // 2. Đổi step
      setContentVisible(true); // 3. Bắt đầu fade-in
    }, 300); // Khớp với duration
  };


  if (!show) {
    return null;
  }

  // SỬA: Tách riêng content của step
  const renderStepContent = () => {
    switch (step) {
      // Bước 1: Welcome
      case 1:
        return (
          // SỬA: Thêm 'key' để React biết đây là element mới
          <div key="step1">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">Chào mừng bạn với Samurai!</h2>
            <p className="text-gray-600 mb-8">Hãy cùng đặt mục tiêu để Sam-chan support bạn trong học tập nhé!</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleClose}
                className="px-8 py-3 rounded-full text-blue-600 bg-gray-100 hover:bg-gray-200 font-semibold"
              >
                Để sau
              </button>
              <button 
                onClick={() => handleStepChange(2)} // SỬA: Dùng handleStepChange
                className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Sẵn sàng
              </button>
            </div>
          </div>
        );

      // Bước 2: Chọn kỳ thi
      case 2:
        return (
          <div key="step2">
            <ProgressBar step={1} />
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Sắp tới bạn sẽ tham dự kỳ thi nào:</h2>
            <div className="flex justify-center gap-6">
              <button 
                onClick={() => { setExamType('EJU'); handleStepChange(3); }} // SỬA
                className="flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
                <span className="text-2xl font-bold text-gray-700">EJU</span>
              </button>
              <button 
                onClick={() => { setExamType('JLPT'); handleStepChange(3); }} // SỬA
                className="flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 border-blue-500 bg-blue-50"
              >
                <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
                <span className="text-2xl font-bold text-blue-600">JLPT</span>
              </button>
            </div>
          </div>
        );

      // Bước 3: Mục tiêu
      case 3:
        return (
          <div key="step3">
            <ProgressBar step={2} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mục tiêu của bạn là</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-8">
            
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                <button 
                  key={level}
                  onClick={() => setGoalLevel(`JLPT ${level}`)}
                  
                  // SỬA TOÀN BỘ DÒNG CLASSNAME NÀY
                  className={`py-3 mx-1 rounded-xl font-semibold transition-all duration-200 ${
                    goalLevel === `JLPT ${level}` 
                      ? 'bg-blue-100 text-blue-700 shadow-lg shadow-blue-500/30 transform scale-105 border border-blue-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  // KẾT THÚC SỬA
                  
                >
                  JLPT {level}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handleStepChange(4)}
              className="px-10 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Tiếp theo
            </button>
          </div>
        );
        
      // Bước 4: Thời gian
      case 4:
        return (
          <div key="step4">
            <ProgressBar step={3} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thời gian bạn định thi:</h2>
            <div className="flex justify-center gap-4 mb-8">
              <select defaultValue="12" className="p-3 border rounded-lg bg-gray-50">
                <option value="7">Tháng 7</option>
                <option value="12">Tháng 12</option>
              </select>
              <select defaultValue="2025" className="p-3 border rounded-lg bg-gray-50">
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <button 
              onClick={() => handleStepChange(5)} // SỬA
              className="px-10 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Tiếp theo
            </button>
          </div>
        );
        
      // Bước 5: Thời gian học
      case 5:
        return (
          <div key="step5">
            <ProgressBar step={4} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Một ngày bạn có thể dành bao nhiêu thời gian học (giờ)</h2>
            <input type="text" placeholder="Ví dụ: 2" className="w-1/2 p-3 border rounded-lg text-center mb-8"/>
            <br/>
            <button 
              onClick={handleClose} // Hoàn thành
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
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center 
      bg-gray-900/50 backdrop-blur-sm
      transition-opacity duration-300 ease-in-out
      ${isVisible ? 'opacity-100' : 'opacity-0'}
    `}>
      <ModalCard 
        onHide={handleClose}
        onBackStep={step > 1 ? () => handleStepChange(step - 1) : null}
      >
        {/* SỬA: Div này animate chiều cao (height) */}
        <div 
          className="transition-[height] duration-300 ease-in-out overflow-hidden"
          style={{ height: contentHeight === null ? 'auto' : `${contentHeight}px` }} // Set chiều cao động
        >
          {/* SỬA: Div này animate độ mờ (opacity) và GẮN REF */}
          <div 
            ref={contentRef}
            className={`
              transition-opacity duration-300
              ${contentVisible ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {renderStepContent()}
          </div>
        </div>
      </ModalCard>
    </div>
  );
};

export default OnboardingModal;