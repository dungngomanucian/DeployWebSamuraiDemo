// src/components/Exam/ExamHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bold } from 'lucide-react';
import ExamQuestionTypeTabs from './ExamQuestionTypeTabs'; // Import component tab

/**
 * Component Header (cho cả bản dính và bản thường)
 * - isSticky (boolean): Quyết định style render
 * - TimerProgressBarComponent (React.Component): Nhận component TimerProgressBar từ cha
 * - ...props: Nhận tất cả các state và hàm xử lý từ ExamPage
 */
export default function ExamHeader({
  // === Props trạng thái ===
  isSticky = false,
  examData,
  activeSection,
  activeQuestionType,
  questionTypeTabs,
  groupedQuestions,
  studentAnswers,
  answerOrder,
  currentQuestionIndex,
  currentQuestionPage,
  isSubmitting,
  
  // === Props sự kiện ===
  onSectionChange,
  onQuestionTypeChange,
  onSubmitExam,
  setCurrentQuestionIndex,
  setCurrentQuestionPage,

  // === Component Props ===
  TimerProgressBarComponent, // Nhận component TimerProgressBar từ cha
}) {
  const navigate = useNavigate();

  // JSX cho phần nội dung (sẽ được bọc bởi 1 trong 2 div dưới)
  const headerContent = (
    <>
      {/* HÀNG 1:
        - Bản thường: [Quay lại] [Tab Section] [Nộp bài]
        - Bản dính: [Timer] [Tab Section] [Nộp bài]
      */}
      <div className={`flex items-center justify-between gap-4 ${isSticky ? 'mb-4' : ''}`}>
        {isSticky ? (
          <>
            {/* 1. Progress Bar (Bản Sticky) */}
            {TimerProgressBarComponent && <TimerProgressBarComponent />}
            
            {/* 2. Section Tabs (Bản Sticky) */}
            <div className="flex items-center justify-center gap-2 flex-1">
              {examData?.sections?.map((section) => (
                <button
                  style={{ fontFamily: "UD Digi Kyokasho N-R" }}
                  key={section.type}
                  onClick={() => onSectionChange(section.type)}
                  className={`h-8 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer flex items-center ${
                    section.type === activeSection
                      ? "bg-[#4169E1] text-white border-[#4169E1]"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:border-[#4169E1]"
                  }`}
                >
                  {section.type}
                </button>
              ))}
            </div>
            
            {/* 3. Submit Button (Bản Sticky) */}
            <button
              onClick={onSubmitExam}
              disabled={isSubmitting}
              className="px-4 h-8 rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-all text-sm flex items-center"
            >
              {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </>
        ) : (
          <>
            {/* 1. Nút Quay lại (Bản Thường) */}
            <button
              style={{ fontFamily: "Nunito" }}
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-extrabold hover:bg-[#5427B4] hover:text-white transition-all"
            >
              Quay lại
            </button>

            {/* 2. Section Tabs (Bản Thường) */}
            <div className="hidden md:flex items-center gap-2">
              {examData?.sections?.map((section) => (
                <button
                  style={{ fontFamily: "UD Digi Kyokasho N-R" }}
                  key={section.type}
                  onClick={() => onSectionChange(section.type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    section.type === activeSection
                      ? "bg-[#4169E1] text-white border-[#4169E1]"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:border-[#4169E1]"
                  }`}
                >
                  {section.type}
                </button>
              ))}
            </div>

            {/* 3. Submit Button (Bản Thường) */}
            <div className="flex items-center gap-3">
              <button
                style={{ fontFamily: "Nunito", font: Bold }}
                onClick={onSubmitExam}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg border-2 border-red-500 text-red-500 font-extrabold hover:bg-red-500 hover:text-white transition-all"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* HÀNG 2: Tiêu đề (Chỉ cho bản Thường)
      */}
      {!isSticky && (
        <div className="mt-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#3563E9] leading-tight">
              言語知識 {activeSection}
            </h1>
          </div>
        </div>
      )}

      {/* HÀNG 3: Timer (Chỉ cho bản Thường)
      */}
      {!isSticky && (
        <div className="mt-4 flex justify-center">
          {TimerProgressBarComponent && <TimerProgressBarComponent />}
        </div>
      )}

      {/* HÀNG 4: Thanh Tabs câu hỏi (Chung cho cả hai)
      */}
      {questionTypeTabs.length > 0 && (
        <div className={`${isSticky ? 'mt-4' : 'mt-6'} w-full`}>
          <ExamQuestionTypeTabs
            examData={examData}
            questionTypeTabs={questionTypeTabs}
            activeSection={activeSection}
            activeQuestionType={activeQuestionType}
            groupedQuestions={groupedQuestions}
            studentAnswers={studentAnswers}
            answerOrder={answerOrder}
            currentQuestionIndex={currentQuestionIndex}
            currentQuestionPage={currentQuestionPage}
            handleQuestionTypeChange={onQuestionTypeChange}
            handleSectionChange={onSectionChange}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setCurrentQuestionPage={setCurrentQuestionPage}
          />
        </div>
      )}
    </>
  );

  // Render dựa trên isSticky
  if (isSticky) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 px-6 py-3" style={{ fontFamily: "Nunito" }}>
        <div className="max-w-7xl mx-auto">
          {headerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-5 mb-6 overflow-hidden">
      {headerContent}
    </div>
  );
}