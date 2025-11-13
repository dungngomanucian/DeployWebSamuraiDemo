// src/pages/ExamReviewPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom"; // <-- Đã đổi sang useParams
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import toast, { Toaster } from "react-hot-toast";

// 1. IMPORT TỪ API SERVICE MỚI
import { getExamResultDetail } from "../../../api/student/examResultService"; // <-- API MỚI

// 2. IMPORT CÁC HÀM RENDER (Giữ nguyên)
import {
  formatTime,
  renderPassageContent,
  renderFramedPassageBlocks,
  PassageBorderBox,
  Underline,
  formatAnswerText
} from "../../../components/Exam/ExamRenderUtils";

// 3. IMPORT COMPONENT UI (Giữ nguyên)
import ExamHeader from "../../../components/Exam/ExamHeader";

// 4. XÓA IMPORT:
// - useExamTimers
// - useExamState
// - getFullExamData, submitExam
// - TimeUpModal, ExamCertificateOverlay

export default function ExamReviewPage() {
  const navigate = useNavigate();
  // Lấy ID kết quả từ URL, ví dụ: /results/123
  const { examResultId } = useParams(); // <-- THAY ĐỔI: Dùng useParams

  // === CÁC STATE GIỮ LẠI ĐỂ RENDER ===
  const [examData, setExamData] = useState(null); // Thông tin đề thi
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
  
  // (Refs)
  const userSelectedSectionRef = useRef(false);
  const activeSectionRef = useRef(null);
  const passageQuestionRefs = useRef({});
  const nonStickyHeaderRef = useRef(null); 
  const [scrollOffset, setScrollOffset] = useState(180); 
  
  // === STATE MỚI & STATE TÁI SỬ DỤNG ===
  const [resultInfo, setResultInfo] = useState(null); // <-- MỚI: Lưu điểm, thời gian
  
  // Các components con (QuestionButtons) cần 2 state này để sáng lên
  // Chúng ta sẽ điền dữ liệu cho 2 state này 1 LẦN DUY NHẤT sau khi tải
  const [studentAnswers, setStudentAnswers] = useState({});
  const [answerOrder, setAnswerOrder] = useState({});

  // 5. XÓA 2 HOOK: useExamTimers và useExamState
  
  // === 6. CẬP NHẬT `useEffect` TẢI DỮ LIỆU ===
  // (Lọc câu hỏi và logic phân trang giữ nguyên)
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

  // useEffect: Tải dữ liệu REVIEW bài thi
  useEffect(() => {
    const loadExamReviewData = async () => {
      if (!examResultId) {
        toast.error("Không tìm thấy ID bài làm.");
        navigate("/"); // Về trang chủ hoặc lịch sử
        return;
      }
      setLoading(true);

      // 1. GỌI API MỚI
      const { data, error } = await getExamResultDetail(examResultId);

      if (error) {
        console.error("Error loading exam review:", error);
        toast.error(`Không thể tải dữ liệu: ${error}`);
        navigate(-1); // Quay lại
        return;
      }
      
      // `data` là object lớn chứa { result_info: {...}, exam_content: {...} }
      
      // 2. SET STATE TỪ DỮ LIỆU MỚI
      setResultInfo(data.result_info);
      setExamData(data.exam_content.exam); // Cấu trúc exam gốc
      
      // 3. Logic setGroupedQuestions (Giữ nguyên)
      // data.exam_content.sections đã chứa dữ liệu 'merged' từ backend
      const grouped = {};
      const sAnswers = {}; // Map đáp án cho QuestionButtons
      const aOrder = {};   // Map đáp án sắp xếp cho QuestionButtons
      
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
            // q (question) LÚC NÀY đã chứa:
            // q.student_chosen_answer_id
            // q.answers[...].is_student_choice
            // q.answers[...].is_correct
            
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

            // Đồng thời, điền vào map đáp án cho QuestionButtons
            if (q.student_chosen_answer_id) {
              const qType = grouped[qt.id].type;
              // Giả sử câu sắp xếp trả về 1 mảng ID, câu thường trả về 1 ID string
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
      setStudentAnswers(sAnswers); // Set 1 lần
      setAnswerOrder(aOrder);     // Set 1 lần

      // 4. Logic set active section/type (Giữ nguyên)
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
  }, [examResultId, navigate]); // Phụ thuộc vào ID từ URL

  // useEffect: Xử lý cuộn trang (Giữ nguyên)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowStickyProgress(scrollTop > 200);
      setHideHeader(scrollTop > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useEffect: Đóng popover câu hỏi (Giữ nguyên)
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // ... (Giữ nguyên logic)
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [openPassageQuestions]);

  // useEffect: Đo chiều cao header (Giữ nguyên)
  useEffect(() => {
    if (showStickyProgress) {
      setScrollOffset(180);
    } else if (nonStickyHeaderRef.current) {
      const height = nonStickyHeaderRef.current.offsetHeight;
      setScrollOffset(height + 20); 
    }
  }, [showStickyProgress, examData, loading]);


  // === 7. CÁC HÀM LOGIC (XÓA/SỬA) ===

  // XÓA: handleSubmitExam, TimerProgressBar, getProgressBarStyles
  
  // GIỮ NGUYÊN: isSortQuestion, isPerforatedQuestion, togglePassageQuestion,
  // getQuestionTypeTabs, renderPassageQuestionPopover
  // (Ngoại trừ renderPassageQuestionPopover, chúng ta cần XÓA onClick)

  // Helper: Kiểm tra (Giữ nguyên)
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
     // ... (Giữ nguyên logic)
    if (!activeSection || !examData) return [];
    const tabs = [];
    // (Lưu ý: examData là data.exam, không phải data.exam_content)
    // Chúng ta cần duyệt qua groupedQuestions hoặc sections từ exam_content (đã lưu trong examData.sections)
    const sectionsToMap = examData?.sections || [];
    
    sectionsToMap.forEach((section) => {
      if (section.type === activeSection) {
        section.question_types.forEach((qt) => {
          tabs.push({
            id: qt.id,
            name: qt.name || qt.id,
            taskInstructions: qt.task_instructions,
            questionCount: qt.questions.length, // qt này từ examData (đề gốc)
            question_guides: qt.question_guides
          });
        });
      }
    });
    return tabs;
  };
  const questionTypeTabs = getQuestionTypeTabs();

  // Hàm render Popover câu hỏi (SỬA: VÔ HIỆU HÓA CLICK)
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
                
                // === LOGIC MỚI CHO REVIEW ===
                const isStudentChoice = ans.is_student_choice === true;
                const isCorrect = ans.is_correct === true;
                
                let answerStyle = 'bg-white hover:bg-gray-50';
                if (isStudentChoice && isCorrect) {
                    answerStyle = "bg-green-100";
                } else if (isStudentChoice && !isCorrect) {
                    answerStyle = "bg-red-100";
                } else if (isCorrect) {
                    answerStyle = "bg-green-100";
                }
                // === KẾT THÚC LOGIC MỚI ===

                return (
                  <button
                    key={ans.id}
                    type="button"
                    disabled // <-- VÔ HIỆU HÓA
                    className={`text-left w-full px-3 py-2.5 transition-colors cursor-not-allowed ${answerStyle}`}
                  >
                    <div className="flex items-start text-gray-900 leading-6">
                      <span className="whitespace-pre-wrap break-words">
                        {formatAnswerText(ans?.answer_text || ans?.content || '', q?.question_text || '', q?.questionTypeId || q?.question_type_id)}
                      </span>
                      {/* Thêm icon nếu muốn */}
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
  
  // === 8. CÁC HÀM HANDLER ĐIỀU HƯỚNG (Giữ nguyên) ===

  // Hàm: Đổi Section (XÓA logic kiểm tra 'is_listening')
  const handleSectionChange = (sectionType, questionTypeId = null) => {
    if (!examData) return;
    
    const newSection = examData.sections.find(s => s.type === sectionType);
    
    // XÓA: Logic check is_listening
    
    userSelectedSectionRef.current = true;
    activeSectionRef.current = sectionType;
    
    setActiveSection(sectionType);
    setCurrentQuestionIndex(0); 
    
    // ... (logic tìm và set activeQuestionType giữ nguyên) ...
    if (newSection && newSection.question_types.length > 0) {
      // ...
    }
  };

  // Hàm: Đổi Loại câu hỏi (Giữ nguyên)
  const handleQuestionTypeChange = (questionTypeId) => {
    // ... (Giữ nguyên logic)
    if (!examData) return;
    
    const targetSection = examData.sections.find(section => 
      section.question_types.some(qt => qt.id === questionTypeId)
    );
    // ...
  };
  

  // === PHẦN JSX (RETURN) ===

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-[#0B1320]">Đang tải bài làm...</div>
      </div>
    );
  }
  
  // XÓA: Loading 'isSubmitting'

  if (!examData || !currentQuestion) {
    // (Thêm check resultInfo)
    if (!resultInfo) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
          <div className="text-2xl font-bold text-red-600">Không tìm thấy dữ liệu kết quả!</div>
        </div>
      );
    }
    // ...
  }

  // (Phần JSX chính)
  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]" style={{fontFamily: "UD Digi Kyokasho N-B"}}>
      <div 
        className={`transition-transform duration-300 ${hideHeader ? '-translate-y-full' : 'translate-y-0'}`}
      >
      <Navbar />
      </div>

      {/* Sticky Header (SỬA: Xóa props timer/submit) */}
      {showStickyProgress && (
        <ExamHeader
          isSticky={true}
          isReviewMode={true}
          examData={examData}
          activeSection={activeSection}
          activeQuestionType={activeQuestionType}
          questionTypeTabs={questionTypeTabs}
          groupedQuestions={groupedQuestions}
          studentAnswers={studentAnswers} // <-- Vẫn truyền
          answerOrder={answerOrder}       // <-- Vẫn truyền
          currentQuestionIndex={currentQuestionIndex}
          currentQuestionPage={currentQuestionPage}
          onSectionChange={handleSectionChange}
          onQuestionTypeChange={handleQuestionTypeChange}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setCurrentQuestionPage={setCurrentQuestionPage}
          expandedQuestionType={expandedQuestionType}
          // XÓA: isSubmitting, onSubmitExam, TimerProgressBarComponent
        />
      )}

      <main className={`flex-1 py-8 ${showStickyProgress ? 'pt-44' : ''} ${hideHeader ? 'pt-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Non-Sticky Header (SỬA: Xóa props timer/submit) */}
          {!showStickyProgress && (
            <div ref={nonStickyHeaderRef}>
              <ExamHeader
                isSticky={false}
                isReviewMode={true}
                examData={examData}
                activeSection={activeSection}
                activeQuestionType={activeQuestionType}
                questionTypeTabs={questionTypeTabs}
                groupedQuestions={groupedQuestions}
                studentAnswers={studentAnswers} // <-- Vẫn truyền
                answerOrder={answerOrder}       // <-- Vẫn truyền
                currentQuestionIndex={currentQuestionIndex}
                currentQuestionPage={currentQuestionPage}
                onSectionChange={handleSectionChange}
                onQuestionTypeChange={handleQuestionTypeChange}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                setCurrentQuestionPage={setCurrentQuestionPage}
                expandedQuestionType={expandedQuestionType}
                // XÓA: isSubmitting, onSubmitExam, TimerProgressBarComponent
              />
            </div>
          )}

          {/* THÊM: Bảng tóm tắt kết quả */}
          {resultInfo && (
            <div className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-5 mb-6 overflow-hidden">
              <h2 className="text-2xl font-bold text-[#3563E9] mb-4">Kết quả bài làm</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{fontFamily: "Nunito"}}>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-500">Tổng điểm</div>
                      <div className="text-3xl font-extrabold text-[#4169E1]">
                          {resultInfo.sum_score.toFixed(1)}
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
          
          {/* Questions Container (Đây là nơi sửa nhiều nhất) */}
          <div id="questions-container" className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-8">
            {/* Question Header (Giữ nguyên) */}
            <div className="flex items-start justify-between mb-4">
              {/* ... (Giữ nguyên) ... */}
            </div>

            {/* XÓA: Hiển thị Duration (Timer câu hỏi) */}

            {/* Perforated Question Passage (Giữ nguyên) */}
            {isPerforatedQuestion(activeQuestionType) && groupedQuestions[activeQuestionType]?.type?.passages && groupedQuestions[activeQuestionType]?.type?.passages.length > 0 && (
              <div className="mb-6">
                 {/* XÓA: isTimeUp prop */}
                <PassageBorderBox> 
                  {/* ... (Render passage giữ nguyên, 
                         renderPassageQuestionPopover đã được sửa ở trên) ... */}
                </PassageBorderBox>
              </div>
            )}

            {/* Display questions - paginated for reading comprehension types */}
            {isPerforatedQuestion(activeQuestionType) ? null : (() => {
              if (shouldUsePagination) {
                // ... (Logic phân trang giữ nguyên)
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
                    style={{ scrollMarginTop: `${scrollOffset}px` }}
                  >
                    {/* ... (Render passage, question_text giữ nguyên) ... */}
                    
                    {/* PHẦN QUAN TRỌNG: RENDER ĐÁP ÁN (REVIEW MODE) */}
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
                            })()
                            // XÓA: filter cho sort question
                            .map((answer) => {
                              
                              // === LOGIC MỚI CHO REVIEW ===
                              const isStudentChoice = answer.is_student_choice === true;
                              const isCorrect = answer.is_correct === true;
                              
                              let answerStyle = "border-gray-300";
                              if (isStudentChoice && isCorrect) {
                                  answerStyle = "border-green-500 bg-green-50"; // Chọn đúng
                              } else if (isStudentChoice && !isCorrect) {
                                  answerStyle = "border-red-500 bg-red-50"; // Chọn sai
                              } else if (isCorrect) {
                                  answerStyle = "border-green-400 border-dashed bg-green-50"; // Đáp án đúng (không chọn)
                              }
                              // === KẾT THÚC LOGIC MỚI ===
                              
                              return (
                                <label
                                  key={answer.id}
                                  // XÓA: cursor-pointer
                                  className={`flex items-center p-2 border rounded-lg transition-all ${answerStyle}`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={answer.id}
                                    checked={isStudentChoice} // <-- Vẫn dùng
                                    readOnly // <-- THÊM
                                    disabled // <-- THÊM
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
                                    {formatAnswerText(answer.answer_text, currentQuestion.question_text, currentQuestion.questionTypeId)}
                                  </span>
                                  
                                  {/* THÊM: Icon Đúng/Sai */}
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
                // Show all questions
                return filteredQuestions.map((question, questionIndex) => (
                  <div 
                    key={question.id} 
                    id={`question-${question.id}`}
                    className={`${questionIndex > 0 ? 'mt-8' : ''} scroll-mt-30`}
                    style={{ scrollMarginTop: `${scrollOffset}px` }}
                  >
                    {/* ... (Render passage, question_text giữ nguyên) ... */}
                    
                    {/* Render khu vực sắp xếp (nếu có) */}
                    {isSortQuestion(question.questionTypeId) && (
                      <div className="mb-8" style={{fontFamily: "Nunito"}}>
                        <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 min-h-[120px]">
                          <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                            Thứ tự đáp án của bạn:
                          </h4>
                          <div className="flex flex-wrap gap-3 justify-center">
                            {(() => {
                              // answerOrder được set từ useEffect
                              const selectedAnswers = answerOrder[question.id] || [];
                              // *** (Thêm logic kiểm tra đúng/sai cho Sắp xếp ở đây nếu backend trả về) ***
                              // Hiện tại, chúng ta chỉ hiển thị thứ tự đã chọn:
                              
                              return selectedAnswers.map((answerId, index) => {
                                const answer = question.answers.find(a => a.id === answerId);
                                if (!answer) return null;
                                
                                return (
                                  <div
                                    key={answerId}
                                    // XÓA: onClick, cursor-pointer
                                    className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border-2 border-[#874FFF] cursor-default"
                                  >
                                    <span className="w-8 h-8 bg-[#874FFF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                      {index + 1}
                                    </span>
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
                      </div>
                    )}
                    
                    {/* PHẦN QUAN TRỌNG: RENDER ĐÁP ÁN (REVIEW MODE) */}
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
                            })()
                            // XÓA: .filter() của sort question
                            .map((answer) => {
                              
                              // === LOGIC MỚI CHO REVIEW ===
                              const isStudentChoice = answer.is_student_choice === true;
                              const isCorrect = answer.is_correct === true;
                              
                              let answerStyle = "border-gray-300";
                              let textStyle = "text-gray-800";
                              
                              if (isSortQuestion(question.questionTypeId)) {
                                // Logic riêng cho sắp xếp
                                if (isStudentChoice) {
                                  answerStyle = "border-gray-400 bg-gray-100 opacity-60 cursor-not-allowed";
                                } else {
                                  answerStyle = "border-gray-300";
                                }
                              } else {
                                // Logic cho trắc nghiệm
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
                              }
                              // === KẾT THÚC LOGIC MỚI ===
                              
                              return (
                                <label
                                  key={answer.id}
                                  // XÓA: cursor-pointer
                                  className={`flex items-center p-2 border rounded-lg transition-all ${
                                    activeSection.trim() === '(文字・語彙)' && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < 4
                                      ? "flex-row"
                                      : isSortQuestion(question.questionTypeId)
                                      ? "flex-row"
                                      : "flex-row"
                                  } ${answerStyle}`}
                                >
                                  <input
                                    type={isSortQuestion(question.questionTypeId) ? "checkbox" : "radio"}
                                    name={`question-${question.id}`}
                                    value={answer.id}
                                    checked={isStudentChoice} // <-- Vẫn dùng
                                    readOnly  // <-- THÊM
                                    disabled  // <-- THÊM
                                    className="hidden"
                                  />
                                  {isSortQuestion(question.questionTypeId) ? (
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-400 flex-shrink-0 font-bold text-xs text-gray-600">
                                      {answer.show_order}
                                    </span>
                                  ) : (
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
                                  )}
                                  <span className={`ml-3 text-base font-normal ${textStyle}`} style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                                    {formatAnswerText(answer.answer_text, question.question_text, question.questionTypeId)}
                                  </span>
                                  
                                  {/* THÊM: Icon Đúng/Sai (chỉ cho trắc nghiệm) */}
                                  {!isSortQuestion(question.questionTypeId) && isCorrect && (
                                    <span className="ml-auto text-green-600 font-bold px-2">✓ Đúng</span>
                                  )}
                                  {!isSortQuestion(question.questionTypeId) && isStudentChoice && !isCorrect && (
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
                ));
              }
            })()}
          </div>
        </div>
      </main>

      <Footer />

      {/* === XÓA COMPONENT OVERLAY === */}
      {/* <TimeUpModal ... /> */}
      {/* <ExamCertificateOverlay ... /> */}
      
      {/* Toast notifications (Giữ lại để báo lỗi) */}
      <Toaster 
        position="top-right"
        toastOptions={{
          // ... (giữ nguyên style)
        }}
      />
    </div>
  );
}