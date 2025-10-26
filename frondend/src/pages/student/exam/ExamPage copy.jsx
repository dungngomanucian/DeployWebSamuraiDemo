import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getFullExamData } from "../../../api/examService";

export default function ExamPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const examId = params.get("examId");

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [answerOrder, setAnswerOrder] = useState({}); // For QT007: stores order of selected answers
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionType, setActiveQuestionType] = useState(null);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [expandedQuestionType, setExpandedQuestionType] = useState({}); // Track which tab is expanded per section
  const [barWidths, setBarWidths] = useState({}); // Store bar widths for each tab
  const [collapsedTabWidths, setCollapsedTabWidths] = useState({}); // Dynamic width for collapsed tabs per section
  const [expandedTabWidths, setExpandedTabWidths] = useState({});
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const timerRef = useRef(null);
  const tabContainerRefs = useRef({}); // Refs for tab containers per section


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
      
      // Group questions by question type - avoid duplicates
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
            // Check if question already exists to avoid duplicates
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
      
      // Set active section and question type to first ones
      if (data.sections && data.sections.length > 0) {
        setActiveSection(data.sections[0].type);
        const firstQuestionType = data.sections[0].question_types[0];
        if (firstQuestionType) {
          setActiveQuestionType(firstQuestionType.id);
        }
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

  // Calculate bar widths when expanded tab changes
    useEffect(() => {
      const expandedTabs = Object.values(expandedQuestionType).filter(Boolean);
      if (expandedTabs.length > 0) {
        setTimeout(() => {
          expandedTabs.forEach(qtId => {
            const container = document.getElementById(`question-buttons-${qtId}`);
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
    }, [expandedQuestionType, groupedQuestions]);

  // Calculate initial bar widths for all tabs
  useEffect(() => {
    if (examData && Object.keys(groupedQuestions).length > 0) {
      const newWidths = {};
      Object.keys(groupedQuestions).forEach(qtId => {
        const questionCount = groupedQuestions[qtId]?.questions?.length || 0;
        // Calculate estimated width: button width (40px) * count + gap (8px) * (count-1)
        const estimatedWidth = questionCount > 0 ? (40 * questionCount + 8 * (questionCount - 1)) : 120;
        newWidths[qtId] = estimatedWidth;
      });
      setBarWidths(newWidths);
    }
  }, [examData, groupedQuestions]);

  // Calculate collapsed tab width when expanded tab changes (per section)
  useEffect(() => {
    if (examData && Object.keys(expandedQuestionType).length > 0) {
      setTimeout(() => {
        const newCollapsedWidths = {};
        const newExpandedWidths = {};
        
        // For each section
        examData.sections.forEach(section => {
          const sectionType = section.type;
          const expandedQtId = expandedQuestionType[sectionType];
          const containerRef = tabContainerRefs.current[sectionType];
          
          if (expandedQtId && containerRef) {
            const containerWidth = containerRef.offsetWidth;
            const expandedTabBarWidth = barWidths[expandedQtId] || 0;
            const totalTabs = section.question_types.length;
            const collapsedTabCount = totalTabs - 1;
            const gapWidth = 16; // gap-4 = 16px
            const totalGaps = (totalTabs - 1) * gapWidth;
            
            // Start with minimum collapsed width
            const minCollapsedWidth = 80;
            
            // Calculate available space
            // Total container - gaps - (minCollapsedWidth * collapsedTabCount) = space for expanded
            const spaceForExpanded = containerWidth - totalGaps - (minCollapsedWidth * collapsedTabCount);
            
            // Expanded tab: use bar width but don't exceed available space
            const expandedWidth = Math.min(expandedTabBarWidth + 40, spaceForExpanded);
            
            // Recalculate collapsed width with actual expanded width
            const remainingSpace = containerWidth - expandedWidth - totalGaps;
            const collapsedWidth = remainingSpace / collapsedTabCount;
            
            // Final collapsed width (ensure it's reasonable)
            const finalCollapsedWidth = Math.max(Math.min(collapsedWidth, 150), 70);
            
            newExpandedWidths[sectionType] = expandedWidth;
            newCollapsedWidths[sectionType] = finalCollapsedWidth;
          }
        });
        
        setExpandedTabWidths(newExpandedWidths);
        setCollapsedTabWidths(newCollapsedWidths);
      }, 0);
    }
  }, [expandedQuestionType, barWidths, examData]);  

  // Handle scroll to show/hide sticky progress bar and hide header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Show sticky progress bar when scrolled down more than 200px
      setShowStickyProgress(scrollTop > 200);
      // Hide header when scrolled down more than 100px
      setHideHeader(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerId, questionTypeId) => {
    if (questionTypeId === "QT007") {
      // Handle QT007: sequential answer selection
      setAnswerOrder((prev) => {
        const currentOrder = prev[questionId] || [];
        
        // If answer is already selected, remove it and reorder the remaining answers
        if (currentOrder.includes(answerId)) {
          const newOrder = currentOrder.filter(id => id !== answerId);
          const newState = {
            ...prev,
            [questionId]: newOrder
          };
          
          // Also update student answers
          setStudentAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: newOrder
          }));
          
          return newState;
        }
        
        // Add answer to order if not already selected
        const newOrder = [...currentOrder, answerId];
        const newState = {
          ...prev,
          [questionId]: newOrder
        };
        
        // Also update student answers
        setStudentAnswers((prevAnswers) => ({
          ...prevAnswers,
          [questionId]: newOrder
        }));
        
        return newState;
      });
    } else {
      // Handle normal single answer selection
      setStudentAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));
    }
  };

  // Get answer order for QT007 questions
  const getAnswerOrder = (questionId, answerId) => {
    const order = answerOrder[questionId] || [];
    const index = order.indexOf(answerId);
    return index >= 0 ? index + 1 : null;
  };

  // Check if answer is selected for QT007 questions
  const isAnswerSelected = (questionId, answerId, questionTypeId) => {
    if (questionTypeId === "QT007") {
      const order = answerOrder[questionId] || [];
      return order.includes(answerId);
    } else {
      return studentAnswers[questionId] === answerId;
    }
  };

  // Function to underline matching content in answers for QT005 question types
  const formatAnswerText = (answerText, questionText, questionTypeId) => {
    if (questionTypeId !== "QT005" || !answerText || !questionText) {
      return answerText;
    }

    // Clean and normalize text for better matching
    const normalizeText = (text) => {
      return text.replace(/\s+/g, ' ').trim().toLowerCase();
    };

    // Find the longest common substring between answer and question
    const findLongestCommonSubstring = (str1, str2) => {
      const normalized1 = normalizeText(str1);
      const normalized2 = normalizeText(str2);
      
      let longest = "";
      let longestLength = 0;
      
      // Try different minimum lengths for better matching
      const minLengths = [5, 4, 3, 2];
      
      for (const minLength of minLengths) {
        for (let i = 0; i < normalized1.length - minLength + 1; i++) {
          for (let j = i + minLength; j <= normalized1.length; j++) {
            const substring = normalized1.substring(i, j);
            if (normalized2.includes(substring) && substring.length > longestLength) {
              // Find the original text position to get the actual substring
              const originalSubstring = str1.substring(i, j);
              longest = originalSubstring;
              longestLength = substring.length;
            }
          }
        }
        if (longestLength > 0) break; // Found a match, no need to try shorter lengths
      }
      
      return longest;
    };

    const commonText = findLongestCommonSubstring(answerText, questionText);
    
    if (commonText && commonText.length >= 2) {
      const parts = answerText.split(commonText);
      return (
          <>
            {parts[0]}
            <span className="underline decoration-1 underline-offset-5 decoration-black">
              {commonText}
            </span>
            {parts[1]}
          </>
      );
    }
    
    return answerText;
  };

  // Get all questions flattened
  const getAllQuestions = () => {
    if (!groupedQuestions) return [];
    
    const allQuestions = [];
    Object.values(groupedQuestions).forEach((group) => {
      group.questions.forEach((q) => {
        allQuestions.push(q);
      });
    });
    return allQuestions;
  };

  // Get questions filtered by active section and question type
  const getFilteredQuestions = () => {
    if (!activeQuestionType || !groupedQuestions[activeQuestionType]) return [];
    
    const questions = groupedQuestions[activeQuestionType].questions;
    
    // Remove duplicates if any exist
    const uniqueQuestions = questions.filter((question, index, self) => 
      index === self.findIndex(q => q.id === question.id)
    );
    
    return uniqueQuestions;
  };

  // Get question type tabs for current section
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
            questionCount: qt.questions.length
          });
        });
      }
    });
    return tabs;
  };

  const allQuestions = getAllQuestions();
  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const sectionTabs = examData?.sections?.map((s) => s.type) || [];
  const questionTypeTabs = getQuestionTypeTabs();
  
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
    console.log('handleNext called', { currentQuestionIndex, filteredQuestionsLength: filteredQuestions.length });
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => {
        console.log('Setting currentQuestionIndex to:', prev + 1);
        return prev + 1;
      });
    } else {
      // Move to next question type in same section
      const currentTabIndex = questionTypeTabs.findIndex(tab => tab.id === activeQuestionType);
      if (currentTabIndex < questionTypeTabs.length - 1) {
        const nextTab = questionTypeTabs[currentTabIndex + 1];
        setActiveQuestionType(nextTab.id);
        setCurrentQuestionIndex(0);
      }
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      // Move to previous question type in same section
      const currentTabIndex = questionTypeTabs.findIndex(tab => tab.id === activeQuestionType);
      if (currentTabIndex > 0) {
        const prevTab = questionTypeTabs[currentTabIndex - 1];
        setActiveQuestionType(prevTab.id);
        const prevQuestions = groupedQuestions[prevTab.id]?.questions || [];
        setCurrentQuestionIndex(prevQuestions.length - 1);
      }
    }
  };
  
  // Handle section tab click
  const handleSectionChange = (sectionType) => {
    setActiveSection(sectionType);
    setCurrentQuestionIndex(0); // Reset to first question of this section
    
    // Set first question type of the new section as active
    const newSection = examData.sections.find(s => s.type === sectionType);
    if (newSection && newSection.question_types.length > 0) {
      setActiveQuestionType(newSection.question_types[0].id);
    }
  };

  // Handle question type tab click
  const handleQuestionTypeChange = (questionTypeId) => {
    setActiveQuestionType(questionTypeId);
    setCurrentQuestionIndex(0); // Reset to first question of this type
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
      <div 
        className={`transition-transform duration-300 ${hideHeader ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <Navbar />
      </div>

      {/* Sticky Progress Bar - Shows when scrolling */}
      {showStickyProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Time Remaining */}
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-[#874FFF]">
                <span style={{ color: '#585858' }}>残りの時間:</span> {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-md mx-6">
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-3 transition-all duration-1000 ${getProgressBarColor()}`}
                  style={{ width: `${100 - progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitExam}
              className="px-4 py-2 rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-all text-sm"
            >
              Nộp bài
            </button>
          </div>
        </div>
      )}

      <main className={`flex-1 py-8 ${showStickyProgress ? 'pt-20' : ''} ${hideHeader ? 'pt-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header - Exam Info */}
          <div className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-5 mb-6">
            {/* Top row: back, tabs, submit */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg border-2 border-[#5427B4] text-[#5427B4] font-semibold hover:bg-[#5427B4] hover:text-white transition-all"
              >
                Quay lại
              </button>

              <div className="hidden md:flex items-center gap-2">
                {sectionTabs.map((tab, idx) => (
                  <button
                    key={`${tab}-${idx}`}
                    onClick={() => handleSectionChange(tab)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
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
                <button
                  onClick={handleSubmitExam}
                  className="px-5 py-2.5 rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-all"
                >
                  Nộp bài
                </button>
              </div>
            </div>

            {/* Title and level */}
            <div className="mt-4 flex items-center justify-center">
              <div className="text-center">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#3563E9] leading-tight">
                    {/* {examData.exam.level.title} */}
                    言語知識 {activeSection}
                  </h1>
                {/* <p className="text-base md:text-lg text-gray-600 mt-1">
                  {activeSection}
                </p> */}
              </div>
            </div>

            {/* Time Remaining - Below Title */}
            <div className="mt-2 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-[#874FFF]">
                  <span style={{ color: '#585858' }}>残りの時間 :</span> {formatTime(timeRemaining)}
                </div>
              </div>
            </div>

            {/* Progress Bar - Below Time */}
            <div className="mt-3 w-full">
              <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-2.5 transition-all duration-1000 ${getProgressBarColor()}`}
                  style={{ width: `${100 - progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Question Type Progress Bar */}
            {questionTypeTabs.length > 0 && (
              <div className="mt-6">
                <div 
                  ref={(el) => tabContainerRefs.current[activeSection] = el}
                  className={`flex gap-4 ${!expandedQuestionType[activeSection] ? 'grid' : ''}`}
                  style={!expandedQuestionType[activeSection] ? { gridTemplateColumns: `repeat(${questionTypeTabs.length}, 1fr)` } : {}}>
                  {questionTypeTabs.map((tab) => {
                    // Calculate answered questions count
                    const answeredCount = Array.from({ length: tab.questionCount }, (_, index) => {
                      const question = groupedQuestions[tab.id]?.questions[index];
                      return question ? (
                        question.questionTypeId === "QT007" 
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
                        {/* Tab button with top/bottom bar */}
                        <div className="flex flex-col items-center">
                          {/* Top bar (gray) - shown when not active */}
                          {!isActive && (
                            <div 
                              className="h-0.5 bg-gray-300 mb-2 transition-all" 
                              style={{ 
                                width: currentSectionExpanded 
                                  ? `${Math.min((collapsedTabWidths[activeSection] || 150) * 0.7, 100)}px`  // 70% of collapsed tab width or max 100px
                                  : '100%'  // Full width when no tab is expanded
                              }}
                            ></div>
                          )}
                          
                          {/* Tab text */}
                           <button
                             onClick={() => {
                               // Toggle expand/collapse per section
                               setExpandedQuestionType(prev => ({
                                 ...prev,
                                 [activeSection]: isActive ? null : tab.id
                               }));
                               
                               // Switch to this question type and go to first question
                               handleQuestionTypeChange(tab.id);
                               setCurrentQuestionIndex(0);
                            
                             }}
                            className={`text-sm font-medium whitespace-nowrap transition-all ${
                              isActive
                                ? "text-[#4169E1]"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                          >
                            {tab.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || tab.name} {answeredCount}/{tab.questionCount}
                          </button>
                          
                          {/* Bottom bar (blue) and question buttons - shown when active */}
                          {isActive && (
                            <>
                              <div 
                                className="h-0.5 bg-[#4169E1] mt-2 mb-3"
                                style={{ width: barWidths[tab.id] || '100%' }}
                              ></div>
                              <div 
                                id={`question-buttons-${tab.id}`}
                                className="flex gap-2 overflow-x-auto"
                              >
                                {Array.from({ length: tab.questionCount }, (_, index) => {
                                  const question = groupedQuestions[tab.id]?.questions[index];
                                  const isAnswered = question ? (
                                    question.questionTypeId === "QT007" 
                                      ? (answerOrder[question.id] && answerOrder[question.id].length > 0)
                                      : studentAnswers[question.id]
                                  ) : false;
                                  const isCurrent = tab.id === activeQuestionType && index === currentQuestionIndex;
                                  
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => {
                                        handleQuestionTypeChange(tab.id);
                                        setCurrentQuestionIndex(index);
                                        
                                        // Auto scroll to the specific question
                                        setTimeout(() => {
                                          const questionElement = document.getElementById(`question-${question.id}`);
                                          if (questionElement) {
                                            questionElement.scrollIntoView({ 
                                              behavior: 'smooth', 
                                              block: 'start' 
                                            });
                                          }
                                        }, 100);
                                      }}
                                      className={`w-10 h-10 text-sm font-semibold rounded transition-all ${
                                        isCurrent
                                          ? "bg-[#4169E1] text-white"
                                          : isAnswered
                                          ? "bg-green-500 text-white"
                                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                      }`}
                                    >
                                      {question?.position || index + 1}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Questions Container */}
          <div id="questions-container" className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-8">
            {/* Question Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 rounded-xl bg-[#FFD24D] text-[#1E1E1E] font-bold text-lg whitespace-nowrap">

                {(() => {
                  // Find the current active question type tab
                  const currentTab = questionTypeTabs.find(tab => tab.id === activeQuestionType);
                  return currentTab?.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || `問題 ${currentQuestionIndex + 1}`;
                })()} 
                {/* <span className="text-xs text-gray-500 ml-2">
                  (Debug: {currentQuestionIndex}/{filteredQuestions.length})
                </span>  */}
              </div>
              {currentQuestion?.taskInstructions && (
                <p 
                  className="text-xl font-bold text-[#0B1320] leading-relaxed cursor-pointer hover:text-[#4169E1] transition-colors break-words hyphens-auto"
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
                >
                  {currentQuestion.taskInstructions.replace(/^問題\s*[０-９0-9]+\s*[：:]\s*/, '')}
                </p>
              )}
            </div>

            {/* Display all questions of current type */}
            {filteredQuestions.map((question, questionIndex) => (
              <div 
                key={question.id} 
                id={`question-${question.id}`}
                className={`${questionIndex > 0 ? 'mt-8' : ''} scroll-mt-30`}
              >
                {/* Passage (if exists) */}
                {question.passage && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                    <p className="text-lg leading-relaxed text-gray-800">
                      {question.passage}
                    </p>
                  </div>
                )}

                {/* Question Text with leading square index */}
                <div className="mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 border-2 border-gray-300 rounded-md flex items-center justify-center text-base font-semibold text-gray-700 select-none">
                      {question.position}
                    </div>
                    <div className="text-xl font-normal text-[#0B1320] leading-relaxed">
                      {question.underline_text ? (
                        <>
                          {question.question_text.split(question.underline_text)[0].split('<enter>').map((part, index) => (
                            <span key={index}>
                              {part}
                              {index < question.question_text.split(question.underline_text)[0].split('<enter>').length - 1 && <br />}
                            </span>
                          ))}
                          <span className="underline decoration-2 underline-offset-4">
                            {question.underline_text.split('<enter>').map((part, index) => (
                              <span key={index}>
                                {part}
                                {index < question.underline_text.split('<enter>').length - 1 && <br />}
                              </span>
                            ))}
                          </span>
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

                {/* Answer Tray for QT007 */}
                {question.questionTypeId === "QT007" && (
                  <div className="mb-8">
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
                                onClick={() => handleAnswerSelect(question.id, answerId, question.questionTypeId)}
                              >
                                <span className="w-8 h-8 bg-[#874FFF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  {index + 1}
                                </span>
                                <span className="text-gray-800 font-medium">
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

                {/* Answer Options - Horizontal for first 4 question types of section 1, vertical for others */}
                <div className={activeSection.trim() === '(文字・語彙)' && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < 4 ? "grid grid-cols-4 gap-3" : question.questionTypeId === "QT007" ? "grid grid-cols-4 gap-3" : "space-y-2"}>
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
                        })().filter((answer) => {
                          // For QT007, only show answers that are not in the tray
                          if (question.questionTypeId === "QT007") {
                            const selectedAnswers = answerOrder[question.id] || [];
                            return !selectedAnswers.includes(answer.id);
                          }
                          return true;
                        }).map((answer) => {
                          const isSelected = isAnswerSelected(question.id, answer.id, question.questionTypeId);
                          const orderNumber = getAnswerOrder(question.id, answer.id);
                          
                          return (
                            <label
                              key={answer.id}
                              className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all ${
                                activeSection.trim() === '(文字・語彙)' && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < 4
                                  ? "flex-row"
                                  : question.questionTypeId === "QT007"
                                  ? "flex-row"
                                  : "flex-row"
                              } ${
                                isSelected
                                  ? question.questionTypeId === "QT007"
                                    ? "border-[#874FFF] bg-purple-50 opacity-60"
                                    : "border-[#874FFF] bg-purple-50"
                                  : "border-gray-300 hover:border-[#874FFF]/60 hover:bg-gray-50"
                              }`}
                            >
                              {/* custom radio or order number */}
                              <input
                                type={question.questionTypeId === "QT007" ? "checkbox" : "radio"}
                                name={`question-${question.id}`}
                                value={answer.id}
                                checked={isSelected}
                                onChange={() => handleAnswerSelect(question.id, answer.id, question.questionTypeId)}
                                className="hidden"
                              />
                              {question.questionTypeId === "QT007" ? (
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
                              <span className="ml-3 text-base font-medium text-gray-800">
                                {formatAnswerText(answer.answer_text, question.question_text, question.questionTypeId)}
                              </span>
                              {question.questionTypeId === "QT007" && (
                                <span className="ml-auto text-xs text-gray-500">(Click để chọn)</span>
                              )}
                            </label>
                          );
                    })
                  ) : (
                    <p className="text-gray-500">Không có đáp án</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) === 0}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                currentQuestionIndex === 0 && questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white border-2 border-[#5427B4] text-[#5427B4] hover:bg-[#5427B4] hover:text-white"
              }`}
            >
              ← Quay lại
            </button>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitExam}
                className="px-8 py-3 rounded-lg border-2 border-red-500 text-red-500 font-semibold text-lg hover:bg-red-500 hover:text-white transition-all"
              >
                NỘP BÀI
              </button>

              {(currentQuestionIndex < filteredQuestions.length - 1 || 
                questionTypeTabs.findIndex(tab => tab.id === activeQuestionType) < questionTypeTabs.length - 1) ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-lg bg-[#874FFF] text-white font-semibold text-lg hover:bg-[#7a46ea] transition-all border-2 border-[#5427B4]"
                >
                  Câu tiếp theo →
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-8 py-3 rounded-lg bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition-all"
                >
                  HOÀN THÀNH ✓
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}