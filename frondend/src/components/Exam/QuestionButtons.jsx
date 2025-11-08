import React from "react";

export default function QuestionButtons({
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
          ? question.questionTypeId === "QT007"
            ? (answerOrder[question.id] && answerOrder[question.id].length > 0)
            : studentAnswers[question.id]
          : false;

        const tabQuestions = groupedQuestions[tab.id]?.questions || [];
        const shouldUsePagination =
          tabQuestions.length > 0 &&
          groupedQuestions[tab.id]?.type?.duration &&
          (tabQuestions[0].passage || tabQuestions[0].jlpt_question_passages);

        const isCurrent =
          tab.id === activeQuestionType &&
          (shouldUsePagination ? index === currentQuestionPage : index === currentQuestionIndex);

        return (
          <button
            type="button"
            key={index}
            onClick={(e) => {
              e.preventDefault();
              if (tab.id !== activeQuestionType) {
                handleQuestionTypeChange(tab.id);
              }

              const tabQuestionsLocal = groupedQuestions[tab.id]?.questions || [];
              const shouldUsePaginationLocal =
                tabQuestionsLocal.length > 0 &&
                groupedQuestions[tab.id]?.type?.duration &&
                (tabQuestionsLocal[0].passage || tabQuestionsLocal[0].jlpt_question_passages);

              if (shouldUsePaginationLocal) {
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


