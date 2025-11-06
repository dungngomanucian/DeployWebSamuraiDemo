import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getFullExamData, submitListeningExam } from "../../../api/examService";
import ExamCertificateOverlay from "../../../components/JLPTCertificateOverlay";
import { Toaster } from "react-hot-toast";
import TimeUpModal from "../../../components/Exam/TimeUpModal";

// 1. IMPORT CÁC HÀM RENDER (Giữ nguyên)
import {
  Underline,
  formatAnswerText
} from "../../../components/Exam/ExamRenderUtils"; // Đảm bảo đường dẫn này đúng

// 2. IMPORT 2 HOOK MỚI (Giả sử nằm trong 'src/hooks/exam/')
import { useExamTimers } from "../../../hooks/exam/useExamTimers";
import { useExamState } from "../../../hooks/exam/useExamState";
// IMPORT components AudioPlayer
import AudioPlayer from "../../../components/Exam/AudioPlayer";

export default function ListeningPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const examId = params.get("examId");

  // === CÁC STATE GỐC CÒN GIỮ LẠI ===
  // (State liên quan đến tải dữ liệu)
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0); // Chỉ giữ lại state tổng thời gian
  const [groupedQuestions, setGroupedQuestions] = useState({});

  // (State liên quan đến UI)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionType, setActiveQuestionType] = useState(null);
  const [expandedQuestionType, setExpandedQuestionType] = useState({});
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [currentQuestionPage, setCurrentQuestionPage] = useState(0);
  
  // (State liên quan đến nộp bài)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [finalResultData, setFinalResultData] = useState(null);
  
  // (Refs)
  const userSelectedSectionRef = useRef(false);
  const activeSectionRef = useRef(null);
  
  // === 3. GỌI CÁC HOOK MỚI ===
  // Helper: Lấy câu hỏi hiện tại (Cần cho hook timer)
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
    (filteredQuestions[currentQuestionIndex] || null); // Thêm || null để tránh lỗi
  
  // Hook quản lý Timer
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
    !loading && !!examData, // isExamDataLoaded
    currentQuestion,
    groupedQuestions,
    activeQuestionType
  );

  // Hook quản lý State (Câu trả lời)
  const {
    studentAnswers,
    handleAnswerSelect, // <-- Hàm xử lý logic chính
    isAnswerSelected
  } = useExamState();

  // === 5. CÁC HÀM VÀ useEffect GỐC CÒN GIỮ LẠI ===
  // useEffect: Tải dữ liệu thi (Cập nhật: Chỉ set totalTime)
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

      // Xử lý chỉ lấy thông tin của section nghe này (is_listening == true)
      const listeningSections = data.sections.filter(section => section.is_listening === true);
      const filteredData = { ...data, sections: listeningSections };
      setExamData(filteredData);
      
      // TÍNH TOÁN VÀ SET totalTime (Hook timer sẽ tự bắt theo - chỉ từ listening sections)
      const totalMinutesFromSections = Array.isArray(listeningSections)
        ? listeningSections.reduce((sum, section) => sum + (Number(section?.duration) || 0), 0)
        : 0;
      const totalSeconds = totalMinutesFromSections * 60;
      setTotalTime(totalSeconds); 
      
      // Group questions by question type (chỉ lấy từ listening sections)
      const grouped = {};
      listeningSections.forEach((section) => {
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
      
      // Set active section and question type (chỉ từ listening sections)
      if (listeningSections && listeningSections.length > 0 && !userSelectedSectionRef.current) {
        const firstSectionType = listeningSections[0].type;
        setActiveSection(firstSectionType);
        activeSectionRef.current = firstSectionType;
        const firstQuestionType = listeningSections[0].question_types?.[0];
        if (firstQuestionType) {
          setActiveQuestionType(firstQuestionType.id);
        }
      }
      
      setLoading(false);
    };
    loadExamData();
  }, [examId, navigate]);

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

  // === 6. CÁC HÀM LOGIC GỐC (Giữ lại hoặc cập nhật) ===
  // Helper: Lấy các tab loại câu hỏi (Giữ nguyên)
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

  // Xử lý đường dẫn file audio, lấy theo trường level_id của bảng jlpt_exams
  const getAudioBucketFromLevel = () => {
    const levelId = examData?.exam?.level_id || '';
    const match = /^level0([1-5])$/.exec(levelId);
    return match ? `N${match[1]}` : null;
  };
  
  // Hàm: Đổi Loại câu hỏi (Cập nhật: Thêm reset toast)
  const handleQuestionTypeChange = (questionTypeId) => {
    if (!examData) return;
    
    setActiveQuestionType(questionTypeId);
    setCurrentQuestionPage(0);
    setCurrentQuestionIndex(0);
    resetQuestionToast();
  };

  // Hàm: Nộp bài (Cập nhật: Dùng hook)
  const handleSubmitExam = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    // Dừng tất cả timer
    stopGlobalTimer(); 
    stopQuestionTimer();
    
    // 1. Tính toán thời gian
    const duration_taken = totalTime - timeRemaining; // 'timeRemaining' từ hook

    // 2. Chuyển đổi state (dùng 'studentAnswers' từ hook)
    const answersList = [];
    Object.keys(studentAnswers).forEach(qId => { // 'studentAnswers' từ hook
      const answerData = studentAnswers[qId];
      
      if (Array.isArray(answerData)) {
        // Câu sắp xếp
        answerData.forEach((answerId, index) => {
          answersList.push({
            exam_question_id: qId,
            chosen_answer_id: answerId,
            position: index + 1
          });
        });
      } else if (answerData) {
        // Câu trắc nghiệm
        answersList.push({
          exam_question_id: qId,
          chosen_answer_id: answerData,
          position: 1
        });
      }
    });

    // 3. Lấy exam_result_id từ localStorage
    const exam_result_id = localStorage.getItem('exam_result_id');
    if (!exam_result_id) {
      alert('Không tìm thấy exam_result_id. Vui lòng làm lại phần thi đọc trước.');
      setIsSubmitting(false);
      return;
    }

    // 4. Chuẩn bị data nộp bài listening
    const submissionData = {
      exam_result_id: exam_result_id,
      duration: duration_taken,
      answers: answersList
    };

    // 5. Gọi API listening submission
    const { data: resultData, error } = await submitListeningExam(examId, submissionData);

    setIsSubmitting(false);

    // 6. Xử lý kết quả
    if (error) {
      console.error("Lỗi khi nộp bài listening:", error);
      alert(`Nộp bài listening thất bại: ${error}`);
    } else {
      setFinalResultData(resultData);
      // Xóa exam_result_id khỏi localStorage
      localStorage.removeItem('exam_result_id');
      // Hiển thị certificate overlay
      setShowCertificate(true);
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
        <div className="text-2xl font-bold text-[#0B1320]">Đang nộp bài và chấm điểm...</div>
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

      {/* Sticky Progress Bar - Shows when scrolling */}
      {showStickyProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 px-6 py-4" style={{fontFamily: "Nunito"}}>
          <div className="max-w-7xl mx-auto">
            {/* Question Type Tabs and Submit Button */}
            <div className="flex items-center justify-between gap-4">
              {/* Question Type Tabs */}
              <div className="flex items-center gap-2 flex-1 justify-center">
                {questionTypeTabs.map((tab) => {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleQuestionTypeChange(tab.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                        tab.id === activeQuestionType
                          ? "bg-[#FFD24D] text-[#1E1E1E]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab?.question_guides?.name || tab.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || tab.name}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>

            {/* Audio Player (sticky) */}
            <div className="mt-3">
              {(() => {
                const currentSection = examData?.sections?.find(s => s.type === activeSection);
                const audioPath = currentSection?.audio_path;
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
                const bucket = getAudioBucketFromLevel();
                const audioUrl = audioPath && bucket ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${audioPath}` : null;
                if (!audioUrl) return null;
                return <AudioPlayer audioUrl={audioUrl} />;
              })()}
            </div>
          </div>
        </div>
      )}

      <main className={`flex-1 py-8 ${showStickyProgress ? 'pt-20' : ''} ${hideHeader ? 'pt-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header - Exam Info */}
          <div className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-5 mb-6">
            {/* Top row: back, title, submit */}
            <div className="flex items-center justify-between gap-4">
              <button
                style={{fontFamily: "Nunito"}}
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-extrabold hover:bg-[#5427B4] hover:text-white transition-all"
              >
                Quay lại
              </button>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3563E9] leading-tight">
                {activeSection}
              </h1>

              <button
                style={{fontFamily: "Nunito"}}
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg border-2 border-red-500 text-red-500 font-extrabold hover:bg-red-500 hover:text-white transition-all"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>

            {/* Question Type Tabs - Header (Cái này mới so với ExamPage)*/}
            {!showStickyProgress && questionTypeTabs.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {questionTypeTabs.map((tab) => {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleQuestionTypeChange(tab.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                        tab.id === activeQuestionType
                          ? "bg-[#FFD24D] text-[#1E1E1E]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab?.question_guides?.name || tab.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || tab.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Audio Player */}
            <div className="mt-6">
              {(() => {
                // Get audio_path from current section
                const currentSection = examData?.sections?.find(s => s.type === activeSection);
                const audioPath = currentSection?.audio_path;
                
                // Construct Supabase storage URL
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oreasnlyzhaeteipyylw.supabase.co';
                const bucket = getAudioBucketFromLevel();
                const audioUrl = audioPath && bucket
                  ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${audioPath}`
                  : null;

                if (!audioUrl) {
                  return (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">Không tìm thấy file audio cho phần thi này.</p>
                    </div>
                  );
                }

                return <AudioPlayer audioUrl={audioUrl} />;
              })()}
            </div>
          </div>

          {/* Questions Container */}
          <div id="questions-container" className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-8 mt-6">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="px-4 py-2 rounded-xl bg-[#FFD24D] text-[#1E1E1E] font-bold text-lg whitespace-nowrap">
                  {(() => {
                    // Find the current active question type tab
                    const currentTab = questionTypeTabs.find(tab => tab.id === activeQuestionType);
                    return currentTab?.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || `問題 ${currentQuestionIndex + 1}`;
                  })()} 
                </div>
                {currentQuestion?.taskInstructions && (
                <p 
                  className="text-xl font-normal text-[#0B1320] leading-relaxed cursor-pointer hover:text-[#4169E1] transition-colors break-words hyphens-auto"
                  onClick={() => {
                    // Toggle expand/collapse for current question type
                    setExpandedQuestionType(prev => ({
                      ...prev,
                      [activeSection]: expandedQuestionType[activeSection] === currentQuestion.questionTypeId ? null : currentQuestion.questionTypeId
                    }));
                    
                    // Auto scroll to questions section
                    setTimeout(() => {
                      const questionsSection = document.getElementById('questions-container');
                      if (questionsSection) {
                        questionsSection.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }
                    }, 100);
                  }}
                  style={{fontFamily: "UD Digi Kyokasho N-R"}}
                >
                  {currentQuestion.taskInstructions.replace(/^問題\s*[０-９0-9]+\s*[：:]\s*/, '')}
                </p>
              )}
              </div>
            </div>

            {/* Question Number Circles (Phần này mới so với ExamPage)*/}
            {filteredQuestions.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                {filteredQuestions.map((question, index) => {
                  const isAnswered = question.answers?.some(answer => 
                    isAnswerSelected(question.id, answer.id, question.questionTypeId)
                  ) || false;
                  
                  const handleQuestionClick = () => {
                    if (shouldUsePagination) {
                      setCurrentQuestionPage(index);
                    } else {
                      setCurrentQuestionIndex(index);
                    }
                    
                    // Scroll to question
                    setTimeout(() => {
                      const questionElement = document.getElementById(`question-${question.id}`);
                      if (questionElement) {
                        questionElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }
                    }, 100);
                  };

                  return (
                    <button
                      key={question.id}
                      onClick={handleQuestionClick}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors"
                      style={{
                        backgroundColor: isAnswered ? '#FFD24D' : '#D9D9D9',
                        color: '#000000'
                      }}
                    >
                      {question.position || index + 1}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Display questions - paginated for reading comprehension types */}
            {(() => {
              
              if (shouldUsePagination) {
                // Show only current question for pagination
                const safePageIndex = Math.min(currentQuestionPage, filteredQuestions.length - 1);
                const currentQuestion = filteredQuestions[safePageIndex];
                
                if (!currentQuestion) {
                  return <div className="text-center py-8 text-gray-500">Không tìm thấy câu hỏi</div>;
                }
                
                return (
                  <div key={currentQuestion.id} id={`question-${currentQuestion.id}`} className="scroll-mt-30" style={{ scrollMarginTop: '120px' }}>
                    
                    {/* Answer Options */}
                    <div className="space-y-2">
                      {currentQuestion.answers && currentQuestion.answers.length > 0 ? (
                        // Normalize answers: unique by show_order, sorted asc
                        (() => {
                              const byOrder = new Map();
                              currentQuestion.answers.forEach((a) => {
                                const key = String(a.show_order);
                                if (!byOrder.has(key)) byOrder.set(key, a);
                              });
                              return Array.from(byOrder.values()).sort(
                                (a, b) => Number(a.show_order) - Number(b.show_order)
                              );
                            }).map((answer) => {
                              const isSelected = isAnswerSelected(currentQuestion.id, answer.id, currentQuestion.questionTypeId);
                              
                              return (
                                <label
                                  key={answer.id}
                                  className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-[#874FFF] bg-purple-50"
                                      : "border-gray-300 hover:border-[#874FFF]/60 hover:bg-gray-50"
                                  }`}
                                >
                                  {/* custom radio */}
                                  <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={answer.id}
                                    checked={isSelected}
                                    onChange={() => handleAnswerSelect(currentQuestion.id, answer.id, currentQuestion.questionTypeId)}
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
                                    {formatAnswerText(answer.answer_text, currentQuestion.question_text, currentQuestion.questionTypeId)}
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
                // Show all questions for non-pagination types
                return filteredQuestions.map((question, questionIndex) => (
              <div 
                key={question.id} 
                id={`question-${question.id}`}
                className={`${questionIndex > 0 ? 'mt-8' : ''} scroll-mt-30`}
                style={{ scrollMarginTop: '10px' }}
              >

                {/* Hiển thị Question Text */}
                <div className="mb-8">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl font-medium text-[#0B1320] leading-relaxed" style={{ fontFamily: "UD Digi Kyokasho N-B", fontWeight: 300 }}>
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

                {/* Hiển thị Answer Options */}
                <div className="space-y-2">
                  {question.answers && question.answers.length > 0 ? (
                    // Normalize answers: unique by show_order, sorted asc
                    (() => {
                          const byOrder = new Map();
                          question.answers.forEach((a) => {
                            const key = String(a.show_order);
                            if (!byOrder.has(key)) byOrder.set(key, a);
                          });
                          return Array.from(byOrder.values()).sort(
                            (a, b) => Number(a.show_order) - Number(b.show_order)
                          );
                        })().filter(() => {
                          return true;
                        }).map((answer) => {
                          const isSelected = isAnswerSelected(question.id, answer.id, question.questionTypeId);
   
                          return (
                            <label
                              key={answer.id}
                              className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all flex-row ${
                                isSelected
                                  ? "border-[#874FFF] bg-purple-50"
                                  : "border-gray-300 hover:border-[#874FFF]/60 hover:bg-gray-50"
                              }`}
                            >
                              {/* custom radio */}
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={answer.id}
                                checked={isSelected}
                                onChange={() => handleAnswerSelect(question.id, answer.id, question.questionTypeId)}
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
                                {formatAnswerText(answer.answer_text, question.question_text, question.questionTypeId)}
                              </span>
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
        show={showReadingTimeUpModal} // <-- Lấy từ hook
        onClose={() => setShowReadingTimeUpModal(false)} // <-- Routeấy từ hook
        onAction={() => {
          setShowReadingTimeUpModal(false);
          navigate('/listening-intro'); // (Logic này có thể cần xem lại)
        }}
      />
      <ExamCertificateOverlay
        show={showCertificate}
        onHide={() => {
          setShowCertificate(false);
          // === SỬA DUY NHẤT Ở ĐÂY ===
          // Chuyển trang SAU KHI đóng overlay
          // Dùng 'finalResultData.id' (là submission_id)
          // navigate(`/exam-result/${finalResultData.id}`, { 
          navigate(`/student-dashboard`, {
            state: { 
              resultData: finalResultData // Vẫn gửi state để load nhanh
            } 
          });
          // ==========================
        }}
        resultData={finalResultData}
        examData={examData} // Truyền cả examData để lấy level, điểm đỗ...
      />
      {/* ======================================= */}

      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 6000, 
          style: {
            background: '#ef4444', 
            color: '#fff', 
            borderRadius: '8px',
            padding: '12px 24px', 
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '300px', 
          },
        }}
      />
    </div>
  );
}