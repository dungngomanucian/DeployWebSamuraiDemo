// src/hooks/exam/useExamTimers.js
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook tùy chỉnh để quản lý tất cả logic timer cho bài thi.
 * @param {number} totalExamSeconds - Tổng thời gian (giây) cho 2 phần đầu.
 * @param {boolean} isExamDataLoaded - Cờ báo hiệu dữ liệu thi đã tải xong.
 * @param {object} currentQuestion - Object câu hỏi hiện tại (để theo dõi timer câu hỏi).
 * @param {object} groupedQuestions - Object các nhóm câu hỏi (để lấy duration).
 * @param {string} activeQuestionType - ID của loại câu hỏi hiện tại.
 */
export const useExamTimers = (
  totalExamSeconds, 
  isExamDataLoaded,
  currentQuestion,
  groupedQuestions,
  activeQuestionType
) => {
  // === 1. Timer Tổng (Global Timer) ===
  const [timeRemaining, setTimeRemaining] = useState(totalExamSeconds);
  const [showReadingTimeUpModal, setShowReadingTimeUpModal] = useState(false);
  const timerRef = useRef(null);

  // Khởi tạo timer tổng khi dữ liệu sẵn sàng
  useEffect(() => {
    // Chỉ set khi totalExamSeconds > 0 và timeRemaining chưa được set
    if (isExamDataLoaded && totalExamSeconds > 0 && timeRemaining === 0) {
      setTimeRemaining(totalExamSeconds);
    }
  }, [isExamDataLoaded, totalExamSeconds]); // Tách riêng logic set time

  // Chạy đồng hồ đếm ngược tổng
  useEffect(() => {
    // Chỉ chạy khi đã load xong và có thời gian
    if (!isExamDataLoaded || timeRemaining <= 0) {
      // Đảm bảo dừng timer nếu timeRemaining bị set về 0 từ bên ngoài
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowReadingTimeUpModal(true); // Hiển thị modal hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isExamDataLoaded, timeRemaining]); // Phụ thuộc vào timeRemaining


  // === 2. Timer Câu hỏi (Question Timer) ===
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState({});
  const questionTimerRef = useRef(null);
  const toastShownRef = useRef({});

  // Chạy đồng hồ đếm ngược cho câu hỏi hiện tại
  useEffect(() => {
    // Luôn dọn dẹp timer cũ khi effect này chạy lại
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    const currentQuestionType = groupedQuestions[activeQuestionType];
    const duration = currentQuestionType?.type?.duration;

    if (!duration || !currentQuestion) {
      return; // Không có duration hoặc không có câu hỏi -> không làm gì
    }

    // Xác định xem có nên dùng timer cho câu này không
    const shouldUsePagination = Boolean(duration) && (currentQuestion.passage || currentQuestion.jlpt_question_passages);
    
    if (shouldUsePagination) {
      // Khởi tạo timer nếu chưa có
      if (questionTimeRemaining[currentQuestion.id] === undefined) {
        const durationStr = duration.replace('00:', '');
        const [minutes, seconds] = durationStr.split(':').map(Number);
        const totalSeconds = (minutes * 60) + seconds;
        
        setQuestionTimeRemaining(prev => ({
          ...prev,
          [currentQuestion.id]: totalSeconds
        }));
      }

      // Bắt đầu đếm ngược
      questionTimerRef.current = setInterval(() => {
        setQuestionTimeRemaining((prev) => {
          const currentTime = prev[currentQuestion.id];
          
          // Kiểm tra nếu state chưa sẵn sàng (vừa được set ở trên)
          if (currentTime === undefined) {
            return prev; 
          }

          if (currentTime <= 1) {
            clearInterval(questionTimerRef.current);
            questionTimerRef.current = null;
            
            if (currentTime === 1 && !toastShownRef.current[currentQuestion.id]) {
              toast('Bạn đã hết thời gian làm cho câu hỏi này. Bạn nên chuyển sang câu tiếp theo.');
              toastShownRef.current[currentQuestion.id] = true;
            }
            return { ...prev, [currentQuestion.id]: 0 };
          }
          return { ...prev, [currentQuestion.id]: currentTime - 1 };
        });
      }, 1000);
    }

    // Dọn dẹp khi component unmount hoặc khi dependecies thay đổi
    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
    
  }, [currentQuestion, activeQuestionType, groupedQuestions]); // Chỉ chạy khi câu hỏi hoặc loại câu hỏi thay đổi

  // === 3. Reset (khi đổi tab) ===
  const resetQuestionToast = () => {
    toastShownRef.current = {};
  };

  // === 4. Trả về State và Hàm ===
  return {
    // Timer tổng
    timeRemaining,
    showReadingTimeUpModal,
    setShowReadingTimeUpModal,
    stopGlobalTimer: () => clearInterval(timerRef.current), // Hàm để dừng timer khi nộp bài

    // Timer câu hỏi
    questionTimeRemaining,
    resetQuestionToast,
    stopQuestionTimer: () => clearInterval(questionTimerRef.current) // Hàm để dừng timer khi nộp bài
  };
};