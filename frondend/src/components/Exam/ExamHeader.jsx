import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bold } from 'lucide-react';
import ExamQuestionTypeTabs from './ExamQuestionTypeTabs'; 

export default function ExamHeader({
  isSticky = false,
  isReviewMode = false,
  examData,
  reviewSections,
  activeSection,
  activeQuestionType,
  questionTypeTabs,
  groupedQuestions,
  studentAnswers,
  answerOrder,
  currentQuestionIndex,
  currentQuestionPage,
  isSubmitting,
  expandedQuestionType,
  
  onSectionChange,
  onQuestionTypeChange,
  onSubmitExam,
  setCurrentQuestionIndex,
  setCurrentQuestionPage,

  TimerProgressBarComponent, 
  
  showSectionTabs = true, 
  titleInFirstRow = false, 
  stickyBackButton = false, 
  autoSubmitCountdownDisplay = null,
  annotations,
  onNotepadOpen,
}) {
  const navigate = useNavigate();
  const sectionsToRender = isReviewMode ? reviewSections : examData?.sections;

  const NotepadButton = ({ className = '' }) => {
    const noteCount = annotations?.filter(a => a.type === 'note').length || 0;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          if (onNotepadOpen) onNotepadOpen();
        }}
        className={`px-4 py-2 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-semibold hover:bg-[#5427B4] hover:text-white transition-all relative text-sm ${className}`}
        style={{ fontFamily: "Nunito" }}
      >
        📝 Notepad
        {noteCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {noteCount}
          </span>
        )}
      </button>
    );
  };

  const headerContent = (
    <>
      <div className={`flex items-center justify-between gap-4 ${isSticky ? 'mb-4' : ''}`}>
        {isSticky ? (
          <>
            {/* === BÊN TRÁI (STICKY) === */}
            {isReviewMode ? (
              <button
                type="button"
                style={{ fontFamily: "Nunito" }}
                onClick={(e) => { e.preventDefault(); navigate(-1); }}
                className="px-4 h-8 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-semibold hover:bg-[#5427B4] hover:text-white transition-all text-sm flex items-center w-24 justify-center"
              >
                Quay lại
              </button>
            ) : (
              stickyBackButton ? (
                <button
                  type="button"
                  style={{ fontFamily: "Nunito" }}
                  onClick={(e) => { e.preventDefault(); navigate(-1); }}
                  className="px-4 h-8 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-semibold hover:bg-[#5427B4] hover:text-white transition-all text-sm flex items-center"
                >
                  Quay lại
                </button>
              ) : (
                TimerProgressBarComponent && <TimerProgressBarComponent />
              )
            )}
            
            {/* === Ở GIỮA (STICKY) === */}
            {stickyBackButton ? (
              <div className="flex-1 flex justify-center">
                {!isReviewMode && TimerProgressBarComponent && <TimerProgressBarComponent />}
              </div>
            ) : showSectionTabs ? (
              <div className="flex items-center justify-center gap-2 flex-1">
                {sectionsToRender?.map((section) => (
                  <button
                    type="button"
                    style={{ fontFamily: "UD Digi Kyokasho N-R" }}
                    key={section.type}
                    onClick={(e) => { e.preventDefault(); onSectionChange(section.type); }}
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
            ) : null}
            
            {/* === BÊN PHẢI (STICKY) === */}
            {isReviewMode ? (
              <div className="w-24"></div> 
            ) : (
              <div className="flex items-center gap-3">
                {autoSubmitCountdownDisplay && (
                  <span
                    className="text-sm font-semibold text-red-500 whitespace-nowrap"
                    style={{ fontFamily: 'Nunito' }}
                  >
                    Tự động nộp sau {autoSubmitCountdownDisplay}
                  </span>
                )}
                <NotepadButton className="h-8" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onSubmitExam(); }}
                  disabled={isSubmitting}
                  className="px-4 h-8 rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-all text-sm flex items-center"
                >
                  {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* === BÊN TRÁI (NON-STICKY) === */}
            <button
              type="button"
              style={{ fontFamily: "Nunito" }}
              onClick={(e) => { e.preventDefault(); navigate(-1); }}
              className="px-4 py-2 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-extrabold hover:bg-[#5427B4] hover:text-white transition-all"
            >
              Quay lại
            </button>

            {/* === Ở GIỮA (NON-STICKY) === */}
            {titleInFirstRow ? (
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#3563E9] leading-tight">
                  言語知識 {activeSection}
                </h1>
              </div>
            ) : showSectionTabs ? (
              <div className="hidden md:flex items-center gap-2">
                {sectionsToRender?.map((section) => (
                  <button
                    type="button"
                    style={{ fontFamily: "UD Digi Kyokasho N-R" }}
                    key={section.type}
                    onClick={(e) => { e.preventDefault(); onSectionChange(section.type); }}
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
            ) : null}

            {/* === BÊN PHẢI (NON-STICKY) === */}
            {isReviewMode ? (
              <div className="w-32"></div>
            ) : (
              <div className="flex items-center gap-3">
                {autoSubmitCountdownDisplay && (
                  <span
                    className="text-sm font-semibold text-red-500 whitespace-nowrap"
                    style={{ fontFamily: 'Nunito' }}
                  >
                    Tự động nộp sau {autoSubmitCountdownDisplay}
                  </span>
                )}
                <NotepadButton />
                <button
                  type="button"
                  style={{ fontFamily: "Nunito", font: Bold }}
                  onClick={(e) => { e.preventDefault(); onSubmitExam(); }}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg border-2 border-red-500 text-red-500 font-extrabold hover:bg-red-500 hover:text-white transition-all"
                >
                  {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {!isSticky && !titleInFirstRow && (
        <div className="mt-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#3563E9] leading-tight">
              言語知識 {activeSection}
            </h1>
          </div>
        </div>
      )}

      {!isSticky && !isReviewMode && (
        <div className="mt-4 flex justify-center">
          {TimerProgressBarComponent && <TimerProgressBarComponent />}
        </div>
      )}

      {questionTypeTabs.length > 0 && (
        <div className={`${isSticky ? 'mt-4' : 'mt-6'} w-full`}>
          <ExamQuestionTypeTabs
            isReviewMode={isReviewMode}
            examData={examData}
            reviewSections={reviewSections}
            questionTypeTabs={questionTypeTabs}
            activeSection={activeSection}
            activeQuestionType={activeQuestionType}
            groupedQuestions={groupedQuestions}
            studentAnswers={studentAnswers}
            answerOrder={answerOrder}
            currentQuestionIndex={currentQuestionIndex}
            currentQuestionPage={currentQuestionPage}
            expandedQuestionType={expandedQuestionType}
            handleQuestionTypeChange={onQuestionTypeChange}
            handleSectionChange={onSectionChange}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setCurrentQuestionPage={setCurrentQuestionPage}
          />
        </div>
      )}
    </>
  );

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