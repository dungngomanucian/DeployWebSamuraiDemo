import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { submitListeningExam } from "../../../api/examService";
import ExamCertificateOverlay from "../../../components/JLPTCertificateOverlay";
import { Toaster } from "react-hot-toast";
import TimeUpModal from "../../../components/Exam/TimeUpModal";
import { API_BASE_URL } from "../../../config/apiConfig";

import {
  Underline,
  formatAnswerText,
  formatTime
} from "../../../components/Exam/ExamRenderUtils";
import { useExamTimers } from "../../../hooks/exam/useExamTimers";
import { useExamState } from "../../../hooks/exam/useExamState";
import ExamHeader from "../../../components/Exam/ExamHeader";

export default function ListeningPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const examId = params.get("examId");

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionType, setActiveQuestionType] = useState(null);
  const [expandedQuestionType, setExpandedQuestionType] = useState({});
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [currentQuestionPage, setCurrentQuestionPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [finalResultData, setFinalResultData] = useState(null);
  
  const userSelectedSectionRef = useRef(false);
  
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const audioBlobUrlRef = useRef(null);
  const audioSetupDoneRef = useRef(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [hasStartedListening, setHasStartedListening] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioLoadingProgress, setAudioLoadingProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [postAudioCountdown, setPostAudioCountdown] = useState(null);
  const countdownIntervalRef = useRef(null);
  const hasAutoSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const savedAudioTimeRef = useRef(null);
  const hasCheckedResumeRef = useRef(false);
  const [hasSavedTime, setHasSavedTime] = useState(false);
  const isMountedRef = useRef(true);
  const examDataAbortControllerRef = useRef(null);
  
  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const clearPostAudioCountdown = useCallback(() => {
    clearCountdownInterval();
    setPostAudioCountdown(null);
  }, [clearCountdownInterval]);

  const startPostAudioCountdownRef = useRef(() => {});
  
  const startPostAudioCountdown = useCallback(() => {
    if (isSubmittingRef.current || hasAutoSubmittedRef.current) {
      return;
    }

    setPostAudioCountdown((prev) => {
      if (prev !== null) return prev;

      clearCountdownInterval();

      countdownIntervalRef.current = setInterval(() => {
        setPostAudioCountdown((count) => {
          if (count === null) return count;
          if (count <= 1) {
            clearCountdownInterval();
            return 0;
          }
          return count - 1;
        });
      }, 1000);

      return 30;
    });
  }, [clearCountdownInterval]);

  useEffect(() => {
    startPostAudioCountdownRef.current = startPostAudioCountdown;
  }, [startPostAudioCountdown]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    return () => {
      clearCountdownInterval();
    };
  }, [clearCountdownInterval]);

  // Lưu mốc thời gian audio vào localStorage
  useEffect(() => {
    if (!examId || !audioRef.current || !hasStartedListening) return;

    const storageKey = `listening_audio_time_${examId}`;
    
    const saveAudioTime = () => {
      if (audioRef.current && !audioRef.current.ended && !isSubmitting) {
        const currentTime = audioRef.current.currentTime;
        localStorage.setItem(storageKey, JSON.stringify({
          currentTime,
          timestamp: Date.now()
        }));
      }
    };

    // Lưu mỗi giây
    const interval = setInterval(saveAudioTime, 1000);

    // Lưu khi component unmount
    return () => {
      clearInterval(interval);
      saveAudioTime();
    };
  }, [examId, hasStartedListening, isSubmitting]);

  // Khôi phục mốc thời gian khi load lại trang
  useEffect(() => {
    if (!examId || !audioRef.current || hasStartedListening || loading || isAudioLoading || audioDuration === 0 || hasCheckedResumeRef.current) {
      return;
    }

    hasCheckedResumeRef.current = true;
    const storageKey = `listening_audio_time_${examId}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (!savedData) return;
    
    try {
      const { currentTime, timestamp } = JSON.parse(savedData);
      const isValid = timestamp && (Date.now() - timestamp) < 3600000;
      
      if (isValid && currentTime > 0 && currentTime < audioDuration) {
        savedAudioTimeRef.current = currentTime;
        setHasSavedTime(true);
        setAudioCurrentTime(currentTime);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Error parsing saved audio time:', error);
      localStorage.removeItem(storageKey);
    }
  }, [examId, hasStartedListening, loading, isAudioLoading, audioDuration]);

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
    resetQuestionToast,
    stopQuestionTimer
  } = useExamTimers(
    totalTime, 
    !loading && !!examData, // isExamDataLoaded
    currentQuestion,
    groupedQuestions,
    activeQuestionType
  );

  const {
    studentAnswers,
    handleAnswerSelect,
    isAnswerSelected
  } = useExamState();

  useEffect(() => {
    isMountedRef.current = true;
    
    const loadExamData = async () => {
      if (!examId) {
        if (isMountedRef.current) {
          navigate("/mock-exam-jlpt");
        }
        return;
      }

      // Hủy request trước đó nếu có
      if (examDataAbortControllerRef.current) {
        examDataAbortControllerRef.current.abort();
      }

      // Tạo AbortController mới cho request này
      const abortController = new AbortController();
      examDataAbortControllerRef.current = abortController;

      // Reset các ref khi load exam mới
      hasCheckedResumeRef.current = false;
      savedAudioTimeRef.current = null;
      if (isMountedRef.current) {
        setHasSavedTime(false);
      }

      if (isMountedRef.current) {
        setLoading(true);
      }

      try {
        // Tạo một wrapper để hỗ trợ AbortController
        const fetchWithAbort = async () => {
          const token = localStorage.getItem('auth_token');
          const endpoint = `/student/exam/exams/${examId}/full_data/`;
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            signal: abortController.signal,
          });

          if (!response.ok) {
            let errorDetails = 'API request failed';
            try {
              const errorBody = await response.json();
              errorDetails = errorBody.error || errorBody.detail || errorBody.message || JSON.stringify(errorBody);
            } catch (e) {
              errorDetails = `HTTP Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorDetails);
          }

          const contentLength = response.headers.get('content-length');
          if (response.status === 204 || (contentLength !== null && parseInt(contentLength) === 0)) {
            return { data: null, error: null };
          }

          const data = await response.json();
          return { data, error: null };
        };

        const { data, error } = await fetchWithAbort();

        // Kiểm tra xem component còn mount và request chưa bị hủy
        if (!isMountedRef.current || abortController.signal.aborted) {
          return;
        }

        if (error) {
          // Bỏ qua nếu request bị hủy
          if (abortController.signal.aborted) {
            return;
          }
          console.error("Error loading exam:", error);
          if (isMountedRef.current) {
            setLoading(false);
            alert("Không thể tải dữ liệu đề thi. Vui lòng thử lại!");
            navigate(-1);
          }
          return;
        }

        if (!data) {
          if (isMountedRef.current) {
            setLoading(false);
            alert("Không thể tải dữ liệu đề thi. Vui lòng thử lại!");
            navigate(-1);
          }
          return;
        }

        const listeningSections = data.sections?.filter(section => section.is_listening === true) || [];
        // Chỉ lấy section listening (nên chỉ có 1 section is_listening = true)
        const filteredData = { ...data, sections: listeningSections };
        
        if (isMountedRef.current && !abortController.signal.aborted) {
          setExamData(filteredData);
          
          const totalMinutesFromSections = listeningSections.length > 0
            ? listeningSections.reduce((sum, section) => sum + (Number(section?.duration) || 0), 0)
            : 0;
          const totalSeconds = totalMinutesFromSections * 60;
          setTotalTime(totalSeconds);
          
          const grouped = {};
          listeningSections.forEach((section) => {
            section.question_types?.forEach((qt) => {
              if (!grouped[qt.id]) {
                grouped[qt.id] = {
                  type: qt,
                  questions: [],
                  sectionType: section.type,
                  sectionId: section.id
                };
              }
              qt.questions?.forEach((q) => {
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
          
          if (listeningSections && listeningSections.length > 0 && !userSelectedSectionRef.current) {
            const firstSectionType = listeningSections[0].type;
            setActiveSection(firstSectionType);
            const firstQuestionType = listeningSections[0].question_types?.[0];
            if (firstQuestionType) {
              setActiveQuestionType(firstQuestionType.id);
              setExpandedQuestionType({
                [firstSectionType]: firstQuestionType.id
              });
            }
          }
          
          setLoading(false);
        }
      } catch (err) {
        // Bỏ qua lỗi nếu request bị hủy hoặc component đã unmount
        if (err.name === 'AbortError' || !isMountedRef.current) {
          return;
        }
        
        console.error("Unexpected error loading exam:", err);
        if (isMountedRef.current) {
          setLoading(false);
          alert("Không thể tải dữ liệu đề thi. Vui lòng thử lại!");
          navigate(-1);
        }
      }
    };
    
    loadExamData();

    // Cleanup: hủy request và đánh dấu component đã unmount
    return () => {
      isMountedRef.current = false;
      if (examDataAbortControllerRef.current) {
        examDataAbortControllerRef.current.abort();
        examDataAbortControllerRef.current = null;
      }
    };
  }, [examId, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowStickyProgress(scrollTop > 200);
      setHideHeader(scrollTop > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const autoSubmitCountdownDisplay = postAudioCountdown !== null ? formatTime(postAudioCountdown, true) : null;

  const getQuestionImageUrl = (questionImagePath) => {
    if (!questionImagePath || !examData) return null;
    
    const levelId = examData?.exam?.level_id || '';
    const match = /^level0([1-5])$/.exec(levelId);
    const bucket = match ? `N${match[1]}` : null;
    
    if (!bucket) return null;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oreasnlyzhaeteipyylw.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${questionImagePath}`;
  };

  const hasPictures = () => {
    if (!activeQuestionType || !groupedQuestions[activeQuestionType]) return false;
    return groupedQuestions[activeQuestionType]?.type?.have_pictures === true;
  };

  const QuestionImage = ({ question }) => {
    if (!hasPictures() || !question?.question_image) return null;
    return (
      <div className="mb-6 flex justify-center">
        <img
          src={getQuestionImageUrl(question.question_image)}
          alt={`Question ${question.id}`}
          className="max-w-full h-auto rounded-lg shadow-md"
          style={{ maxHeight: '400px' }}
          onError={(e) => {
            console.error('Error loading question image:', question.question_image);
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  };

  const AnswerOption = ({ question, answer }) => {
    const isSelected = isAnswerSelected(question.id, answer.id, question.questionTypeId);
    return (
      <label
        className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? "border-[#874FFF] bg-purple-50"
            : "border-gray-300 hover:border-[#874FFF]/60 hover:bg-gray-50"
        }`}
      >
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
  };
  
  useEffect(() => {
    if (audioSetupDoneRef.current || !examData || loading) {
      return;
    }
    
    const listeningSection = examData.sections?.find(s => s.is_listening === true);
    const audioPath = listeningSection?.audio_path;
    
    if (!audioPath) {
      audioSetupDoneRef.current = true;
      return;
    }
    
    const levelId = examData?.exam?.level_id || '';
    const match = /^level0([1-5])$/.exec(levelId);
    const bucket = match ? `N${match[1]}` : null;
    
    if (!bucket) {
      audioSetupDoneRef.current = true;
      return;
    }
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oreasnlyzhaeteipyylw.supabase.co';
    const audioUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${audioPath}`;
    
    if (audioUrlRef.current === audioUrl && audioRef.current) {
      return;
    }
    
    audioUrlRef.current = audioUrl;
    audioSetupDoneRef.current = true;
    setIsAudioLoading(true);
    setAudioLoadingProgress(0);
    
    const controller = new AbortController();
    
    fetch(audioUrl, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        
        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }
        
        const reader = response.body.getReader();
        const chunks = [];
        let receivedLength = 0;
        
        const pump = () => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              const blob = new Blob(chunks, { type: 'audio/mpeg' });
              const blobUrl = URL.createObjectURL(blob);
              audioBlobUrlRef.current = blobUrl;
              
              const audio = new Audio(blobUrl);
              audio.preload = 'auto';
              audio.volume = 0.5;

              const handleLoadedMetadata = () => {
                setAudioDuration(audio.duration);
                setIsAudioLoading(false);
                setAudioLoadingProgress(100);
              };

              const handleTimeUpdate = () => {
                setAudioCurrentTime(audio.currentTime);
              };

              const handleEnded = () => {
                // Xóa mốc thời gian đã lưu khi audio kết thúc
                if (examId) {
                  const storageKey = `listening_audio_time_${examId}`;
                  localStorage.removeItem(storageKey);
                }
                startPostAudioCountdownRef.current();
              };

              const handleError = (e) => {
                console.error('Audio error:', e);
                setIsAudioLoading(false);
              };
              
              audio.addEventListener('loadedmetadata', handleLoadedMetadata);
              audio.addEventListener('timeupdate', handleTimeUpdate);
              audio.addEventListener('ended', handleEnded);
              audio.addEventListener('error', handleError);
              
              audioRef.current = audio;
              
              return;
            }
            
            chunks.push(value);
            receivedLength += value.length;
            
            if (total > 0) {
              const progress = Math.round((receivedLength / total) * 100);
              setAudioLoadingProgress(progress);
            }
            
            return pump();
          });
        };
        
        return pump();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('Audio loading aborted');
        } else {
          console.error('Error loading audio:', error);
          setIsAudioLoading(false);
          setAudioLoadingProgress(0);
          audioSetupDoneRef.current = false;
        }
      });

    return () => {
      controller.abort();
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
        audioBlobUrlRef.current = null;
      }
      if (audioRef.current) {
        const currentAudio = audioRef.current;
        currentAudio.pause();
        currentAudio.src = '';
        audioRef.current = null;
      }
      audioUrlRef.current = null;
      audioSetupDoneRef.current = false;
      setIsAudioLoading(false);
      setAudioLoadingProgress(0);
    };
  }, [loading]);
  
  useEffect(() => {
    // Không auto-play nếu đã có mốc thời gian đã lưu
    if (!audioRef.current || hasStartedListening || loading || isAudioLoading || hasSavedTime) {
      return;
    }
    
    const autoPlayTimer = setTimeout(() => {
      if (!hasStartedListening && audioRef.current && !isAudioLoading && !hasSavedTime) {
        audioRef.current.play().catch(err => {
          console.error('Error auto-playing audio:', err);
        });
        setHasStartedListening(true);
      }
    }, 10000);
    
    return () => clearTimeout(autoPlayTimer);
  }, [hasStartedListening, loading, isAudioLoading, hasSavedTime]);

  useEffect(() => {
    if (!audioRef.current || !hasStartedListening || isSubmitting || hasAutoSubmittedRef.current) {
      return;
    }

    const checkAudio = setInterval(() => {
      if (isSubmitting || hasAutoSubmittedRef.current) {
        return;
      }
      
      if (audioRef.current && hasStartedListening && audioRef.current.paused && !audioRef.current.ended) {
        if (audioRef.current.currentTime > 0) {
          audioRef.current.play().catch(err => {
            console.error('Error resuming audio:', err);
          });
        }
      }
    }, 1000);

    return () => clearInterval(checkAudio);
  }, [hasStartedListening, isSubmitting]);
  
  const handleSectionChange = (sectionType) => {
    return;
  };

  const handleQuestionTypeChange = (questionTypeId) => {
    if (!examData) return;
    
    setActiveQuestionType(questionTypeId);
    
    setExpandedQuestionType(prev => ({
      ...prev,
      [activeSection]: prev[activeSection] === questionTypeId ? null : questionTypeId
    }));
    
    const newQuestions = groupedQuestions[questionTypeId]?.questions || [];
    const uniqueNewQuestions = newQuestions.filter((question, index, self) => 
      index === self.findIndex(q => q.id === question.id)
    );
    
    if (uniqueNewQuestions.length > 0) {
      const shouldUsePaginationNew = 
        groupedQuestions[questionTypeId]?.type?.duration &&
        (uniqueNewQuestions[0].passage || uniqueNewQuestions[0].jlpt_question_passages);
      
      if (shouldUsePaginationNew) {
        if (currentQuestionPage >= uniqueNewQuestions.length) {
          setCurrentQuestionPage(0);
        }
      } else {
        if (currentQuestionIndex >= uniqueNewQuestions.length) {
          setCurrentQuestionIndex(0);
        }
      }
    } else {
      setCurrentQuestionPage(0);
      setCurrentQuestionIndex(0);
    }
    
    resetQuestionToast();
  };

  const handleStartListening = () => {
    if (!audioRef.current) return;
    
    const savedTime = savedAudioTimeRef.current;
    const startTime = savedTime !== null ? savedTime : 0;
    
    // Xóa mốc thời gian đã lưu nếu bắt đầu từ đầu
    if (startTime === 0 && examId) {
      localStorage.removeItem(`listening_audio_time_${examId}`);
    }
    
    savedAudioTimeRef.current = null;
    setHasSavedTime(false);
    
    audioRef.current.currentTime = startTime;
    setAudioCurrentTime(startTime);
    
    audioRef.current.play().then(() => {
      setHasStartedListening(true);
    }).catch(err => {
      console.error('Error playing audio:', err);
      setHasStartedListening(true);
    });
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const TimerProgressBar = () => { 
    const remainingTime = audioDuration > 0 ? audioDuration - audioCurrentTime : 0;
    const progressPercentage = audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;
    
    return (
      <div className="flex items-center justify-center gap-4 w-full">
        {isAudioLoading && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#4169E1] border-t-transparent"></div>
            <span className="text-sm font-semibold text-[#4169E1]" style={{fontFamily: "Nunito"}}>
              Đang tải audio... {audioLoadingProgress}%
            </span>
          </div>
        )}
        
        {!hasStartedListening && !isAudioLoading && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleStartListening();
            }}
            disabled={!audioRef.current || isAudioLoading}
            className="flex-shrink-0 px-4 h-5 rounded-lg bg-[#4169E1] text-white text-sm font-semibold hover:bg-[#3558C9] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            style={{fontFamily: "Nunito"}}
          >
            {hasSavedTime ? 'Tiếp tục phát' : 'Bắt đầu nghe'}
          </button>
        )}
        
        <div className="relative" style={{ width: '400px' }}>
          <div className="w-full h-5 rounded-full bg-gray-200 overflow-hidden relative">
            <div
              className="h-5 transition-all duration-300 relative"
              style={{ width: `${100 - progressPercentage}%`, backgroundColor: '#66D575' }}
            >
              <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="#006C0F" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M10 1.667a8.333 8.333 0 1 0 0 16.666A8.333 8.333 0 0 0 10 1.667z"/>
                  <path fillRule="evenodd" clipRule="evenodd" fill="#ffffff" d="M10.625 5.5a.625.625 0 1 0-1.25 0v4.208c0 .166.066.325.184.442l2.5 2.5a.625.625 0 1 0 .884-.884l-2.318-2.318V5.5z"/>
                </svg>
                <span className="text-sm font-semibold" style={{ color: '#00620D', fontFamily: "Nunito" }}>
                  {formatTime(Math.floor(remainingTime))}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-start gap-1 ml-2">
          <span className="text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Nunito', color: '#000000' }}>
            Âm lượng
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onInput={handleVolumeChange}
            onChange={handleVolumeChange}
            className="volume-slider w-20 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #969696 0%, #969696 ${volume * 100}%, #D9D9D9 ${volume * 100}%, #D9D9D9 100%)`
            }}
          />
        </div>
      </div>
    );
  };

  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting) return;

    hasAutoSubmittedRef.current = true;
    clearPostAudioCountdown();

    // Xóa mốc thời gian đã lưu khi submit
    if (examId) {
      const storageKey = `listening_audio_time_${examId}`;
      localStorage.removeItem(storageKey);
    }

    savedAudioTimeRef.current = null;
    setHasSavedTime(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setHasStartedListening(false);
    }

    setIsSubmitting(true);
    stopGlobalTimer(); 
    stopQuestionTimer();
    
    const duration_taken = totalTime - timeRemaining;

    const answersList = [];
    Object.keys(studentAnswers).forEach(qId => {
      const answerData = studentAnswers[qId];
      
      if (Array.isArray(answerData)) {
        answerData.forEach((answerId, index) => {
          answersList.push({
            exam_question_id: qId,
            chosen_answer_id: answerId,
            position: index + 1
          });
        });
      } else if (answerData) {
        answersList.push({
          exam_question_id: qId,
          chosen_answer_id: answerData,
          position: 1
        });
      }
    });

    const exam_result_id = localStorage.getItem('exam_result_id');
    if (!exam_result_id) {
      alert('Không tìm thấy exam_result_id. Vui lòng làm lại phần thi đọc trước.');
      setIsSubmitting(false);
      return;
    }

    const submissionData = {
      exam_result_id: exam_result_id,
      duration: duration_taken,
      answers: answersList
    };

    const { data: resultData, error } = await submitListeningExam(examId, submissionData);

    setIsSubmitting(false);

    if (error) {
      console.error("Lỗi khi nộp bài listening:", error);
      alert(`Nộp bài listening thất bại: ${error}`);
    } else {
      setFinalResultData(resultData);
      localStorage.removeItem('exam_result_id');
      setShowCertificate(true);
    }
  }, [
    isSubmitting,
    clearPostAudioCountdown,
    stopGlobalTimer,
    stopQuestionTimer,
    totalTime,
    timeRemaining,
    studentAnswers,
    examId
  ]);

  useEffect(() => {
    if (postAudioCountdown === 0 && !isSubmitting && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      handleSubmitExam();
    }
  }, [postAudioCountdown, isSubmitting, handleSubmitExam]);

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

      {showStickyProgress && (
        <>
          <ExamHeader
            isSticky={true}
            examData={examData}
            activeSection={activeSection}
            activeQuestionType={activeQuestionType}
            questionTypeTabs={questionTypeTabs}
            groupedQuestions={groupedQuestions}
            studentAnswers={studentAnswers}
            answerOrder={{}}
            currentQuestionIndex={currentQuestionIndex}
            currentQuestionPage={currentQuestionPage}
            isSubmitting={isSubmitting}
            onSectionChange={handleSectionChange}
            onQuestionTypeChange={handleQuestionTypeChange}
            onSubmitExam={handleSubmitExam}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setCurrentQuestionPage={setCurrentQuestionPage}
            TimerProgressBarComponent={TimerProgressBar}
            expandedQuestionType={expandedQuestionType}
            showSectionTabs={false}
            titleInFirstRow={false}
            stickyBackButton={true}
            autoSubmitCountdownDisplay={autoSubmitCountdownDisplay}
          />
        </>
      )}

      <main className={`flex-1 py-8 ${showStickyProgress ? 'pt-44' : ''} ${hideHeader ? 'pt-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-6">
          {!showStickyProgress && (
            <ExamHeader
              isSticky={false}
              examData={examData}
              activeSection={activeSection}
              activeQuestionType={activeQuestionType}
              questionTypeTabs={questionTypeTabs}
              groupedQuestions={groupedQuestions}
              studentAnswers={studentAnswers}
              answerOrder={{}}
              currentQuestionIndex={currentQuestionIndex}
              currentQuestionPage={currentQuestionPage}
              isSubmitting={isSubmitting}
              onSectionChange={handleSectionChange}
              onQuestionTypeChange={handleQuestionTypeChange}
              onSubmitExam={handleSubmitExam}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              setCurrentQuestionPage={setCurrentQuestionPage}
              TimerProgressBarComponent={TimerProgressBar}
              expandedQuestionType={expandedQuestionType}
              showSectionTabs={false}
              titleInFirstRow={true}
              autoSubmitCountdownDisplay={autoSubmitCountdownDisplay}
            />
          )}

          <div id="questions-container" className="bg-white rounded-2xl shadow-md px-6 md:px-8 py-8 mt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="px-4 py-2 rounded-xl bg-[#FFD24D] text-[#1E1E1E] font-bold text-lg whitespace-nowrap">
                  {(() => {
                    const currentTab = questionTypeTabs.find(tab => tab.id === activeQuestionType);
                    return currentTab?.taskInstructions?.match(/問題\s*[０-９0-9]+/)?.[0] || `問題 ${currentQuestionIndex + 1}`;
                  })()} 
                </div>
                {currentQuestion?.taskInstructions && (
                <p 
                  className="text-xl font-normal text-[#0B1320] leading-relaxed cursor-pointer hover:text-[#4169E1] transition-colors break-words hyphens-auto"
                  onClick={() => {
                    setExpandedQuestionType(prev => ({
                      ...prev,
                      [activeSection]: expandedQuestionType[activeSection] === currentQuestion.questionTypeId ? null : currentQuestion.questionTypeId
                    }));
                    
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

            {(() => {
              if (shouldUsePagination) {
                const safePageIndex = Math.min(currentQuestionPage, filteredQuestions.length - 1);
                const currentQuestion = filteredQuestions[safePageIndex];
                
                if (!currentQuestion) {
                  return <div className="text-center py-8 text-gray-500">Không tìm thấy câu hỏi</div>;
                }
                
                return (
                  <div key={currentQuestion.id} id={`question-${currentQuestion.id}`} className="scroll-mt-30" style={{ scrollMarginTop: '90px' }}>
                    <QuestionImage question={currentQuestion} />
                    
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
                            }).map((answer) => (
                              <AnswerOption key={answer.id} question={currentQuestion} answer={answer} />
                            ))
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
                style={{ scrollMarginTop: '10px' }}
              >
                <QuestionImage question={question} />

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
                        })().map((answer) => (
                          <AnswerOption key={answer.id} question={question} answer={answer} />
                        ))
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

      <TimeUpModal
        show={showReadingTimeUpModal}
        onClose={() => setShowReadingTimeUpModal(false)}
        onAction={() => {
          setShowReadingTimeUpModal(false);
          navigate('/listening-intro');
        }}
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