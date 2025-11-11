// src/hooks/exam/useExamState.js
import { useState } from 'react';

/**
 * Hook tùy chỉnh để quản lý state của các câu trả lời (trắc nghiệm và sắp xếp).
 */
export const useExamState = () => {
  // State chính lưu trữ đáp án (dạng { q1: "a1", q2: "a3" })
  const [studentAnswers, setStudentAnswers] = useState({});
  
  // State RÊNG BIỆT cho câu hỏi sắp xếp (is_Sort_Question = true)
  // Dạng { q_sort_1: ["a2", "a1", "a4"] }
  const [answerOrder, setAnswerOrder] = useState({});

  /**
   * Hàm xử lý chính khi chọn một đáp án.
   * Tự động phân loại logic cho trắc nghiệm hoặc sắp xếp (dựa trên isSortQuestion).
   * @param {string} questionId - ID của câu hỏi
   * @param {string} answerId - ID của đáp án
   * @param {string} questionTypeId - ID của loại câu hỏi (để tương thích ngược)
   * @param {boolean} isSortQuestion - Flag cho biết có phải câu hỏi sắp xếp không (ưu tiên hơn questionTypeId)
   */
  const handleAnswerSelect = (questionId, answerId, questionTypeId, isSortQuestion = false) => {
    // Kiểm tra isSortQuestion (được truyền từ nơi gọi, dựa trên is_Sort_Question của question type)
    const isSort = isSortQuestion;
    
    if (isSort) {
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
   * @param {string} questionId - ID của câu hỏi
   * @param {string} answerId - ID của đáp án
   * @param {string} questionTypeId - ID của loại câu hỏi (để tương thích ngược)
   * @param {boolean} isSortQuestion - Flag cho biết có phải câu hỏi sắp xếp không (ưu tiên hơn questionTypeId)
   */
  const isAnswerSelected = (questionId, answerId, questionTypeId, isSortQuestion = false) => {
    // Kiểm tra isSortQuestion (được truyền từ nơi gọi, dựa trên is_Sort_Question của question type)
    const isSort = isSortQuestion;
    
    if (isSort) {
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