import React, { useState } from 'react';
import { HiOutlineChartBar } from 'react-icons/hi';

// ... Component ScoreBox (Giữ nguyên, không cần dán lại) ...
const ScoreBox = ({ title, score, maxScore, isOverall = false, isLow = false, isLoading = false }) => {
  // ... code của ScoreBox vẫn như cũ ...
  // === Dữ liệu hiển thị (Giữ nguyên) ===
  const displayScore = isLoading ? '...' : (score ?? '-');
  const displayMax = isLoading ? '...' : (maxScore ?? '-');
  // ==================================

  const scoreClass = `text-4xl font-bold ${isLow ? 'text-red-500' : 'text-gray-900'}`;
  
  // === XỬ LÝ CLASS CHO BOX CHÍNH (Thay đổi ở đây) ===
  // Các lớp chung cho TẤT CẢ các box
  const commonBoxClasses = "rounded-xl px-4 pb-4 text-center flex flex-col justify-between min-h-[120px] border";
  
  // Lớp riêng tùy theo 'isOverall'
  const specificBoxClasses = isOverall 
    ? "bg-blue-50 border-blue-500"       // Box "Overall" có nền xanh, viền xanh
    : "bg-white border-0";        // Các box khác nền trắng, viền xám
    
  // Kết hợp 2 chuỗi class lại
  const boxClass = `${commonBoxClasses} ${specificBoxClasses}`;
  // ===================================================

  // === GIAO DIỆN ===
  return (
    // Áp dụng 'boxClass' đã được xử lý ở trên
    <div className={boxClass}>
      
      {/* 1. Tiêu đề (Giữ nguyên logic) */}
      {isOverall ? (
        <div className="text-base font-semibold text-blue-700 border-b border-blue-500 px-4 py-2 -mx-4">{title}</div>
      ) : (
        <div className="inline-block bg-blue-100 text-blue-700 rounded-lg px-4 py-2 text-base font-semibold border border-blue-500">
          {title}
        </div>
      )}

      {/* 2. Điểm số (Giữ nguyên logic) */}
      <div className="flex items-end justify-center gap-1 mt-2">
        <span className={scoreClass}>{displayScore}</span>
        {isLow && !isOverall && (
          <span className="text-red-500 text-xs" style={{ transform: 'translateY(-1px)' }}>▲</span>
        )}
      </div>
      
      {/* 3. Đường kẻ ngang (Giữ nguyên) */}
      <div className="w-full mx-auto border-t-2 border-gray-500 my-1.5"></div>
      
      {/* 4. Điểm tối đa (Giữ nguyên) */}
      <span className="text-gray-600 text-lg font-bold">{displayMax}</span>
    </div>
  );
};
// ======================================================


/**
 * Component chính cho card "Luyện đề"
 * === ĐÃ CẬP NHẬT RESPONSIVE HEADER ===
 */
const PracticeSummary = ({ practiceData, isLoading }) => {
  const [activeLevel, setActiveLevel] = useState('N1');
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const data = practiceData ? practiceData[activeLevel] : undefined;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      
      {/* === HEADER GỘP (ĐÃ THAY ĐỔI) === */}
      {/* - Thêm 'flex-wrap' để tự động xuống dòng khi chật
        - Thêm 'gap-y-4' để tạo khoảng cách khi xuống dòng
        - 'mb-5' (thay vì mb-4) để giữ khoảng cách với lưới điểm
      */}
      <div className="flex flex-wrap items-center justify-between gap-y-4 mb-5">
        
        {/* 1. Bên trái: Tiêu đề (Không đổi) */}
        <div className="flex items-center gap-2">
          <HiOutlineChartBar className="w-6 h-6 text-blue-600" />
          <h4 className="text-lg font-bold text-gray-800">Điểm thi trung bình JLPT</h4>
        </div>

        {/* 2. Bên phải: Gộp Tabs và Link "Chi tiết" */}
        {/* - Dùng 'justify-end' để nhóm này luôn dạt về bên phải
          - Thêm 'flex-wrap' để nếu nhóm này hẹp, link 'Chi tiết' cũng tự xuống dòng
        */}
        <div className="flex items-center flex-wrap justify-end gap-x-6 gap-y-4">
          
          {/* Các tab N1-N5 (ĐÃ DI CHUYỂN LÊN ĐÂY) */}
          {/* Bỏ 'mb-5' vì đã chuyển lên header */}
          <div className="flex items-center gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`w-10 h-10 py-1.5 rounded-full text-sm font-semibold transition-colors
                  ${activeLevel === level
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Link "Chi tiết" (ĐÃ DI CHUYỂN VÀO ĐÂY) */}
          <a href="#" className="text-sm font-medium text-blue-600">Chi tiết</a>
        </div>
      </div>
      {/* ================================== */}


      {/* Các tab N1-N5 (Chỗ này đã bị xóa và chuyển lên trên) */}
      {/* <div className="flex items-center gap-2 mb-5"> ... </div> */}

      {/* Lưới 5 cột điểm (Không đổi) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ScoreBox
          title="OVERALL"
          score={data?.overall}
          maxScore={data?.maxOverall}
          isOverall
          isLow={data?.overall < data?.request_score} 
          isLoading={isLoading}
        />
        
        {data?.sections ? (
          data.sections.map((sec) => (
            <ScoreBox
              key={sec.title}
              title={sec.title}
              score={sec.score}
              maxScore={sec.max}
              isLow={sec.isLow}
              isLoading={isLoading}
            />
          ))
        ) : (
          ['TVCH', 'NGỮ PHÁP', 'ĐỌC HIỂU', 'NGHE HIỂU'].map((title) => (
             <ScoreBox
              key={title}
              title={title}
              score={null}
              maxScore={null}
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PracticeSummary;