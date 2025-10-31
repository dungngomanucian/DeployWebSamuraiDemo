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
            key={index}
            onClick={() => {
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
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }
            }}
            className={`w-10 h-10 text-sm font-semibold rounded transition-all ${
              isCurrent
                ? "bg-[#4169E1] text-white"
                : isAnswered
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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


