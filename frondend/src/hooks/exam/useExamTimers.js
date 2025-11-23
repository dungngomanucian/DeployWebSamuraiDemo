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
  activeQuestionType,
  examId = null // Thêm examId để lưu/khôi phục timer
) => {
  // === 1. Timer Tổng (Global Timer) ===
  const [timeRemaining, setTimeRemaining] = useState(totalExamSeconds);
  const [showReadingTimeUpModal, setShowReadingTimeUpModal] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Khởi tạo timer tổng khi dữ liệu sẵn sàng - với khôi phục từ localStorage
  useEffect(() => {
    if (!isExamDataLoaded || totalExamSeconds <= 0 || hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    // Thử khôi phục timer từ localStorage
    if (examId) {
      const storageKey = `exam_timer_${examId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const { startTime, totalTime } = JSON.parse(savedData);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, totalTime - elapsedSeconds);
          
          // Chỉ khôi phục nếu timer chưa hết (còn ít nhất 1 giây)
          if (remaining > 0 && elapsedSeconds < totalTime) {
            setTimeRemaining(remaining);
            startTimeRef.current = startTime;
            return;
          } else {
            // Timer đã hết, xóa dữ liệu đã lưu
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          console.error('Error parsing saved timer:', error);
          localStorage.removeItem(storageKey);
        }
      }
    }

    // Nếu không có dữ liệu đã lưu, khởi tạo timer mới
    setTimeRemaining(totalExamSeconds);
    const now = Date.now();
    startTimeRef.current = now;
    
    // Lưu startTime vào localStorage
    if (examId) {
      const storageKey = `exam_timer_${examId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        startTime: now,
        totalTime: totalExamSeconds
      }));
    }
  }, [isExamDataLoaded, totalExamSeconds, examId]);

  // Chạy đồng hồ đếm ngược tổng
  useEffect(() => {
    // Chỉ chạy khi đã load xong và có thời gian
    if (!isExamDataLoaded || !startTimeRef.current) {
      // Đảm bảo dừng timer nếu không có startTime
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Cập nhật timer dựa trên thời gian thực tế đã trôi qua
    const updateTimer = () => {
      if (!startTimeRef.current) return;
      
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalExamSeconds - elapsedSeconds);
      
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeRemaining(0);
        setShowReadingTimeUpModal(true);
        
        // Xóa dữ liệu đã lưu khi timer hết
        if (examId) {
          localStorage.removeItem(`exam_timer_${examId}`);
        }
      } else {
        setTimeRemaining(remaining);
        
        // Cập nhật localStorage mỗi giây (chỉ khi còn thời gian)
        if (examId && remaining > 0) {
          const storageKey = `exam_timer_${examId}`;
          localStorage.setItem(storageKey, JSON.stringify({
            startTime: startTimeRef.current,
            totalTime: totalExamSeconds
          }));
        }
      }
    };

    // Chạy ngay lập tức để sync với thời gian thực
    updateTimer();
    
    // Sau đó chạy mỗi giây
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isExamDataLoaded, totalExamSeconds, examId]); // Bỏ timeRemaining khỏi dependencies để tránh re-render


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

  // === 4. Hàm dừng timer và xóa dữ liệu đã lưu ===
  const stopGlobalTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Xóa dữ liệu timer đã lưu khi nộp bài
    if (examId) {
      localStorage.removeItem(`exam_timer_${examId}`);
    }
  };

  // === 5. Trả về State và Hàm ===
  return {
    // Timer tổng
    timeRemaining,
    showReadingTimeUpModal,
    setShowReadingTimeUpModal,
    stopGlobalTimer, // Hàm để dừng timer khi nộp bài

    // Timer câu hỏi
    questionTimeRemaining,
    resetQuestionToast,
    stopQuestionTimer: () => clearInterval(questionTimerRef.current) // Hàm để dừng timer khi nộp bài
  };
};