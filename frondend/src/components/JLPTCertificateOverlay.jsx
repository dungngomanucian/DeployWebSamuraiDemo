import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORT THÊM

// Component con để bọc card, giống OnboardingModal
const ModalCard = ({ children, onHide }) => (
  <div className={`
    bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center relative
    transition-all duration-300 ease-in-out mx-4 sm:mx-0
  `}>
    {/* Nút X */}
    <button
      onClick={onHide}
      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
      aria-label="Đóng"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    {children}
  </div>
);

// Component chính
const ExamCertificateOverlay = ({ show, onHide, resultData, examData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  
  const navigate = useNavigate(); // <-- 2. THÊM HOOK NAVIGATE

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setIsVisible(true); // Hiện backdrop
        setContentVisible(true); // Hiện card
      }, 10);
    } else {
      setContentVisible(false); // Mờ card trước
      setIsVisible(false); // Rồi mờ backdrop
    }
  }, [show]);

  // Đóng modal sau khi animation kết thúc
  const handleAnimationEnd = () => {
    if (!isVisible) {
      // (Không cần onHide() ở đây vì nó sẽ được gọi từ ExamPage)
    }
  };

  // --- Logic xử lý dữ liệu ---
  const examDate = resultData?.datetime ? new Date(resultData.datetime).toLocaleDateString('vi-VN') : 'N/A';
  const studentId = resultData?.student_id || 'N/A';
  // Tạm thời dùng studentId làm tên, bạn sẽ cần fetch tên đầy đủ sau
  const studentName = studentId;
  // Bỏ qua ngày sinh
  const level = examData?.exam?.level?.title || 'N/A';
  const totalScore = resultData?.sum_score ?? 'N/A';
  // Điểm đỗ, mặc định 180 nếu không có
  const examTotalScore = examData?.exam?.total_score || 180;
  const passingScore = examData?.exam?.request_score ?? 'N/A';
  const isPassed = (typeof totalScore === 'number' && typeof passingScore === 'number') ? totalScore >= passingScore : false;
  const resultText = isPassed
    ? (
        <>
          <span style={{fontFamily: 'UD Digi Kyokasho N-R'}}>
            合格
          </span>
          &nbsp;
          <span style={{fontFamily: 'Nunito'}}>
            (Đạt)
          </span>
        </>
      )
    : (
        <>
          <span style={{fontFamily: 'UD Digi Kyokasho N-R'}}>
            不合格
          </span>
          &nbsp;
          <span style={{fontFamily: 'Nunito'}}>
            (Chưa đạt)
          </span>
        </>
      );
  const resultColor = isPassed ? 'text-green-600' : 'text-red-600';

  const sectionScores = resultData?.section_scores || [];

  // === 3. TẠO HÀM XỬ LÝ NÚT MỚI ===
  const handleViewDetails = () => {
    const resultId = resultData?.id;
    if (resultId) {
      if (onHide) onHide(); // Đóng modal
      navigate(`/results/${resultId}`); // Điều hướng đến trang review
    } else {
      console.error("Certificate Overlay: Không tìm thấy resultData.id");
      alert("Không thể tải chi tiết bài làm, vui lòng thử lại.");
    }
  };

  if (!show && !isVisible) {
    return null; // Không render gì cả khi ẩn
  }

  return (
    // Lớp phủ (Overlay)
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-gray-900/60 backdrop-blur-sm
        transition-opacity duration-300 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onTransitionEnd={handleAnimationEnd} // Xử lý ẩn sau animation
    >
      {/* Card nội dung */}
      <div className={`transition-all duration-300 ${contentVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <ModalCard onHide={onHide}>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-2" style={{fontFamily: 'Nunito'}}>Kết quả bài thi</h2>
          <p className="text-sm text-gray-500 mb-6" style={{fontFamily: 'Nunito'}}>Đây là kết quả cho lần làm bài thi này của bạn.</p>

          <div className="border border-gray-300 rounded-lg p-4 sm:p-6 text-left space-y-3 mb-6 bg-gray-50" style={{fontFamily: 'Nunito'}}>
            {/* ... (Code hiển thị thông tin học viên giữ nguyên) ... */}
            <div className="flex flex-col sm:flex-row justify-between text-sm">
              <div className="mb-2 sm:mb-0">
                <span className="font-semibold text-gray-600">Ngày thi:</span>
                <span className="ml-2 text-gray-800">{examDate}</span>
              </div>
            </div>
            <div className="text-sm">
                <span className="font-semibold text-gray-600">Mã học viên:</span>
                <span className="ml-2 text-gray-800">{studentId}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-600">Họ và tên:</span>
              <span className="ml-2 text-gray-800">{studentName}</span>
            </div>
             <div className="text-sm">
              <span className="font-semibold text-gray-600">Cấp độ:</span>
              <span className="ml-2 text-gray-800 font-normal">{level}</span>
            </div>
          </div>

          {/* Phần điểm */}
          <div className="mb-6">
            {/* ... (Code hiển thị điểm từng phần giữ nguyên) ... */}
            {sectionScores.length > 0 && (
              <div className="mb-6 border-b pb-6">
                <p className="text-sm text-gray-600 mb-3 text-center font-bold" style={{fontFamily: 'Nunito'}}>Điểm theo từng phần</p>
                <div className="grid grid-cols-3 gap-3">
                  {sectionScores.map((sec) => (
                    <div key={sec.id} className="bg-gray-100 rounded-lg p-3 text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase">{sec.type || sec.id}</p>
                      <p className="text-xl font-bold text-gray-800">
                        {sec.score} / {sec.max_score}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ... (Code hiển thị điểm tổng và kết quả giữ nguyên) ... */}
            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1 font-bold" style={{fontFamily: 'Nunito'}}>Điểm tổng</p>
                <p className="text-4xl font-bold text-blue-700">{totalScore} / {examTotalScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 font-bold" style={{fontFamily: 'Nunito'}}>Kết quả</p>
                <p className={`text-2xl font-bold ${resultColor}`}>{resultText}</p>
                {typeof passingScore === 'number' && (
                  <p className="text-base text-gray-500" style={{fontFamily: 'Nunito'}}>(Điểm đỗ: {passingScore})</p>
                )}
              </div>
            </div>
          </div>

          {/* === 3. SỬA KHU VỰC NÚT BẤM === */}
          <div className="flex flex-col-reverse sm:flex-row justify-center gap-3" style={{fontFamily: 'Nunito'}}>
            {/* Nút OK (Đóng và về Dashboard) */}
            <button
              onClick={onHide}
              className="px-8 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-colors w-full sm:w-auto"
            >
              OK (Về Dashboard)
            </button>
            
            {/* Nút XEM CHI TIẾT (Mới) */}
            <button
              onClick={handleViewDetails}
              className="px-8 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors w-full sm:w-auto"
            >
              Xem chi tiết bài làm
            </button>
          </div>
          {/* =============================== */}

        </ModalCard>
      </div>
    </div>
  );
};

export default ExamCertificateOverlay;