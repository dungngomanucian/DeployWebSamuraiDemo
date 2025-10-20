import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getFullExamData } from "../../../api/backendService";

export default function ExamPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const examId = params.get("examId");

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const timerRef = useRef(null);

  // Load exam data
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
      const totalSeconds = data.exam.total_duration * 60;
      setTimeRemaining(totalSeconds);
      setTotalTime(totalSeconds);
      
      // Set active section to first section
      if (data.sections && data.sections.length > 0) {
        setActiveSection(data.sections[0].type);
      }
      
      setLoading(false);
    };

    loadExamData();
  }, [examId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!examData || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [examData, timeRemaining]);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerId) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  // Get all questions flattened
  const getAllQuestions = () => {
    if (!examData) return [];
    
    const allQuestions = [];
    examData.sections.forEach((section) => {
      section.question_types.forEach((qt) => {
        qt.questions.forEach((q) => {
          allQuestions.push({
            ...q,
            sectionType: section.type,
            sectionId: section.id,
            questionTypeId: qt.id,
            taskInstructions: qt.task_instructions,
          });
        });
      });
    });
    return allQuestions;
  };

  // Get questions filtered by active section
  const getFilteredQuestions = () => {
    const all = getAllQuestions();
    if (!activeSection) return all;
    return all.filter(q => q.sectionType === activeSection);
  };

  const allQuestions = getAllQuestions();
  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const sectionTabs = examData?.sections?.map((s) => s.type) || [];
  
  // Calculate progress bar color based on time remaining
  const getProgressBarColor = () => {
    const minutesRemaining = timeRemaining / 60;
    if (minutesRemaining <= 30) return 'bg-red-500';
    return 'bg-green-500';
  };
  
  // Calculate progress percentage
  const progressPercentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };
  
  // Handle section tab click
  const handleSectionChange = (sectionType) => {
    setActiveSection(sectionType);
    setCurrentQuestionIndex(0); // Reset to first question of this section
  };

  // Submit exam
  const handleSubmitExam = () => {
    clearInterval(timerRef.current);
    // TODO: Calculate score and save results
    alert("Đã nộp bài!");
    navigate("/exam-result", { state: { examId, answers: studentAnswers } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-[#0B1320]">Đang tải đề thi...</div>
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
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header - Exam Info */}
          <div className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-5 mb-6">
            {/* Top row: back, tabs, submit */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-full border-2 border-[#5427B4] text-[#5427B4] font-semibold hover:bg-[#5427B4] hover:text-white transition-all"
              >
                Quay lại
              </button>

              <div className="hidden md:flex items-center gap-2">
                {sectionTabs.map((tab, idx) => (
                  <button
                    key={`${tab}-${idx}`}
                    onClick={() => handleSectionChange(tab)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                      tab === activeSection
                        ? "bg-[#4169E1] text-white border-[#4169E1]"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:border-[#4169E1]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-[#874FFF] tracking-tight">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-gray-600 -mt-0.5">残り時間</div>
                </div>
                <button
                  onClick={handleSubmitExam}
                  className="px-5 py-2.5 rounded-full border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-all"
                >
                  Nộp bài
                </button>
              </div>
            </div>

            {/* Title and level */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B1320] leading-tight">
                  {examData.exam.level.title}
                </h1>
                <p className="text-base md:text-lg text-gray-600 mt-1">
                  {currentQuestion.sectionType}
                </p>
              </div>
            </div>

            {/* Progress Bar - Time based */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Câu {currentQuestionIndex + 1}/{filteredQuestions.length}
                </span>
                <span className="text-sm text-gray-600">
                  Thời gian còn lại: {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-2 transition-all duration-1000 ${getProgressBarColor()}`}
                  style={{ width: `${100 - progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-8">
            {/* Task Instructions (bold, no blue box) */}
            {currentQuestion.taskInstructions && (
              <div className="mb-6">
                <p className="text-lg md:text-xl font-bold text-[#0B1320] leading-relaxed">
                  {currentQuestion.taskInstructions}
                </p>
              </div>
            )}

            {/* Question Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 rounded-xl bg-[#FFD24D] text-[#1E1E1E] font-extrabold text-base">
                問題 {currentQuestion.position}
              </div>
            </div>

            {/* Passage (if exists) */}
            {currentQuestion.passage && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                <p className="text-lg leading-relaxed text-gray-800">
                  {currentQuestion.passage}
                </p>
              </div>
            )}

            {/* Question Text with leading square index */}
            <div className="mb-8">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 border-2 border-gray-300 rounded-md flex items-center justify-center text-base font-semibold text-gray-700 select-none">
                  {currentQuestion.position}
                </div>
                <p className="text-2xl font-semibold text-[#0B1320] leading-relaxed">
                  {currentQuestion.underline_text ? (
                    <>
                      {currentQuestion.question_text.split(currentQuestion.underline_text)[0]}
                      <span className="underline decoration-2 underline-offset-4">
                        {currentQuestion.underline_text}
                      </span>
                      {currentQuestion.question_text.split(currentQuestion.underline_text)[1]}
                    </>
                  ) : (
                    currentQuestion.question_text
                  )}
                </p>
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid md:grid-cols-2 gap-4">
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
                })().map((answer) => {
                  const checked = studentAnswers[currentQuestion.id] === answer.id;
                  return (
                    <label
                      key={answer.id}
                      className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                        checked
                          ? "border-[#874FFF] bg-purple-50"
                          : "border-gray-300 hover:border-[#874FFF]/60 hover:bg-gray-50"
                      }`}
                    >
                      {/* custom radio */}
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={answer.id}
                        checked={checked}
                        onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                        className="hidden"
                      />
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                          checked ? "border-[#874FFF]" : "border-gray-400"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full ${
                            checked ? "bg-[#874FFF]" : "bg-transparent"
                          }`}
                        />
                      </span>
                      <span className="ml-4 text-lg font-medium text-gray-800">
                        {answer.show_order}. {answer.answer_text}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="text-gray-500 col-span-2">Không có đáp án</p>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-8 py-3 rounded-full font-semibold text-lg transition-all ${
                currentQuestionIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white border-2 border-[#5427B4] text-[#5427B4] hover:bg-[#5427B4] hover:text-white"
              }`}
            >
              ← Quay lại
            </button>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitExam}
                className="px-8 py-3 rounded-full border-2 border-red-500 text-red-500 font-semibold text-lg hover:bg-red-500 hover:text-white transition-all"
              >
                NỘP BÀI
              </button>

              {currentQuestionIndex < filteredQuestions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-full bg-[#874FFF] text-white font-semibold text-lg hover:bg-[#7a46ea] transition-all border-2 border-[#5427B4]"
                >
                  Câu tiếp theo →
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-8 py-3 rounded-full bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition-all"
                >
                  HOÀN THÀNH ✓
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator - Filtered by active section */}
          <div className="mt-8 bg-white rounded-2xl shadow-md px-8 py-6">
            <h3 className="text-lg font-bold text-[#0B1320] mb-4">
              Danh sách câu hỏi - {activeSection || 'Tất cả'}
            </h3>
            <div className="grid grid-cols-10 gap-3">
              {filteredQuestions.map((q, index) => (
                <button
                  key={`${q.id}-${index}`}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-12 h-12 rounded-lg font-semibold text-sm transition-all ${
                    index === currentQuestionIndex
                      ? "bg-[#874FFF] text-white"
                      : studentAnswers[q.id]
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {q.position}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

