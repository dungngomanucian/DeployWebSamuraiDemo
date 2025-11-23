// src/components/Exam/QuestionButtons.jsx (ĐÃ SỬA VỚI isReviewMode)
import React from "react";

export default function QuestionButtons({
  isReviewMode = false, // <-- NHẬN PROP MỚI
  tab,
  groupedQuestions,
  activeQuestionType,
  currentQuestionIndex,
  currentQuestionPage,
  studentAnswers,
  answerOrder,
  handleQuestionTypeChange,
  setCurrentQuestionIndex,
  setCurrentQuestionPage,
  containerId
}) {
  return (
    <div id={containerId} className="flex gap-2 overflow-x-auto">
      {Array.from({ length: tab.questionCount }, (_, index) => {
        const question = groupedQuestions[tab.id]?.questions[index];
        const isAnswered = question
          ? groupedQuestions[question.questionTypeId]?.type?.is_Sort_Question === true
            ? (answerOrder[question.id] && answerOrder[question.id].length > 0)
            : studentAnswers[question.id]
          : false;

        // Xác định trang/index hiện tại
        const tabQuestions = groupedQuestions[tab.id]?.questions || [];
        const shouldUsePagination =
          tabQuestions.length > 0 &&
          groupedQuestions[tab.id]?.type?.duration &&
          (tabQuestions[0].passage || tabQuestions[0].jlpt_question_passages);
        
        const isCurrent =
          tab.id === activeQuestionType &&
          (shouldUsePagination ? index === currentQuestionPage : index === currentQuestionIndex);

        // === LOGIC MÀU SẮC LINH HOẠT ===
        let buttonStyle = ""; 

        if (isCurrent) {
            buttonStyle = "bg-[#4169E1] text-white"; // Đang xem (Luôn ưu tiên)
        
        } else if (isReviewMode) {
            // === CHẾ ĐỘ REVIEW (Đỏ / Xanh lá / Xám) ===
            let isCorrect = false;
            let isAnswered = false;

            if (question) {
              // Lấy ID lựa chọn của học sinh (từ state đã set 1 lần)
              const studentChoiceId = studentAnswers[question.id]; 

              // Logic cho câu sắp xếp (QT007)
              if (question.questionTypeId === "QT007") {
                const studentOrder = answerOrder[question.id] || [];
                isAnswered = studentOrder.length > 0;
                
                // (Cần logic check đúng/sai cho câu sắp xếp từ backend)
                // Tạm thời, nếu đã trả lời thì là màu xanh lá
                buttonStyle = isAnswered 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300";
              } else {
                // Logic cho câu trắc nghiệm (phổ biến)
                isAnswered = !!studentChoiceId;
                
                // Tìm đáp án đúng từ DỮ LIỆU ĐỀ THI GỐC (chứa trong groupedQuestions)
                const correctAnswer = question.answers.find(a => a.is_correct === true);
                
                if (isAnswered) {
                    if (correctAnswer && studentChoiceId === correctAnswer.id) {
                        isCorrect = true;
                        buttonStyle = "bg-green-500 text-white"; // TRẢ LỜI ĐÚNG
                    } else {
                        buttonStyle = "bg-red-500 text-white"; // TRẢ LỜI SAI
                    }
                } else {
                   buttonStyle = "bg-gray-200 text-gray-700 hover:bg-gray-300"; // CHƯA TRẢ LỜI
                }
              }
            } else {
              buttonStyle = "bg-gray-200 text-gray-700 hover:bg-gray-300"; // Lỗi (không có question data)
            }
        
        } else {
            // === CHẾ ĐỘ LÀM BÀI (Xanh lá / Xám) ===
            const isAnswered = question
              ? question.questionTypeId === "QT007"
                ? (answerOrder[question.id] && answerOrder[question.id].length > 0)
                : studentAnswers[question.id]
              : false;
            
            buttonStyle = isAnswered 
              ? "bg-green-500 text-white" // ĐÃ TRẢ LỜI
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"; // CHƯA TRẢ LỜI
        }
        // === KẾT THÚC LOGIC MÀU SẮC ===

        return (
          <button
            type="button"
            key={index}
            onClick={(e) => {
              e.preventDefault();
              if (tab.id !== activeQuestionType) {
                handleQuestionTypeChange(tab.id);
              }

              // (Logic scroll/chuyển trang giữ nguyên)
              if (shouldUsePagination) {
                setCurrentQuestionPage(index);
              } else {
                setCurrentQuestionIndex(index);
                setTimeout(() => {
                  const el = document.getElementById(`question-${question?.id}`);
                  if (el) {
                    // Scroll với offset để tránh bị che bởi sticky header
                    const yOffset = -150; // Offset để tránh sticky header và có khoảng trống phía trên
                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, 100);
              }
            }}
            className={`w-10 h-10 text-sm font-semibold rounded transition-all ${
              isCurrent
                ? "bg-gray-400 text-gray-700"
                : isAnswered
                ? "bg-[#4169E1] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            style={{fontFamily: "Inter"}}
          >
            {question?.position || index + 1}
          </button>
        );
      })}
    </div>
  );
}