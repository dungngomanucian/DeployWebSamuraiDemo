import React, { useState, useEffect, useRef } from 'react';
import QuestionButtons from './QuestionButtons';

export default function ExamQuestionTypeTabs({
  isReviewMode,
  examData,
  reviewSections, // <-- SỬA 1: NHẬN PROP MỚI
  questionTypeTabs,
  activeSection,
  activeQuestionType,
  groupedQuestions,
  studentAnswers,
  answerOrder,
  currentQuestionIndex,
  currentQuestionPage,
  
  handleQuestionTypeChange,
  handleSectionChange,
  setCurrentQuestionIndex,
  setCurrentQuestionPage,

  expandedQuestionType,
}) {

  const [barWidths, setBarWidths] = useState({});
  const [collapsedTabWidths, setCollapsedTabWidths] = useState({});
  const [expandedTabWidths, setExpandedTabWidths] = useState({});
  const tabContainerRefs = useRef({});

  useEffect(() => {
    const expandedTabs = Object.values(expandedQuestionType).filter(Boolean);
    if (expandedTabs.length > 0) {
      setTimeout(() => {
        expandedTabs.forEach(qtId => {
          const container = document.getElementById(`question-buttons-${activeSection}-${qtId}`);
          if (container) {
            const buttons = container.querySelectorAll('button');
            if (buttons.length > 0) {
              const firstButton = buttons[0];
              const lastButton = buttons[buttons.length - 1];
              const firstRect = firstButton.getBoundingClientRect();
              const lastRect = lastButton.getBoundingClientRect();
              const width = lastRect.right - firstRect.left;
              setBarWidths(prev => ({ ...prev, [qtId]: width }));
            }
          }
        });
      }, 0);
    }
  }, [expandedQuestionType, groupedQuestions, activeSection]);

  useEffect(() => {
    if (examData && Object.keys(groupedQuestions).length > 0) {
      const newWidths = {};
      Object.keys(groupedQuestions).forEach(qtId => {
        const questionCount = groupedQuestions[qtId]?.questions?.length || 0;
        const estimatedWidth = questionCount > 0 ? (40 * questionCount + 8 * (questionCount - 1)) : 120;
        newWidths[qtId] = estimatedWidth;
      });
      setBarWidths(newWidths);
    }
  }, [examData, groupedQuestions]);

  useEffect(() => {
    if (examData && Object.keys(expandedQuestionType).length > 0) {
      setTimeout(() => {
        const newCollapsedWidths = {};
        const newExpandedWidths = {};
        
        // Dùng mảng sections chính xác (giống như onClick)
        const sectionsToSearch = isReviewMode ? reviewSections : examData?.sections;
        if (!sectionsToSearch) return;

        sectionsToSearch.forEach(section => {
          const sectionType = section.type;
          if (sectionType !== activeSection) return;

          const expandedQtId = expandedQuestionType[sectionType];
          const containerRef = tabContainerRefs.current[sectionType];
          
          if (expandedQtId && containerRef && section.question_types) { // Thêm check
            const containerWidth = containerRef.offsetWidth;
            const expandedTabBarWidth = barWidths[expandedQtId] || 0;
            const totalTabs = section.question_types.length;
            const collapsedTabCount = totalTabs - 1;
            
            if (collapsedTabCount > 0) {
              const gapWidth = 16;
              const totalGaps = (totalTabs - 1) * gapWidth;
              const minCollapsedWidth = 80;
              const spaceForExpanded = containerWidth - totalGaps - (minCollapsedWidth * collapsedTabCount);
              const expandedWidth = Math.min(expandedTabBarWidth + 40, spaceForExpanded);
              const remainingSpace = containerWidth - expandedWidth - totalGaps;
              const collapsedWidth = remainingSpace / collapsedTabCount;
              const finalCollapsedWidth = Math.max(Math.min(collapsedWidth, 150), 70);
              
              newExpandedWidths[sectionType] = expandedWidth;
              newCollapsedWidths[sectionType] = finalCollapsedWidth;
            } else {
              newExpandedWidths[sectionType] = containerWidth;
              newCollapsedWidths[sectionType] = 0;
            }
          }
        });
        
        setExpandedTabWidths(newExpandedWidths);
        setCollapsedTabWidths(newCollapsedWidths);
      }, 0);
    }
  }, [expandedQuestionType, barWidths, examData, reviewSections, activeSection, isReviewMode]); // Thêm dependencies


  if (!questionTypeTabs || questionTypeTabs.length === 0) {
    return null;
  }
  
  const isExpanded = !!expandedQuestionType[activeSection]; 
  
  return (
    <div 
      ref={(el) => tabContainerRefs.current[activeSection] = el}
      className={`${isExpanded ? 'flex' : 'grid'} gap-4 w-full`}
      style={!isExpanded ? { gridTemplateColumns: `repeat(${questionTypeTabs.length}, 1fr)` } : {}}
    >
      {questionTypeTabs.map((tab) => {
        const answeredCount = Array.from({ length: tab.questionCount }, (_, index) => {
          const question = groupedQuestions[tab.id]?.questions[index];
          return question ? (
            groupedQuestions[question.questionTypeId]?.type?.is_Sort_Question === true
              ? (answerOrder[question.id] && answerOrder[question.id].length > 0)
              : studentAnswers[question.id]
          ) : false;
        }).filter(Boolean).length;

        const isActive = expandedQuestionType[activeSection] === tab.id;
        const currentSectionExpanded = expandedQuestionType[activeSection];

        return (
          <div 
            key={tab.id} 
            className={`flex flex-col transition-all ${
              currentSectionExpanded 
                ? 'flex-shrink-0' 
                : ''
            }`}
            style={
              currentSectionExpanded 
                ? (isActive 
                    ? { width: expandedTabWidths[activeSection] ? `${expandedTabWidths[activeSection]}px` : 'auto' } 
                    : { width: `${collapsedTabWidths[activeSection] || 150}px` }
                  )
                : {}
            }
          >
            <div className="flex flex-col items-center">
              {!isActive && (
                <div 
                  className="h-0.5 bg-gray-300 mb-2 transition-all" 
                  style={{ 
                    width: currentSectionExpanded 
                      ? `${Math.min((collapsedTabWidths[activeSection] || 150) * 0.7, 100)}px`
                      : '100%'
                  }}
                ></div>
              )}
              
               <button
                 type="button"
                 onClick={(e) => {
                   e.preventDefault();
                   
                   // === SỬA 2: DÙNG MẢNG SECTIONS CHÍNH XÁC ===
                   const sectionsToSearch = isReviewMode ? reviewSections : examData?.sections;
                   if (!sectionsToSearch) return; // Thoát nếu data chưa sẵn sàng

                   const targetSection = sectionsToSearch.find(section => 
                     section.question_types && // Thêm check an toàn
                     section.question_types.some(qt => qt.id === tab.id)
                   );
                   // === KẾT THÚC SỬA ===
                   
                   if (targetSection && targetSection.type !== activeSection) {
                     handleSectionChange(targetSection.type, tab.id);
                     return;
                   }
                   
                   handleQuestionTypeChange(tab.id);
                 
                 }}
                className={`text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "text-[#4169E1]"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{fontFamily: "Inter"}}
              >
                 <span
                   title={(tab?.question_guides?.name || tab.taskInstructions || tab.name) || ''}
                   className={`${
                     currentSectionExpanded 
                       ? 'truncate' 
                       : ''
                   } inline-block align-middle`}
                   style={{
                     fontWeight: "bold",
                     maxWidth: currentSectionExpanded 
                       ? (isActive 
                           ? '280px' 
                           : `${Math.min((collapsedTabWidths[activeSection] || 150) * 0.9, 140)}px`)
                       : 'none'
                   }}
                 >
                   {tab?.question_guides?.name || tab.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || tab.name}
                 </span> {answeredCount}/{tab.questionCount}
              </button>
              
              {isActive && (
                <>
                  <div 
                    className="h-0.5 bg-[#4169E1] mt-2 mb-3"
                    style={{ width: barWidths[tab.id] || '100%' }}
                  ></div>
                  <QuestionButtons
                    isReviewMode={isReviewMode}
                    tab={tab}
                    groupedQuestions={groupedQuestions}
                    activeQuestionType={activeQuestionType}
                    currentQuestionIndex={currentQuestionIndex}
                    currentQuestionPage={currentQuestionPage}
                    studentAnswers={studentAnswers}
                    answerOrder={answerOrder}
                    handleQuestionTypeChange={handleQuestionTypeChange}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    setCurrentQuestionPage={setCurrentQuestionPage}
                    containerId={`question-buttons-${activeSection}-${tab.id}`} 
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}