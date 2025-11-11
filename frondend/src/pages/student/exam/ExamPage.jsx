import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getFullExamData, submitExam } from "../../../api/examService";
import ExamCertificateOverlay from "../../../components/JLPTCertificateOverlay";
import toast, { Toaster } from "react-hot-toast";
import TimeUpModal from "../../../components/Exam/TimeUpModal";

// 1. IMPORT CÁC HÀM RENDER (Giữ nguyên)
import {
  formatTime,
  renderPassageContent,
  renderFramedPassageBlocks,
  PassageBorderBox,
  Underline,
  formatAnswerText
} from "../../../components/Exam/ExamRenderUtils"; // Đảm bảo đường dẫn này đúng

// 2. IMPORT 2 HOOK MỚI (Giả sử nằm trong 'src/hooks/exam/')
import { useExamTimers } from "../../../hooks/exam/useExamTimers";
import { useExamState } from "../../../hooks/exam/useExamState";

// 3. IMPORT CÁC COMPONENT UI ĐÃ TÁCH
// (Không cần import ExamQuestionTypeTabs nữa, vì ExamHeader đã gọi nó)
import ExamHeader from "../../../components/Exam/ExamHeader";

export default function ExamPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const examId = params.get("examId");

  // === CÁC STATE GỐC CÒN GIỮ LẠI ===
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0); 
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionType, setActiveQuestionType] = useState(null);
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [currentQuestionPage, setCurrentQuestionPage] = useState(0);
  const [openPassageQuestions, setOpenPassageQuestions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [finalResultData, setFinalResultData] = useState(null);
  
  // (Refs)
  const userSelectedSectionRef = useRef(false);
  const activeSectionRef = useRef(null);
  const passageQuestionRefs = useRef({});
  const nonStickyHeaderRef = useRef(null); 
  const [scrollOffset, setScrollOffset] = useState(180); 
  
  // === 4. ĐƯA STATE TỪ CON LÊN CHA (NÂNG CẤP) ===
  const [expandedQuestionType, setExpandedQuestionType] = useState({});
  // ===========================================

  
  // === 5. GỌI CÁC HOOK MỚI ===
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
  
  const {
    timeRemaining,
    showReadingTimeUpModal,
    setShowReadingTimeUpModal,
    stopGlobalTimer,
    questionTimeRemaining,
    resetQuestionToast,
    stopQuestionTimer
  } = useExamTimers(
    totalTime, 
    !loading && !!examData,
    currentQuestion,
    groupedQuestions,
    activeQuestionType
  );

  const {
    studentAnswers,
    answerOrder,
    handleAnswerSelect,
    getAnswerOrder,
    isAnswerSelected
  } = useExamState();

  
  // === 6. CÁC HÀM VÀ useEffect GỐC CÒN GIỮ LẠI ===

  // useEffect: Tải dữ liệu thi
  useEffect(() => {
    const loadExamData = async () => {
      if (!examId) {
        navigate("/mock-exam-jlpt");
        return;
      }
      setLoading(true);
      const { data, error } = await getFullExamData(examId);
      if (error) {
        console.error("Error loading exam:", error);
        alert("Không thể tải dữ liệu đề thi. Vui lòng thử lại!");
        navigate(-1);
        return;
      }
      setExamData(data);
      
      // Lọc các sections không phải listening (is_listening = false)
      const nonListeningSections = data?.sections?.filter(section => section.is_listening === false) || [];
      const totalMinutesFromSections = nonListeningSections.length > 0
        ? nonListeningSections.reduce((sum, section) => sum + (Number(section?.duration) || 0), 0)
        : 0;
      const totalSeconds = totalMinutesFromSections * 60;
      setTotalTime(totalSeconds); 
      const grouped = {};
      data.sections.forEach((section) => {
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
          });
        });
      });
      setGroupedQuestions(grouped);
      if (data.sections && data.sections.length > 0 && !userSelectedSectionRef.current) {
        const firstSectionType = data.sections[0].type;
        setActiveSection(firstSectionType);
        activeSectionRef.current = firstSectionType;
        const firstQuestionType = data.sections[0].question_types?.[0];
        if (firstQuestionType) {
          setActiveQuestionType(firstQuestionType.id);
        }
      }
      setLoading(false);
    };
    loadExamData();
  }, [examId, navigate]);

  // useEffect: Xử lý cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowStickyProgress(scrollTop > 200);
      setHideHeader(scrollTop > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useEffect: Đóng popover câu hỏi
  useEffect(() => {
    const handleDocumentClick = (event) => {
      const target = event.target;
      const currentlyOpenIds = Object.keys(openPassageQuestions).filter((id) => openPassageQuestions[id]);
      if (currentlyOpenIds.length === 0) return;
      let changed = false;
      const nextState = { ...openPassageQuestions };
      for (const qid of currentlyOpenIds) {
        const container = passageQuestionRefs.current[qid];
        if (container && !container.contains(target)) {
          nextState[qid] = false;
          changed = true;
        }
      }
      if (changed) setOpenPassageQuestions(nextState);
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [openPassageQuestions]);

  // (SỬA LỖI CUỘN) useEffect ĐỂ ĐO CHIỀU CAO HEADER
  useEffect(() => {
    if (showStickyProgress) {
      setScrollOffset(180);
    } else if (nonStickyHeaderRef.current) {
      const height = nonStickyHeaderRef.current.offsetHeight;
      setScrollOffset(height + 20); 
    }
  }, [showStickyProgress, examData, loading]);


  // === 7. CÁC HÀM LOGIC GỐC ===

  // Helper: Kiểm tra xem question type có phải là sort question không (dựa trên is_Sort_Question)
  const isSortQuestion = (questionTypeId) => {
    if (!questionTypeId) return false;
    return groupedQuestions[questionTypeId]?.type?.is_Sort_Question === true;
  };

  // Helper: Kiểm tra xem question type có phải là perforated question không (dựa trên is_perforated_question)
  const isPerforatedQuestion = (questionTypeId) => {
    if (!questionTypeId) return false;
    return groupedQuestions[questionTypeId]?.type?.is_perforated_question === true;
  };

  // Helper: Bật/tắt Popover câu hỏi perforated question
  const togglePassageQuestion = (questionId) => {
    setOpenPassageQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Helper: Lấy các tab loại câu hỏi
  const getQuestionTypeTabs = () => {
    if (!activeSection || !examData) return [];
    const tabs = [];
    examData.sections.forEach((section) => {
      if (section.type === activeSection) {
        section.question_types.forEach((qt) => {
          tabs.push({
            id: qt.id,
            name: qt.name || qt.id,
            taskInstructions: qt.task_instructions,
            questionCount: qt.questions.length,
            question_guides: qt.question_guides
          });
        });
      }
    });
    return tabs;
  };
  const questionTypeTabs = getQuestionTypeTabs();
  
  // Hàm render Popover câu hỏi
  const renderPassageQuestionPopover = (q) => {
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
                const sortQuestion = isSortQuestion(q.question_type_id);
                const selected = isAnswerSelected(q.id, ans.id, q.question_type_id, sortQuestion);
                return (
                  <button
                    key={ans.id}
                    type="button"
                    onClick={() => handleAnswerSelect(q.id, ans.id, q.question_type_id, sortQuestion)}
                    className={`text-left w-full px-3 py-2.5 transition-colors ${selected ? 'bg-[#DDE5FF]' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start text-gray-900 leading-6">
                      <span className="whitespace-pre-wrap break-words">
                        {formatAnswerText(
                          ans?.answer_text || ans?.content || '', 
                          q?.question_text || '', 
                          q?.questionTypeId || q?.question_type_id,
                          groupedQuestions[q?.questionTypeId || q?.question_type_id]?.type?.is_correct_usage === true
                        )}
                      </span>
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
  
  // === 8. CẬP NHẬT CÁC HÀM HANDLER ===

  // Hàm: Đổi Section
  const handleSectionChange = (sectionType, questionTypeId = null) => {
    if (!examData) return;
    
    const newSection = examData.sections.find(s => s.type === sectionType);
    
    // Kiểm tra nếu section là phần nghe (is_listening = true)
    if (newSection && newSection.is_listening === true) {
      toast.error("Vui lòng nộp bài 2 phần đầu tiên trước khi chuyển sang phần nghe!", {
        duration: 2000,
        style: {
          fontFamily: 'Nunito, sans-serif',
        },
      });
      return; // Không chuyển section, giữ nguyên tab hiện tại
    }
    
    userSelectedSectionRef.current = true;
    activeSectionRef.current = sectionType;
    
    setActiveSection(sectionType);
    setCurrentQuestionIndex(0); 
    
    if (newSection && newSection.question_types.length > 0) {
      if (questionTypeId) {
        const targetQuestionType = newSection.question_types.find(qt => qt.id === questionTypeId);
        if (targetQuestionType) {
          setActiveQuestionType(questionTypeId);
          // Cha cập nhật state expand
          setExpandedQuestionType(prev => ({
            ...prev,
            [sectionType]: prev[sectionType] === questionTypeId ? null : questionTypeId
          }));
        } else {
          const firstQuestionTypeId = newSection.question_types[0].id;
          setActiveQuestionType(firstQuestionTypeId);
          // Cha cập nhật state expand
          setExpandedQuestionType(prev => ({
            ...prev,
            [sectionType]: firstQuestionTypeId
          }));
        }
      } else {
        const matchingQuestionType = newSection.question_types.find(qt => qt.id === activeQuestionType);
        if (matchingQuestionType) {
          setActiveQuestionType(activeQuestionType);
        } else {
          const firstQuestionTypeId = newSection.question_types[0].id;
          setActiveQuestionType(firstQuestionTypeId);
        }
      }
      
      setCurrentQuestionPage(0);
      resetQuestionToast(); 
    }
  };

  // Hàm: Đổi Loại câu hỏi
  const handleQuestionTypeChange = (questionTypeId) => {
    if (!examData) return;
    
    const targetSection = examData.sections.find(section => 
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
      
      // Cha cập nhật state expand
      setExpandedQuestionType(prev => ({
        ...prev,
        [activeSection]: prev[activeSection] === questionTypeId ? null : questionTypeId
      }));
      
      // Kiểm tra và reset index nếu vượt quá số lượng câu hỏi của question type mới
      const newQuestions = groupedQuestions[questionTypeId]?.questions || [];
      const uniqueNewQuestions = newQuestions.filter((question, index, self) => 
        index === self.findIndex(q => q.id === question.id)
      );
      
      if (uniqueNewQuestions.length > 0) {
        const shouldUsePaginationNew = 
          groupedQuestions[questionTypeId]?.type?.duration &&
          (uniqueNewQuestions[0].passage || uniqueNewQuestions[0].jlpt_question_passages);
        
        if (shouldUsePaginationNew) {
          // Nếu dùng pagination, reset về page 0 nếu page hiện tại vượt quá
          if (currentQuestionPage >= uniqueNewQuestions.length) {
            setCurrentQuestionPage(0);
          }
        } else {
          // Nếu không dùng pagination, reset về index 0 nếu index hiện tại vượt quá
          if (currentQuestionIndex >= uniqueNewQuestions.length) {
            setCurrentQuestionIndex(0);
          }
        }
      } else {
        // Nếu không có câu hỏi, reset về 0
        setCurrentQuestionPage(0);
        setCurrentQuestionIndex(0);
      }
      
      resetQuestionToast(); 
    }
  };

  // Component: Thanh thời gian
  const TimerProgressBar = () => { 
    const barStyles = getProgressBarStyles();
    const progressPercentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
    
    return (
      <div className="w-[240px] relative">
        <div className="w-full h-5 rounded-full bg-gray-200 overflow-hidden relative">
          <div
            className="h-5 transition-all duration-1000 relative"
            style={{ width: `${100 - progressPercentage}%`, backgroundColor: barStyles.backgroundColor }}
          >
            <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 20 20" fill={barStyles.iconColor} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 1.667a8.333 8.333 0 1 0 0 16.666A8.333 8.333 0 0 0 10 1.667z"/>
                <path fillRule="evenodd" clipRule="evenodd" fill="#ffffff" d="M10.625 5.5a.625.625 0 1 0-1.25 0v4.208c0 .166.066.325.184.442l2.5 2.5a.625.625 0 1 0 .884-.884l-2.318-2.318V5.5z"/>
              </svg>
              <span className="text-sm font-semibold" style={{ color: barStyles.textColor, fontFamily: "Nunito" }}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper: Lấy style cho thanh thời gian
  const getProgressBarStyles = () => {
    const minutesRemaining = timeRemaining / 60; 
    if (minutesRemaining <= 15) return { backgroundColor: '#F24822', textColor: '#FFFFFF', iconColor: '#FFFFFF' };
    if (minutesRemaining <= 30) return { backgroundColor: '#FFC943', textColor: '#986D00', iconColor: '#986D00' };
    return { backgroundColor: '#66D575', textColor: '#00620D', iconColor: '#006C0F' };
  };

  // Hàm: Nộp bài
  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    stopGlobalTimer(); 
    stopQuestionTimer();
    const duration_taken = totalTime - timeRemaining; 
    const answersList = [];
    Object.keys(studentAnswers).forEach(qId => { 
      const answerData = studentAnswers[qId];
      if (Array.isArray(answerData)) {
        answerData.forEach((answerId, index) => {
          answersList.push({ exam_question_id: qId, chosen_answer_id: answerId, position: index + 1 });
        });
      } else if (answerData) {
        answersList.push({ exam_question_id: qId, chosen_answer_id: answerData, position: 1 });
      }
    });
    const submissionData = { duration: duration_taken, answers: answersList };
    console.log("Đang nộp bài...", submissionData);
    const { data: resultData, error } = await submitExam(examId, submissionData);
    setIsSubmitting(false);
    if (error) {
      console.error("Lỗi khi nộp bài:", error);
      alert(`Nộp bài thất bại: ${error}`);
    } else {
      console.log("Nộp bài thành công, kết quả:", resultData);
      setFinalResultData(resultData); // Lưu kết quả (chứa submission_id)
      // Lưu exam_result_id vào localStorage để listening page sử dụng
      localStorage.setItem('exam_result_id', resultData.id);
      // Chuyển sang trang ListeningIntro thay vì hiển thị overlay
      navigate(`/listening-intro?examId=${examId}`);
    }
  };

  // === PHẦN JSX (RETURN) ===

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-[#0B1320]">Đang tải đề thi...</div>
      </div>
    );
  }

  if (isSubmitting) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-[#0B1320]">Chuyển sang phần nghe hiểu...</div>
      </div>
    );
  }

  if (!examData || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-red-600">Không tìm thấy dữ liệu đề thi!</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]" style={{fontFamily: "UD Digi Kyokasho N-B"}}>
      <div 
        className={`transition-transform duration-300 ${hideHeader ? '-translate-y-full' : 'translate-y-0'}`}
      >
      <Navbar />
      </div>

      {/* Sticky Header (Đã tách component) */}
      {showStickyProgress && (
        <ExamHeader
          isSticky={true}
          examData={examData}
          activeSection={activeSection}
          activeQuestionType={activeQuestionType}
          questionTypeTabs={questionTypeTabs}
          groupedQuestions={groupedQuestions}
          studentAnswers={studentAnswers}
          answerOrder={answerOrder}
          currentQuestionIndex={currentQuestionIndex}
          currentQuestionPage={currentQuestionPage}
          isSubmitting={isSubmitting}
          onSectionChange={handleSectionChange}
          onQuestionTypeChange={handleQuestionTypeChange}
          onSubmitExam={handleSubmitExam}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setCurrentQuestionPage={setCurrentQuestionPage}
          TimerProgressBarComponent={TimerProgressBar} 
          expandedQuestionType={expandedQuestionType} // <--- TRUYỀN STATE
        />
      )}

      <main className={`flex-1 py-8 ${showStickyProgress ? 'pt-44' : ''} ${hideHeader ? 'pt-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Non-Sticky Header (Đã tách component) */}
          {!showStickyProgress && (
            <div ref={nonStickyHeaderRef}> {/* (SỬA LỖI CUỘN) Gắn Ref vào đây */}
              <ExamHeader
                isSticky={false}
                examData={examData}
                activeSection={activeSection}
                activeQuestionType={activeQuestionType}
                questionTypeTabs={questionTypeTabs}
                groupedQuestions={groupedQuestions}
                studentAnswers={studentAnswers}
                answerOrder={answerOrder}
                currentQuestionIndex={currentQuestionIndex}
                currentQuestionPage={currentQuestionPage}
                isSubmitting={isSubmitting}
                onSectionChange={handleSectionChange}
                onQuestionTypeChange={handleQuestionTypeChange}
                onSubmitExam={handleSubmitExam}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                setCurrentQuestionPage={setCurrentQuestionPage}
                TimerProgressBarComponent={TimerProgressBar}
                expandedQuestionType={expandedQuestionType} // <--- TRUYỀN STATE
              />
            </div>
          )}
          
          {/* Questions Container (Chưa tách) */}
          <div id="questions-container" className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-8">
            {/* Question Header */}
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
                    // Logic này giờ đã nằm trong handleQuestionTypeChange
                    handleQuestionTypeChange(currentQuestion.questionTypeId);
                  }}
                >
                  {currentQuestion.taskInstructions.replace(/^問題\s*[０-９0-9]+\s*[：:]\s*/, '')}
                </p>
              )}
              </div>
            </div>

             {/* Duration display for reading passages - below yellow box */}
             {(() => {
              const currentQuestionType = groupedQuestions[activeQuestionType];
              const duration = currentQuestionType?.type?.duration;
              const shouldUsePagination = filteredQuestions.length > 0 && 
                Boolean(duration) &&
                (filteredQuestions[0].passage || filteredQuestions[0].jlpt_question_passages);
               
               if (duration && filteredQuestions.length > 0) {
                 if (shouldUsePagination) {
                   const currentQuestionTime = questionTimeRemaining[currentQuestion?.id] || 0;
                   return (
                     <div className="mb-3 ml-4 -mt-2">
                      <span className={`text-xl font-bold ${currentQuestionTime === 0 ? 'text-red-500' : (currentQuestionTime <= 30 ? 'text-red-500' : 'text-[#874FFF]')}`}>
                        {formatTime(currentQuestionTime, true)}
                       </span>
                     </div>
                   );
                 } else {
                   const durationStr = duration.replace('00:', ''); // Remove hours if 00:
                   return (
                     <div className="mb-3 ml-4 -mt-2">
                       <span className="text-xl font-bold text-[#874FFF]">{durationStr}</span>
                     </div>
                   );
                 }
               }
               return null;
             })()}

            {/* Perforated Question: Display question type level passage from jlpt_question_passages */}
            {isPerforatedQuestion(activeQuestionType) && groupedQuestions[activeQuestionType]?.type?.passages && groupedQuestions[activeQuestionType]?.type?.passages.length > 0 && (
              <div className="mb-6">
                <PassageBorderBox isTimeUp={(filteredQuestions.length > 0 && questionTimeRemaining[filteredQuestions[0]?.id] !== undefined && questionTimeRemaining[filteredQuestions[0]?.id] <= 0)}>
                  {groupedQuestions[activeQuestionType].type.passages.map((passage, passageIndex) => (
                    <div key={passageIndex}>
                      {passage.content && (
                        <div className="whitespace-pre-line text-lg md:text-xl font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
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

            {/* Display questions - paginated for reading comprehension types */}
            {isPerforatedQuestion(activeQuestionType) ? null : (() => {
              if (shouldUsePagination) {
                // Show only current question for pagination
                const safePageIndex = Math.min(currentQuestionPage, filteredQuestions.length - 1);
                const currentQuestion = filteredQuestions[safePageIndex];
                
                if (!currentQuestion) {
                  return <div className="text-center py-8 text-gray-500">Không tìm thấy câu hỏi</div>;
                }
                
                return (
                  <div 
                    key={currentQuestion.id} 
                    id={`question-${currentQuestion.id}`} 
                    className="scroll-mt-30" 
                    style={{ scrollMarginTop: `${scrollOffset}px` }} // (SỬA LỖI CUỘN)
                  >
                    {/* ... (Code render câu hỏi phân trang giữ nguyên) ... */}
                    {currentQuestion.passage && (
                      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                        <div className="text-lg md:text-xl leading-relaxed text-gray-800 font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                          {renderFramedPassageBlocks(
                            currentQuestion.passage,
                            (questionTimeRemaining[currentQuestion?.id] !== undefined && questionTimeRemaining[currentQuestion?.id] <= 0)
                          )}
                        </div>
                      </div>
                    )}
                    {currentQuestion.jlpt_question_passages && currentQuestion.jlpt_question_passages.length > 0 && (
                      <div className="mb-6">
                        <PassageBorderBox isTimeUp={(questionTimeRemaining[currentQuestion?.id] !== undefined && questionTimeRemaining[currentQuestion?.id] <= 0)}>
                          {currentQuestion.jlpt_question_passages.map((passage, passageIndex) => (
                            <div key={passageIndex}>
                              {passage.content && (
                                <div className="whitespace-pre-line text-lg md:text-xl font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
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
                          {currentQuestion.position}
                        </div>
                        <div className="text-xl font-light text-[#0B1320] leading-relaxed" style={{ fontFamily: "UD Digi Kyokasho N-R", fontWeight: 300 }}>
                          {currentQuestion.underline_text ? (
                            <>
                              {currentQuestion.question_text.split(currentQuestion.underline_text)[0].split('<enter>').map((part, index) => (
                                <span key={index}>
                                  {part}
                                  {index < currentQuestion.question_text.split(currentQuestion.underline_text)[0].split('<enter>').length - 1 && <br />}
                                </span>
                              ))}
                          <Underline weight={1}>
                                {currentQuestion.underline_text.split('<enter>').map((part, index) => (
                                  <span key={index}>
                                    {part}
                                    {index < currentQuestion.underline_text.split('<enter>').length - 1 && <br />}
                                  </span>
                                ))}
                          </Underline>
                              {currentQuestion.question_text.split(currentQuestion.underline_text)[1].split('<enter>').map((part, index) => (
                                <span key={index}>
                                  {part}
                                  {index < currentQuestion.question_text.split(currentQuestion.underline_text)[1].split('<enter>').length - 1 && <br />}
                                </span>
                              ))}
                            </>
                          ) : (
                            (currentQuestion?.question_text ?? '')
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
                      {currentQuestion.answers && currentQuestion.answers.length > 0 ? (
                        (() => {
                              const byOrder = new Map();
                              currentQuestion.answers.forEach((a) => {
                                const key = String(a.show_order);
                                if (!byOrder.has(key)) byOrder.set(key, a);
                              });
                              return Array.from(byOrder.values()).sort(
                                (a, b) => Number(a.show_order) - Number(b.show_order)
                              );
                            })().filter((answer) => {
                              if (isSortQuestion(currentQuestion.questionTypeId)) {
                                const selectedAnswers = answerOrder[currentQuestion.id] || [];
                                return !selectedAnswers.includes(answer.id);
                              }
                              return true;
                            }).map((answer) => {
                              const sortQuestion = isSortQuestion(currentQuestion.questionTypeId);
                              const isSelected = isAnswerSelected(currentQuestion.id, answer.id, currentQuestion.questionTypeId, sortQuestion);
                              const orderNumber = getAnswerOrder(currentQuestion.id, answer.id);
                              
                              return (
                                <label
                                  key={answer.id}
                                  className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-[#874FFF] bg-purple-50"
                                      : "border-gray-300 hover:border-[#874FFF]/60 hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={answer.id}
                                    checked={isSelected}
                                    onChange={() => handleAnswerSelect(currentQuestion.id, answer.id, currentQuestion.questionTypeId, sortQuestion)}
                                    className="hidden"
                                  />
                                  <span
                                    className={`flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                      isSelected ? "border-[#874FFF]" : "border-gray-400"
                                    }`}
                                  >
                                    <span
                                      className={`w-3 h-3 rounded-full ${
                                        isSelected ? "bg-[#874FFF]" : "bg-transparent"
                                      }`}
                                    />
                                  </span>
                                  <span className="ml-3 text-base font-normal text-gray-800" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                                    {formatAnswerText(
                                      answer.answer_text, 
                                      currentQuestion.question_text, 
                                      currentQuestion.questionTypeId,
                                      groupedQuestions[currentQuestion.questionTypeId]?.type?.is_correct_usage === true
                                    )}
                                  </span>
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
                // Show all questions
                return filteredQuestions.map((question, questionIndex) => (
                  <div 
                    key={question.id} 
                    id={`question-${question.id}`}
                    className={`${questionIndex > 0 ? 'mt-8' : ''} scroll-mt-30`}
                    style={{ scrollMarginTop: `${scrollOffset}px` }} // (SỬA LỖI CUỘN)
                  >
                    {/* ... (Code render toàn bộ câu hỏi giữ nguyên) ... */}
                    {question.passage && (
                      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                        <div className="text-lg md:text-xl leading-relaxed text-gray-800 font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                          {renderFramedPassageBlocks(
                            question.passage,
                            (questionTimeRemaining[question?.id] !== undefined && questionTimeRemaining[question?.id] <= 0)
                          )}
                        </div>
                      </div>
                    )}
                    {question.jlpt_question_passages && question.jlpt_question_passages.length > 0 && (
                      <div className="mb-6">
                        <PassageBorderBox isTimeUp={(questionTimeRemaining[question?.id] !== undefined && questionTimeRemaining[question?.id] <= 0)}>
                          {question.jlpt_question_passages.map((passage, passageIndex) => (
                            <div key={passageIndex}>
                              {passage.content && (
                                <div className="whitespace-pre-line text-lg md:text-xl font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                                  {renderPassageContent(passage.content, { questions: groupedQuestions[activeQuestionType]?.questions || [], questionTypeId: activeQuestionType })}
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
                                    className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border-2 border-[#874FFF] cursor-pointer hover:bg-purple-50 transition-all"
                                    onClick={() => handleAnswerSelect(question.id, answerId, question.questionTypeId, true)}
                                  >
                                    <span className="w-8 h-8 bg-[#874FFF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                      {index + 1}
                                    </span>
                                    <span className="text-gray-800 font-normal">
                                      {answer.show_order}. {answer.answer_text}
                                    </span>
                                    <span className="text-gray-400 text-sm">(Click để bỏ)</span>
                                  </div>
                                );
                              });
                            })()}
                            {(!answerOrder[question.id] || answerOrder[question.id].length === 0) && (
                              <div className="text-gray-500 text-center w-full py-8">
                                Chọn đáp án từ danh sách bên dưới để sắp xếp thứ tự
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={activeSection.trim() === '(文字・語彙)' && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < 4 ? "grid grid-cols-4 gap-3" : isSortQuestion(question.questionTypeId) ? "grid grid-cols-4 gap-3" : "space-y-2"}>
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
                            })().filter((answer) => {
                              if (isSortQuestion(question.questionTypeId)) {
                                const selectedAnswers = answerOrder[question.id] || [];
                                return !selectedAnswers.includes(answer.id);
                              }
                              return true;
                            }).map((answer) => {
                              const sortQuestion = isSortQuestion(question.questionTypeId);
                              const isSelected = isAnswerSelected(question.id, answer.id, question.questionTypeId, sortQuestion);
                              const orderNumber = getAnswerOrder(question.id, answer.id);
                              
                              return (
                                <label
                                  key={answer.id}
                                  className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all ${
                                    activeSection.trim() === '(文字・語彙)' && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < 4
                                      ? "flex-row"
                                      : sortQuestion
                                      ? "flex-row"
                                      : "flex-row"
                                  } ${
                                    isSelected
                                      ? sortQuestion
                                        ? "border-[#874FFF] bg-purple-50 opacity-60"
                                        : "border-[#874FFF] bg-purple-50"
                                      : "border-gray-300 hover:border-[#874FFF]/60 hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type={sortQuestion ? "checkbox" : "radio"}
                                    name={`question-${question.id}`}
                                    value={answer.id}
                                    checked={isSelected}
                                    onChange={() => handleAnswerSelect(question.id, answer.id, question.questionTypeId, sortQuestion)}
                                    className="hidden"
                                  />
                                  {isSortQuestion(question.questionTypeId) ? (
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-400 flex-shrink-0 font-bold text-xs text-gray-600">
                                      {answer.show_order}
                                    </span>
                                  ) : (
                                    <span
                                      className={`flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                        isSelected ? "border-[#874FFF]" : "border-gray-400"
                                      }`}
                                    >
                                      <span
                                        className={`w-3 h-3 rounded-full ${
                                          isSelected ? "bg-[#874FFF]" : "bg-transparent"
                                        }`}
                                      />
                                    </span>
                                  )}
                                  <span className="ml-3 text-base font-normal text-gray-800" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                                    {formatAnswerText(
                                      answer.answer_text, 
                                      question.question_text, 
                                      question.questionTypeId,
                                      groupedQuestions[question.questionTypeId]?.type?.is_correct_usage === true
                                    )}
                                  </span>
                                  {isSortQuestion(question.questionTypeId) && (
                                    <span className="ml-auto text-xs text-gray-500" style={{fontFamily: "Nunito"}}>(Click để chọn)</span>
                                  )}
                                </label>
                              );
                        })
                      ) : (
                        <p className="text-gray-500">Không có đáp án</p>
                      )}
                    </div>
                  </div>
                ));
              }
            })()}
          </div>
        </div>
      </main>

      <Footer />

      {/* === COMPONENT OVERLAY === */}
      <TimeUpModal
        show={showReadingTimeUpModal} 
        onClose={() => setShowReadingTimeUpModal(false)} 
        onAction={() => {
          setShowReadingTimeUpModal(false);
          handleSubmitExam();
        }}
        bothButtonsSubmit={true}
      />
      <ExamCertificateOverlay
        show={showCertificate}
        onHide={() => {
          setShowCertificate(false);
          navigate(`/student-dashboard`, {
            state: { 
              resultData: finalResultData 
            } 
          });
        }}
        resultData={finalResultData}
        examData={examData} 
      />
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000,
          className: 'toast-custom',
          style: {
            background: '#ef4444', 
            color: '#fff', 
            borderRadius: '8px',
            padding: '12px 24px', 
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '300px',
            fontFamily: 'Nunito, sans-serif',
          },
        }}
      />
    </div>
  );
}