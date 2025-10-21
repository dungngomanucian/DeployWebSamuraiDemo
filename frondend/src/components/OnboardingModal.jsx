import React, { useState, useEffect, useRef } from "react";
import { updateOnboardingData } from "../api/studentDashboardService";

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
const OnboardingModal = ({ show, onHide, accountId }) => {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    target_exam: 'JLPT',
    target_jlpt_degree: 'N1',
    target_date: '', // Lưu ngày đầy đủ 'YYYY-MM-DD'
    hour_per_day: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


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
    setContentVisible(false);
    setIsVisible(false);
    setTimeout(() => {
      onHide();
      // Reset về step 1 khi đóng
      setTimeout(() => {
        setStep(1);
        // Reset cả form
        setFormData({
            target_exam: 'JLPT',
            target_jlpt_degree: 'N1',
            target_date: '',
            hour_per_day: '',
        });
      }, 200);
    }, 300);
  };

  const handleStepChange = (newStep) => {
    setErrorMessage(''); // Xóa lỗi cũ khi chuyển step
    setContentVisible(false);
    setTimeout(() => {
      setStep(newStep);
      setContentVisible(true);
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý riêng cho input số giờ (chỉ cho phép số)
    if (name === 'hour_per_day') {
        const val = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        setFormData(prev => ({ ...prev, [name]: val }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // === CẬP NHẬT: Thêm hàm `handleSubmit` ===
  // Hàm này sẽ gọi API khi nhấn "Hoàn thành"
  const handleSubmit = async () => {
    if (isLoading) return;
    
    // 1. Validation (Giữ nguyên)
    if (!formData.target_date) {
        setErrorMessage("Vui lòng chọn ngày thi mục tiêu.");
        handleStepChange(4);
        return;
    }
    if (!formData.hour_per_day || isNaN(parseFloat(formData.hour_per_day)) || parseFloat(formData.hour_per_day) < 0.5) {
        setErrorMessage("Vui lòng nhập số giờ học hợp lệ (ít nhất 0.5 giờ).");
        return;
    }

    // 2. Bắt đầu gọi API
    setIsLoading(true);
    setErrorMessage('');

    // Dữ liệu sẽ gửi lên backend (khớp với Serializer)
    const dataToSend = {
        account_id: accountId, // Lấy từ props
        target_exam: formData.target_exam,
        target_jlpt_degree: formData.target_jlpt_degree,
        target_date: formData.target_date,
        hour_per_day: parseFloat(formData.hour_per_day),
    };
    
    // Nếu thi EJU, không gửi target_jlpt_degree
    if (dataToSend.target_exam === 'EJU') {
      dataToSend.target_jlpt_degree = null;
    }

    console.log("Đang gửi dữ liệu qua Service:", dataToSend);
    const { data, error } = await updateOnboardingData(dataToSend);
    
    if (error) {
      // Thất bại: Service đã xử lý lỗi, chúng ta chỉ cần hiển thị
      console.error("Lỗi từ service:", error);
      setErrorMessage(error);
    } else {
      // Thành công!
      console.log("Cập nhật thành công!", data);
      handleClose(); // Đóng modal
    }
    setIsLoading(false);
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
                onClick={() => { 
                    handleChange({ target: { name: 'target_exam', value: 'EJU' } });
                    handleStepChange(4); // Bỏ qua Step 3 nếu là EJU
                }}
                className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50
                    ${formData.target_exam === 'EJU' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
                <span className="text-2xl font-bold text-gray-700">EJU</span>
              </button>
              <button 
                onClick={() => { 
                    handleChange({ target: { name: 'target_exam', value: 'JLPT' } });
                    handleStepChange(3); 
                }}
                className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50
                    ${formData.target_exam === 'JLPT' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
                <span className="text-2xl font-bold text-blue-600">JLPT</span>
              </button>
            </div>
          </div>
        );

      // Bước 3: Mục tiêu
      case 3:
        // === CẬP NHẬT: Tự động nhảy bước nếu không phải JLPT ===
        if (formData.target_exam !== 'JLPT') {
            // Dùng useEffect để tránh lỗi "Cannot update a component while rendering a different component"
            useEffect(() => {
                handleStepChange(4);
            }, []);
            return null; // Không render gì cả
        }
        return (
          <div key="step3">
            <ProgressBar step={2} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mục tiêu của bạn là</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-8">
            
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                <button 
                  key={level}
                  // === CẬP NHẬT: Cập nhật state ===
                  onClick={() => handleChange({ target: { name: 'target_jlpt_degree', value: level } })}
                  // Cập nhật className để check state
                  className={`py-3 mx-1 rounded-xl font-semibold transition-all duration-200 ${
                    formData.target_jlpt_degree === level 
                      ? 'bg-blue-100 text-blue-700 shadow-lg shadow-blue-500/30 transform scale-105 border border-blue-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
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
            <div className="flex justify-center mb-8">
              {/* Bỏ 2 <select>, thay bằng 1 <input type="date"> */}
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                // Lấy ngày hôm nay làm mốc tối thiểu
                min={new Date().toISOString().split("T")[0]}
                className="p-3 border rounded-lg bg-gray-50 text-lg w-3/4 text-center"
              />
            </div>
            {/* Hiển thị lỗi nếu có (ví dụ khi nhấn Hoàn thành mà chưa chọn) */}
            {errorMessage && step === 4 && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
            <button 
              onClick={() => handleStepChange(5)}
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
            {/* Cập nhật input để kết nối với state */}
            <input 
                type="text" 
                name="hour_per_day"
                placeholder="Ví dụ: 1.5 (cho 1 tiếng 30 phút)" 
                value={formData.hour_per_day}
                onChange={handleChange}
                className="w-3/4 p-3 border rounded-lg text-center mb-4 text-lg"
            />
            
            {/* Hiển thị lỗi (nếu có) */}
            {errorMessage && step === 5 && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}

            {/* Cập nhật button để gọi handleSubmit */}
            <button 
              onClick={handleSubmit} // THAY ĐỔI: từ handleClose thành handleSubmit
              disabled={isLoading} // Thêm disabled khi đang load
              className={`px-10 py-3 rounded-full font-semibold w-3/4
                ${isLoading 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
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
        onBackStep={step > 1 ? () => handleStepChange(
            (step === 4 && formData.target_exam === 'EJU') ? 2 : step - 1
        ) : null}
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