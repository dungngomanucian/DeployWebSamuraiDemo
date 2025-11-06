// src/hooks/exam/useExamState.js
import { useState } from 'react';

/**
 * Hook tùy chỉnh để quản lý state của các câu trả lời (trắc nghiệm và sắp xếp).
 */
export const useExamState = () => {
  // State chính lưu trữ đáp án (dạng { q1: "a1", q2: "a3" })
  const [studentAnswers, setStudentAnswers] = useState({});
  
  // State RÊNG BIỆT cho câu hỏi sắp xếp (QT007)
  // Dạng { q_sort_1: ["a2", "a1", "a4"] }
  const [answerOrder, setAnswerOrder] = useState({});

  /**
   * Hàm xử lý chính khi chọn một đáp án.
   * Tự động phân loại logic cho trắc nghiệm hoặc sắp xếp (QT007).
   */
  const handleAnswerSelect = (questionId, answerId, questionTypeId) => {
    
    if (questionTypeId === "QT007") {
      // --- Logic cho câu hỏi SẮP XẾP ---
      setAnswerOrder((prev) => {
        const currentOrder = prev[questionId] || [];
        
        // Nếu đã chọn -> Bỏ chọn (remove)
        if (currentOrder.includes(answerId)) {
          const newOrder = currentOrder.filter(id => id !== answerId);
          const newState = { ...prev, [questionId]: newOrder };
          
          // Cập nhật cả studentAnswers
          setStudentAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: newOrder // Lưu mảng thứ tự
          }));
          
          return newState;
        }
        
        // Nếu chưa chọn -> Thêm vào cuối
        const newOrder = [...currentOrder, answerId];
        const newState = { ...prev, [questionId]: newOrder };
        
        // Cập nhật cả studentAnswers
        setStudentAnswers((prevAnswers) => ({
          ...prevAnswers,
          [questionId]: newOrder // Lưu mảng thứ tự
        }));
        
        return newState;
      });
    } else {
      // --- Logic cho câu hỏi TRẮC NGHIỆM (1 lựa chọn) ---
      setStudentAnswers((prev) => ({
        ...prev,
        [questionId]: answerId, // Ghi đè đáp án cũ
      }));
    }
  };

  /**
   * Helper: Lấy số thứ tự (1, 2, 3...) cho câu sắp xếp.
   */
  const getAnswerOrder = (questionId, answerId) => {
    const order = answerOrder[questionId] || [];
    const index = order.indexOf(answerId);
    return index >= 0 ? index + 1 : null;
  };

  /**
   * Helper: Kiểm tra một đáp án đã được chọn hay chưa.
   */
  const isAnswerSelected = (questionId, answerId, questionTypeId) => {
    if (questionTypeId === "QT007") {
      const order = answerOrder[questionId] || [];
      return order.includes(answerId);
    } else {
      return studentAnswers[questionId] === answerId;
    }
  };

  /**
   * Trả về state và các hàm điều khiển.
   */
  return {
    studentAnswers,
    answerOrder,
    handleAnswerSelect,
    getAnswerOrder,
    isAnswerSelected
  };
};