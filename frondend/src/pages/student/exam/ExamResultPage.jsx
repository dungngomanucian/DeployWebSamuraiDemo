import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import toast, { Toaster } from "react-hot-toast";

import { getExamResultDetail } from "../../../api/student/examResultService";

import {
  formatTime,
  renderPassageContent,
  renderFramedPassageBlocks,
  PassageBorderBox,
  Underline,
  formatAnswerText
} from "../../../components/Exam/ExamRenderUtils";

import ExamHeader from "../../../components/Exam/ExamHeader";

export default function ExamReviewPage() {
  const navigate = useNavigate();
  const { examResultId } = useParams();

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionType, setActiveQuestionType] = useState(null);
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [currentQuestionPage, setCurrentQuestionPage] = useState(0);
  const [openPassageQuestions, setOpenPassageQuestions] = useState({});
  const [expandedQuestionType, setExpandedQuestionType] = useState({});
  
  const [reviewSections, setReviewSections] = useState([]);
  const userSelectedSectionRef = useRef(false);
  const activeSectionRef = useRef(null);
  const passageQuestionRefs = useRef({});
  const nonStickyHeaderRef = useRef(null); 
  const [scrollOffset, setScrollOffset] = useState(180); 
  
  const [resultInfo, setResultInfo] = useState(null);
  
  const [studentAnswers, setStudentAnswers] = useState({});
  const [answerOrder, setAnswerOrder] = useState({});

  const getFilteredQuestions = () => {
    if (!activeQuestionType || !groupedQuestions[activeQuestionType]) return [];
    const questions = groupedQuestions[activeQuestionType].questions;
    const uniqueQuestions = questions.filter((question, index, self) => 
      index === self.findIndex(q => q.id === question.id)
    );
    return uniqueQuestions;
  };
  const filteredQuestions = getFilteredQuestions();
  const shouldUsePagination = filteredQuestions.length > 0 && 
    groupedQuestions[activeQuestionType]?.type?.duration &&
    (filteredQuestions[0].passage || filteredQuestions[0].jlpt_question_passages);
  const currentQuestion = shouldUsePagination ? 
    filteredQuestions[currentQuestionPage] : 
    (filteredQuestions[currentQuestionIndex] || null);
    
  const currentSectionData = examData?.sections.find(s => s.type === activeSection);
  const isListeningSection = currentSectionData?.is_listening === true;

  useEffect(() => {
    const loadExamReviewData = async () => {
      if (!examResultId) {
        toast.error("Không tìm thấy ID bài làm.");
        navigate("/");
        return;
      }
      setLoading(true);

      const { data, error } = await getExamResultDetail(examResultId);

      if (error) {
        console.error("Error loading exam review:", error);
        toast.error(`Không thể tải dữ liệu: ${error}`);
        navigate(-1);
        return;
      }
      
      setResultInfo(data.result_info);
      setExamData(data.exam_content.exam);
      setReviewSections(data.exam_content.sections || []);

      const grouped = {};
      const sAnswers = {};
      const aOrder = {};
      
      data.exam_content.sections.forEach((section) => {
        section.question_types.forEach((qt) => {
          if (!grouped[qt.id]) {
            grouped[qt.id] = {
              type: qt,
              questions: [],
              sectionType: section.type,
              sectionId: section.id
            };
          }
          
          qt.questions.forEach((q) => {
            const existingQuestion = grouped[qt.id].questions.find(existing => existing.id === q.id);
            if (!existingQuestion) {
              grouped[qt.id].questions.push({
                ...q,
                sectionType: section.type,
                sectionId: section.id,
                questionTypeId: qt.id,
                taskInstructions: qt.task_instructions,
              });
            }

            if (q.student_chosen_answer_id) {
              const qType = qt; // Sử dụng qt trực tiếp
              if (qType?.is_Sort_Question === true && Array.isArray(q.student_chosen_answer_id)) {
                 sAnswers[q.id] = q.student_chosen_answer_id;
                 aOrder[q.id] = q.student_chosen_answer_id;
              } else if (typeof q.student_chosen_answer_id === 'string') {
                 sAnswers[q.id] = q.student_chosen_answer_id;
              }
            }
          });
        });
      });
      
      setGroupedQuestions(grouped);
      setStudentAnswers(sAnswers);
      setAnswerOrder(aOrder);

      if (data.exam_content.sections && data.exam_content.sections.length > 0) {
        const firstSectionType = data.exam_content.sections[0].type;
        setActiveSection(firstSectionType);
        activeSectionRef.current = firstSectionType;
        const firstQuestionType = data.exam_content.sections[0].question_types?.[0];
        if (firstQuestionType) {
          setActiveQuestionType(firstQuestionType.id);
        }
      }
      setLoading(false);
    };

    loadExamReviewData();
  }, [examResultId, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowStickyProgress(scrollTop > 200);
      setHideHeader(scrollTop > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [openPassageQuestions]);

  useEffect(() => {
    if (showStickyProgress) {
      setScrollOffset(180);
    } else if (nonStickyHeaderRef.current) {
      const height = nonStickyHeaderRef.current.offsetHeight;
      setScrollOffset(height + 20); 
    }
  }, [showStickyProgress, examData, loading]);

  const isSortQuestion = (questionTypeId) => {
    if (!questionTypeId) return false;
    return groupedQuestions[questionTypeId]?.type?.is_Sort_Question === true;
  };
  const isPerforatedQuestion = (questionTypeId) => {
    if (!questionTypeId) return false;
    return groupedQuestions[questionTypeId]?.type?.is_perforated_question === true;
  };
  const togglePassageQuestion = (questionId) => {
    setOpenPassageQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  const getQuestionTypeTabs = () => {
    if (!activeSection || !examData) return [];
    const tabs = [];
    const sectionsToMap = reviewSections;
    
    sectionsToMap.forEach((section) => {
      if (section.type === activeSection) {
        section.question_types.forEach((qt) => {
          tabs.push({
            id: qt.id,
            name: qt.name || qt.id,
            taskInstructions: qt.task_instructions,
            questionCount: groupedQuestions[qt.id]?.questions.length || 0,
            question_guides: qt.question_guides
          });
        });
      }
    });
    return tabs;
  };
  const questionTypeTabs = getQuestionTypeTabs();

  const renderPassageQuestionPopover = (q) => {
    
    // BƯỚC 1: Lấy ID đáp án mà học sinh đã chọn (từ backend)
    const studentChoiceId = q.student_chosen_answer_id;

    return (
      <div className="absolute z-50 left-0 top-0 translate-y-9">
        <div className="shadow-lg rounded bg-white max-w-[85vw] w-[240px]">
          <div className="grid grid-cols-1">
            {(() => {
              const byOrder = new Map();
              (q.answers || []).forEach((a) => {
                const key = String(a.show_order);
                if (!byOrder.has(key)) byOrder.set(key, a);
              });
              const normalizedAnswers = Array.from(byOrder.values()).sort(
                (a, b) => Number(a.show_order) - Number(b.show_order)
              );
              return normalizedAnswers.map((ans) => {
                
                // === BƯỚC 2: LOGIC TÔ MÀU ĐÃ SỬA ===
                
                // 1. Đáp án này có đúng không? (Từ backend)
                const isCorrect = ans.is_correct === true;
                
                // 2. Học sinh có chọn đáp án này không?
                const isStudentChoice = (ans.id === studentChoiceId);
                
                // 3. Quyết định màu sắc
                let answerStyle = 'bg-white hover:bg-gray-50';
                if (isStudentChoice && isCorrect) {
                    answerStyle = "bg-green-100"; // Chọn đúng
                } else if (isStudentChoice && !isCorrect) {
                    answerStyle = "bg-red-100"; // Chọn sai
                } else if (isCorrect) {
                    answerStyle = "bg-green-100"; // Đáp án đúng (nhưng không chọn)
                }
                // === KẾT THÚC SỬA LOGIC ===

                return (
                  <button
                    key={ans.id}
                    type="button"
                    disabled 
                    className={`text-left w-full px-3 py-2.5 transition-colors cursor-not-allowed ${answerStyle}`}
                  >
                    <div className="flex items-start text-gray-900 leading-6">
                      <span className="whitespace-pre-wrap break-words">
                        {formatAnswerText(ans?.answer_text || ans?.content || '', q?.question_text || '', q?.questionTypeId || q?.question_type_id)}
                      </span>
                      {isCorrect && (
                        <span className="ml-auto text-green-600 font-bold">✓</span>
                      )}
                      {isStudentChoice && !isCorrect && (
                        <span className="ml-auto text-red-600 font-bold">✗</span>
                      )}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>
      </div>
    );
  }
  
  const handleSectionChange = (sectionType, questionTypeId = null) => {
    if (!examData) return;

    userSelectedSectionRef.current = true;
    activeSectionRef.current = sectionType;
    
    setActiveSection(sectionType);
    setCurrentQuestionIndex(0); 
    setCurrentQuestionPage(0);

    const newSection = reviewSections.find(s => s.type === sectionType); 
    
    if (newSection && newSection.question_types.length > 0) {
      let targetQuestionTypeId = null;
      
      if (questionTypeId) {
        const targetQuestionType = newSection.question_types.find(qt => qt.id === questionTypeId);
        if (targetQuestionType) {
          targetQuestionTypeId = questionTypeId;
        }
      }
      
      if (!targetQuestionTypeId) {
        targetQuestionTypeId = newSection.question_types[0].id;
      }

      setActiveQuestionType(targetQuestionTypeId);
      
      setExpandedQuestionType(prev => ({
          ...prev,
          [sectionType]: targetQuestionTypeId
      }));
    }
  };

  const handleQuestionTypeChange = (questionTypeId) => {
    if (!examData) return;
    
    const targetSection = reviewSections.find(section => 
      section.question_types.some(qt => qt.id === questionTypeId)
    );
    
    if (targetSection && targetSection.type !== activeSection) {
      userSelectedSectionRef.current = true;
      activeSectionRef.current = targetSection.type;
      handleSectionChange(targetSection.type, questionTypeId); 
      return;
    }
    
    if (targetSection && targetSection.type === activeSection) {
      setActiveQuestionType(questionTypeId);
      
      setExpandedQuestionType(prev => ({
        ...prev,
        [activeSection]: prev[activeSection] === questionTypeId ? null : questionTypeId
      }));
      
      setCurrentQuestionPage(0);
      setCurrentQuestionIndex(0);
    }
  };
  
  
  
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-[#0B1320]">Đang tải bài làm...</div>
      </div>
    );
  }

  if (!examData || (!currentQuestion && !isListeningSection) ) {
    if (!resultInfo) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
          <div className="text-2xl font-bold text-red-600">Không tìm thấy dữ liệu kết quả!</div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]" style={{fontFamily: "UD Digi Kyokasho N-B"}}>
      <div 
        className={`transition-transform duration-300 ${hideHeader ? '-translate-y-full' : 'translate-y-0'}`}
      >
      <Navbar />
      </div>

      {showStickyProgress && (
        <ExamHeader
          isSticky={true}
          isReviewMode={true}
          examData={examData}
          reviewSections={reviewSections}
          activeSection={activeSection}
          activeQuestionType={activeQuestionType}
          questionTypeTabs={questionTypeTabs}
          groupedQuestions={groupedQuestions}
          studentAnswers={studentAnswers}
          answerOrder={answerOrder}
          currentQuestionIndex={currentQuestionIndex}
          currentQuestionPage={currentQuestionPage}
          onSectionChange={handleSectionChange}
          onQuestionTypeChange={handleQuestionTypeChange}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setCurrentQuestionPage={setCurrentQuestionPage}
          expandedQuestionType={expandedQuestionType}
        />
      )}

      <main className={`flex-1 py-8 ${showStickyProgress ? 'pt-44' : ''} ${hideHeader ? 'pt-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          {!showStickyProgress && (
            <div ref={nonStickyHeaderRef}>
              <ExamHeader
                isSticky={false}
                isReviewMode={true}
                examData={examData}
                reviewSections={reviewSections}
                activeSection={activeSection}
                activeQuestionType={activeQuestionType}
                questionTypeTabs={questionTypeTabs}
                groupedQuestions={groupedQuestions}
                studentAnswers={studentAnswers}
                answerOrder={answerOrder}
                currentQuestionIndex={currentQuestionIndex}
                currentQuestionPage={currentQuestionPage}
                onSectionChange={handleSectionChange}
                onQuestionTypeChange={handleQuestionTypeChange}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                setCurrentQuestionPage={setCurrentQuestionPage}
                expandedQuestionType={expandedQuestionType}
              />
            </div>
          )}

          {resultInfo && (
            <div className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-5 mb-6 overflow-hidden">
              <h2 className="text-2xl font-bold text-[#3563E9] mb-4">Kết quả bài làm</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{fontFamily: "Nunito"}}>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-500">Tổng điểm</div>
                      <div className="text-3xl font-extrabold text-[#4169E1]">
                          {resultInfo.sum_score ? resultInfo.sum_score.toFixed(1) : 'N/A'}
                      </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-500">Thời gian</div>
                      <div className="text-3xl font-extrabold text-gray-800">
                          {formatTime(resultInfo.duration * 60)} 
                      </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-500">Ngày làm</div>
                      <div className="text-lg font-bold text-gray-800 pt-3">
                          {new Date(resultInfo.datetime).toLocaleDateString('vi-VN')}
                      </div>
                  </div>
              </div>
            </div>
          )}
          
          <div id="questions-container" className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-8">
            
            {isListeningSection ? (
              <>
                
                {filteredQuestions.map((question, questionIndex) => (
                  <div 
                    key={question.id} 
                    id={`question-${question.id}`}
                    className={`${questionIndex > 0 ? 'mt-8' : ''} scroll-mt-30`}
                    style={{ scrollMarginTop: `${scrollOffset}px` }}
                  >
                    {question.question_text && (
                      <div className="mb-8">
                        <div className="flex items-start gap-3">
                           <div className="w-9 h-9 border-2 border-gray-300 rounded-md flex items-center justify-center text-base font-semibold text-gray-700 select-none">
                              {question.position}
                           </div>
                          <div className="text-xl font-light text-[#0B1320] leading-relaxed" style={{ fontFamily: "UD Digi Kyokasho N-R", fontWeight: 300 }}>
                            {question.question_text}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {question.answers && question.answers.length > 0 ? (
                        (() => {
                              const byOrder = new Map();
                              question.answers.forEach((a) => {
                                const key = String(a.show_order);
                                if (!byOrder.has(key)) byOrder.set(key, a);
                              });
                              return Array.from(byOrder.values()).sort(
                                (a, b) => Number(a.show_order) - Number(b.show_order)
                              );
                            })().map((answer) => {
                              
                              const isStudentChoice = answer.is_student_choice === true;
                              const isCorrect = answer.is_correct === true;
                              
                              let answerStyle = "border-gray-300";
                              let textStyle = "text-gray-800";

                              if (isStudentChoice && isCorrect) {
                                  answerStyle = "border-green-500 bg-green-50"; 
                                  textStyle = "text-green-800 font-semibold";
                              } else if (isStudentChoice && !isCorrect) {
                                  answerStyle = "border-red-500 bg-red-50"; 
                                  textStyle = "text-red-800 font-semibold";
                              } else if (isCorrect) {
                                  answerStyle = "border-green-400 border-dashed bg-green-50";
                                  textStyle = "text-green-800";
                              }
                              
                              return (
                                <label
                                  key={answer.id}
                                  className={`flex items-center p-2 border rounded-lg transition-all ${answerStyle} cursor-not-allowed`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={answer.id}
                                    checked={isStudentChoice}
                                    readOnly disabled
                                    className="hidden"
                                  />
                                  <span
                                    className={`flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                      isStudentChoice ? "border-[#874FFF]" : "border-gray-400"
                                    }`}
                                  >
                                    <span
                                      className={`w-3 h-3 rounded-full ${
                                        isStudentChoice ? "bg-[#874FFF]" : "bg-transparent"
                                      }`}
                                    />
                                  </span>
                                  <span className={`ml-3 text-base font-normal ${textStyle}`} style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                                    {formatAnswerText(answer.answer_text, question.question_text, question.questionTypeId)}
                                  </span>
                                  
                                  {isCorrect && (
                                    <span className="ml-auto text-green-600 font-bold px-2">✓ Đúng</span>
                                  )}
                                  {isStudentChoice && !isCorrect && (
                                    <span className="ml-auto text-red-600 font-bold px-2">✗</span>
                                  )}
                                </label>
                              );
                        })
                      ) : (
                        <p className="text-gray-500">Không có đáp án</p>
                      )}
                    </div>
                  </div>
                ))
              }
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-xl bg-[#FFD24D] text-[#1E1E1E] font-bold text-lg whitespace-nowrap">
                      {(() => {
                        const currentTab = questionTypeTabs.find(tab => tab.id === activeQuestionType);
                        return currentTab?.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || `問題 ${currentQuestionIndex + 1}`;
                      })()} 
                    </div>
                    {currentQuestion?.taskInstructions && (
                      <p 
                        className="text-xl font-bold text-[#0B1320] leading-relaxed cursor-pointer hover:text-[#4169E1] transition-colors break-words hyphens-auto"
                        onClick={() => {
                          handleQuestionTypeChange(currentQuestion.questionTypeId);
                        }}
                      >
                        {currentQuestion.taskInstructions.replace(/^問題\s*[０-９0-9]+\s*[：:]\s*/, '')}
                      </p>
                    )}
                    </div>
                </div>

                {isPerforatedQuestion(activeQuestionType) && groupedQuestions[activeQuestionType]?.type?.passages && groupedQuestions[activeQuestionType]?.type?.passages.length > 0 && (
                   <div className="mb-6">
                      <PassageBorderBox>
                        {groupedQuestions[activeQuestionType].type.passages.map((passage, passageIndex) => (
                          <div key={passageIndex}>
                            {passage.content && (
                              <div className="whitespace-pre-line text-lg md:text-xl">
                                {renderPassageContent(passage.content, { 
                                  questions: groupedQuestions[activeQuestionType]?.questions || [], 
                                  questionTypeId: activeQuestionType,
                                  onQuestionClick: togglePassageQuestion,
                                  renderQuestionPopover: renderPassageQuestionPopover,
                                  passageQuestionState: openPassageQuestions,
                                  questionRefs: passageQuestionRefs
                                })}                        
                              </div>
                            )}
                          </div>
                        ))}
                      </PassageBorderBox>
                   </div>
                )}
                
                {isPerforatedQuestion(activeQuestionType) ? null : (() => {
                  if (shouldUsePagination) {
                    const safePageIndex = Math.min(currentQuestionPage, filteredQuestions.length - 1);
                    const currentPaginationQuestion = filteredQuestions[safePageIndex];
                    
                    if (!currentPaginationQuestion) {
                      return <div className="text-center py-8 text-gray-500">Không tìm thấy câu hỏi</div>;
                    }
                    
                    return (
                      <div 
                        key={currentPaginationQuestion.id} 
                        id={`question-${currentPaginationQuestion.id}`} 
                        className="scroll-mt-30" 
                        style={{ scrollMarginTop: `${scrollOffset}px` }}
                      >
                        {currentPaginationQuestion.passage && (
                          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                            <div className="text-lg md:text-xl leading-relaxed text-gray-800">
                              {renderFramedPassageBlocks(currentPaginationQuestion.passage, false)}
                            </div>
                          </div>
                        )}
                        {currentPaginationQuestion.jlpt_question_passages && currentPaginationQuestion.jlpt_question_passages.length > 0 && (
                          <div className="mb-6">
                            <PassageBorderBox>
                              {currentPaginationQuestion.jlpt_question_passages.map((passage, passageIndex) => (
                                <div key={passageIndex}>
                                  {passage.content && (
                                    <div className="whitespace-pre-line text-lg md:text-xl">
                                      {renderPassageContent(passage.content, { questions: filteredQuestions, questionTypeId: activeQuestionType })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </PassageBorderBox>
                          </div>
                        )}
                        <div className="mb-8">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 border-2 border-gray-300 rounded-md flex items-center justify-center text-base font-semibold text-gray-700 select-none">
                              {currentPaginationQuestion.position}
                            </div>
                            <div className="text-xl font-light text-[#0B1320] leading-relaxed" style={{ fontFamily: "UD Digi Kyokasho N-R", fontWeight: 300 }}>
                              {currentPaginationQuestion.underline_text ? (
                                <>
                                  {currentPaginationQuestion.question_text.split(currentPaginationQuestion.underline_text)[0].split('<enter>').map((part, index) => (
                                    <span key={index}>
                                      {part}
                                      {index < currentPaginationQuestion.question_text.split(currentPaginationQuestion.underline_text)[0].split('<enter>').length - 1 && <br />}
                                    </span>
                                  ))}
                              <Underline weight={1}>
                                    {currentPaginationQuestion.underline_text.split('<enter>').map((part, index) => (
                                      <span key={index}>
                                        {part}
                                        {index < currentPaginationQuestion.underline_text.split('<enter>').length - 1 && <br />}
                                      </span>
                                    ))}
                              </Underline>
                                  {currentPaginationQuestion.question_text.split(currentPaginationQuestion.underline_text)[1].split('<enter>').map((part, index) => (
                                    <span key={index}>
                                      {part}
                                      {index < currentPaginationQuestion.question_text.split(currentPaginationQuestion.underline_text)[1].split('<enter>').length - 1 && <br />}
                                    </span>
                                  ))}
                                </>
                              ) : (
                                (currentPaginationQuestion?.question_text ?? '')
                                  .split('<enter>')
                                  .map((part, index, arr) => (
                                    <span key={index}>
                                      {part}
                                      {index < arr.length - 1 && <br />}
                                    </span>
                                  ))
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {currentPaginationQuestion.answers && currentPaginationQuestion.answers.length > 0 ? (
                            (() => {
                                  const byOrder = new Map();
                                  currentPaginationQuestion.answers.forEach((a) => {
                                    const key = String(a.show_order);
                                    if (!byOrder.has(key)) byOrder.set(key, a);
                                  });
                                  return Array.from(byOrder.values()).sort(
                                    (a, b) => Number(a.show_order) - Number(b.show_order)
                                  );
                                })()
                                .map((answer) => {
                                  
                                  const isStudentChoice = answer.is_student_choice === true;
                                  const isCorrect = answer.is_correct === true;
                                  
                                  let answerStyle = "border-gray-300";
                                  if (isStudentChoice && isCorrect) {
                                      answerStyle = "border-green-500 bg-green-50";
                                  } else if (isStudentChoice && !isCorrect) {
                                      answerStyle = "border-red-500 bg-red-50";
                                  } else if (isCorrect) {
                                      answerStyle = "border-green-400 border-dashed bg-green-50";
                                  }
                                  
                                  return (
                                    <label
                                      key={answer.id}
                                      className={`flex items-center p-2 border rounded-lg transition-all ${answerStyle} cursor-not-allowed`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${currentPaginationQuestion.id}`}
                                        value={answer.id}
                                        checked={isStudentChoice}
                                        readOnly disabled
                                        className="hidden"
                                      />
                                      <span
                                        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                          isStudentChoice ? "border-[#874FFF]" : "border-gray-400"
                                        }`}
                                      >
                                        <span
                                          className={`w-3 h-3 rounded-full ${
                                            isStudentChoice ? "bg-[#874FFF]" : "bg-transparent"
                                          }`}
                                        />
                                      </span>
                                      <span className="ml-3 text-base font-normal text-gray-800" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                                        {formatAnswerText(answer.answer_text, currentPaginationQuestion.question_text, currentPaginationQuestion.questionTypeId)}
                                      </span>
                                      
                                      {isCorrect && (
                                        <span className="ml-auto text-green-600 font-bold px-2">✓ Đúng</span>
                                      )}
                                      {isStudentChoice && !isCorrect && (
                                        <span className="ml-auto text-red-600 font-bold px-2">✗ Lựa chọn của bạn</span>
                                      )}
    
                                    </label>
                                  );
                            })
                          ) : (
                            <p className="text-gray-500">Không có đáp án</p>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return filteredQuestions.map((question, questionIndex) => (
                      <div 
                        key={question.id} 
                        id={`question-${question.id}`}
                        className={`${questionIndex > 0 ? 'mt-8' : ''} scroll-mt-30`}
                        style={{ scrollMarginTop: `${scrollOffset}px` }}
                      >
                        
                        {question.passage && (
                          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                            <div className="text-lg md:text-xl leading-relaxed text-gray-800">
                              {renderFramedPassageBlocks(question.passage, false)}
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-8">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 border-2 border-gray-300 rounded-md flex items-center justify-center text-base font-semibold text-gray-700 select-none">
                              {question.position}
                            </div>
                            <div className="text-xl font-light text-[#0B1320] leading-relaxed" style={{ fontFamily: "UD Digi Kyokasho N-R", fontWeight: 300 }}>
                              {question.underline_text ? (
                                <>
                                  {question.question_text.split(question.underline_text)[0].split('<enter>').map((part, index) => (
                                    <span key={index}>
                                      {part}
                                      {index < question.question_text.split(question.underline_text)[0].split('<enter>').length - 1 && <br />}
                                    </span>
                                  ))}
                                  <Underline weight={1}>
                                    {question.underline_text.split('<enter>').map((part, index) => (
                                      <span key={index}>
                                        {part}
                                        {index < question.underline_text.split('<enter>').length - 1 && <br />}
                                      </span>
                                    ))}
                                  </Underline>
                                  {question.question_text.split(question.underline_text)[1].split('<enter>').map((part, index) => (
                                    <span key={index}>
                                      {part}
                                      {index < question.question_text.split(question.underline_text)[1].split('<enter>').length - 1 && <br />}
                                    </span>
                                  ))}
                                </>
                              ) : (
                                (question?.question_text ?? '')
                                  .split('<enter>')
                                  .map((part, index, arr) => (
                                    <span key={index}>
                                      {part}
                                      {index < arr.length - 1 && <br />}
                                    </span>
                                  ))
                              )}
                            </div>
                          </div>
                        </div>

                        {isSortQuestion(question.questionTypeId) && (
                          <div className="mb-8" style={{fontFamily: "Nunito"}}>
                            <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 min-h-[120px]">
                              <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                                Thứ tự đáp án của bạn:
                              </h4>
                              <div className="flex flex-wrap gap-3 justify-center">
                                {(() => {
                                  const selectedAnswers = answerOrder[question.id] || [];
                                  
                                  return selectedAnswers.map((answerId, index) => {
                                    const answer = question.answers.find(a => a.id === answerId);
                                    if (!answer) return null;
                                    
                                    return (
                                      <div
                                        key={answerId}
                                        className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border-2 border-[#874FFF] cursor-default"
                                      >
                                        
                                        <span className="text-gray-800 font-normal">
                                          {answer.show_order}. {answer.answer_text}
                                        </span>
                                      </div>
                                    );
                                  });
                                })()}
                                {(!answerOrder[question.id] || answerOrder[question.id].length === 0) && (
                                  <div className="text-gray-500 text-center w-full py-8">
                                    Bạn đã không trả lời câu hỏi này.
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4" style={{fontFamily: "Nunito"}}>
                              <div className="bg-green-50 rounded-xl p-6 border-2 border-dashed border-green-300 min-h-[120px]">
                                <h4 className="text-lg font-semibold text-green-700 mb-4 text-center">
                                  Thứ tự đáp án đúng là:
                                </h4>
                                <div className="flex flex-wrap gap-3 justify-center">
                                  {(() => {
                                    const correctAnswers = [...question.answers];
                                    
                                    correctAnswers.sort((a, b) => a.position - b.position);
                                    
                                    return correctAnswers.map((answer, index) => {
                                      if (!answer) return null;
                                      
                                      return (
                                        <div
                                          key={answer.id}
                                          className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border-2 border-green-500 cursor-default"
                                        >
                                          
                                          <span className="text-gray-800 font-normal">
                                            {answer.show_order}. {answer.answer_text}
                                          </span>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                            
                          </div>
                        )}
                        
                        {!isSortQuestion(question.questionTypeId) && (
                          <div className={activeSection.trim() === '(文字・語彙)' && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < 4 ? "grid grid-cols-4 gap-3" : "space-y-2"}>
                            {question.answers && question.answers.length > 0 ? (
                              (() => {
                                    const byOrder = new Map();
                                    question.answers.forEach((a) => {
                                      const key = String(a.show_order);
                                      if (!byOrder.has(key)) byOrder.set(key, a);
                                    });
                                    return Array.from(byOrder.values()).sort(
                                      (a, b) => Number(a.show_order) - Number(b.show_order)
                                    );
                                  })()
                                  .map((answer) => {
                                    
                                    const isStudentChoice = answer.is_student_choice === true;
                                    const isCorrect = answer.is_correct === true;
                                    
                                    let answerStyle = "border-gray-300";
                                    let textStyle = "text-gray-800";
                                    
                                    // (Logic này là của câu trắc nghiệm, không phải câu sắp xếp)
                                    if (isStudentChoice && isCorrect) {
                                        answerStyle = "border-green-500 bg-green-50"; 
                                        textStyle = "text-green-800 font-semibold";
                                    } else if (isStudentChoice && !isCorrect) {
                                        answerStyle = "border-red-500 bg-red-50"; 
                                        textStyle = "text-red-800 font-semibold";
                                    } else if (isCorrect) {
                                        answerStyle = "border-green-400 border-dashed bg-green-50";
                                        textStyle = "text-green-800";
                                    }
                                    
                                    return (
                                      <label
                                        key={answer.id}
                                        className={`flex items-center p-2 border rounded-lg transition-all ${
                                          activeSection.trim() === '(文字・語彙)' && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < 4
                                            ? "flex-row"
                                            : "flex-row"
                                        } ${answerStyle} cursor-not-allowed`}
                                      >
                                        <input
                                          type="radio"
                                          checked={isStudentChoice}
                                          readOnly disabled
                                          className="hidden"
                                        />
                                        <span
                                          className={`flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                            isStudentChoice ? "border-[#874FFF]" : "border-gray-400"
                                          }`}
                                        >
                                          <span
                                            className={`w-3 h-3 rounded-full ${
                                              isStudentChoice ? "bg-[#874FFF]" : "bg-transparent"
                                            }`}
                                          />
                                        </span>
                                        <span className={`ml-3 text-base font-normal ${textStyle}`} style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                                          {formatAnswerText(answer.answer_text, question.question_text, question.questionTypeId)}
                                        </span>
                                        
                                        {isCorrect && (
                                          <span className="ml-auto text-green-600 font-bold px-2">✓ Đúng</span>
                                        )}
                                        {!isCorrect && (
                                          <span className="ml-auto text-red-600 font-bold px-2">✗</span>
                                        )}
      
                                      </label>
                                    );
                              })
                            ) : (
                              <p className="text-gray-500">Không có đáp án</p>
                            )}
                          </div>
                        )}
                      </div>
                    ));
                  }
                })()}
              </>
            )}

          </div>
        </div>
      </main>

      <Footer />
      
      <Toaster 
        position="top-right"
        toastOptions={{
        }}
      />
    </div>
  );
}