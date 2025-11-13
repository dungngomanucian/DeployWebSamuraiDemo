-- ============================================
-- DATABASE OPTIMIZATION FOR EXAM PERFORMANCE
-- ============================================
-- Chạy các lệnh này trong Supabase SQL Editor để tối ưu performance
-- 
-- Các indexes này sẽ giúp tăng tốc độ query đáng kể, đặc biệt cho:
-- - get_full_exam_data: Giảm từ N+1 queries xuống batch queries
-- - Các queries filter theo exam_id, section_id, question_type_id, question_id

-- ============================================
-- 1. INDEXES CHO jlpt_exam_sections
-- ============================================
-- Index cho exam_id (thường dùng để filter sections theo exam)
CREATE INDEX IF NOT EXISTS idx_jlpt_exam_sections_exam_id 
ON jlpt_exam_sections(exam_id);

-- Index cho position (dùng để order)
CREATE INDEX IF NOT EXISTS idx_jlpt_exam_sections_position 
ON jlpt_exam_sections(exam_id, position);

-- Index cho is_listening (filter listening sections)
CREATE INDEX IF NOT EXISTS idx_jlpt_exam_sections_is_listening 
ON jlpt_exam_sections(exam_id, is_listening) 
WHERE is_listening = true;

-- ============================================
-- 2. INDEXES CHO jlpt_question_types
-- ============================================
-- Index cho exam_section_id (join với sections)
CREATE INDEX IF NOT EXISTS idx_jlpt_question_types_section_id 
ON jlpt_question_types(exam_section_id);

-- Index cho is_perforated_question (filter perforated questions)
CREATE INDEX IF NOT EXISTS idx_jlpt_question_types_perforated 
ON jlpt_question_types(exam_section_id, is_perforated_question) 
WHERE is_perforated_question = true;

-- ============================================
-- 3. INDEXES CHO jlpt_questions
-- ============================================
-- Index cho question_type_id (join với question_types)
CREATE INDEX IF NOT EXISTS idx_jlpt_questions_question_type_id 
ON jlpt_questions(question_type_id);

-- Index cho deleted_at (filter active questions)
CREATE INDEX IF NOT EXISTS idx_jlpt_questions_deleted_at 
ON jlpt_questions(question_type_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Index cho position (order questions)
CREATE INDEX IF NOT EXISTS idx_jlpt_questions_position 
ON jlpt_questions(question_type_id, position);

-- Index cho exam_section_id (dùng trong submit exam)
CREATE INDEX IF NOT EXISTS idx_jlpt_questions_exam_section_id 
ON jlpt_questions(exam_section_id);

-- Composite index cho batch queries
CREATE INDEX IF NOT EXISTS idx_jlpt_questions_type_deleted_position 
ON jlpt_questions(question_type_id, deleted_at, position);

-- ============================================
-- 4. INDEXES CHO jlpt_answers
-- ============================================
-- Index cho question_id (join với questions)
CREATE INDEX IF NOT EXISTS idx_jlpt_answers_question_id 
ON jlpt_answers(question_id);

-- Index cho deleted_at (filter active answers)
CREATE INDEX IF NOT EXISTS idx_jlpt_answers_deleted_at 
ON jlpt_answers(question_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Index cho show_order (order answers)
CREATE INDEX IF NOT EXISTS idx_jlpt_answers_show_order 
ON jlpt_answers(question_id, show_order);

-- Composite index cho batch queries
CREATE INDEX IF NOT EXISTS idx_jlpt_answers_question_deleted_order 
ON jlpt_answers(question_id, deleted_at, show_order);

-- ============================================
-- 5. INDEXES CHO jlpt_question_passages
-- ============================================
-- Index cho question_type_id (join với question_types)
CREATE INDEX IF NOT EXISTS idx_jlpt_question_passages_question_type_id 
ON jlpt_question_passages(question_type_id);

-- ============================================
-- 6. INDEXES CHO jlpt_exams
-- ============================================
-- Index cho level_id (filter exams by level)
CREATE INDEX IF NOT EXISTS idx_jlpt_exams_level_id 
ON jlpt_exams(level_id);

-- Index cho deleted_at (filter active exams)
CREATE INDEX IF NOT EXISTS idx_jlpt_exams_deleted_at 
ON jlpt_exams(deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- 7. INDEXES CHO exam_results (cho submit exam)
-- ============================================
-- Index cho exam_id và student_id
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_student 
ON exam_results(exam_id, student_id);

-- Index cho student_id (lấy lịch sử)
CREATE INDEX IF NOT EXISTS idx_exam_results_student_id 
ON exam_results(student_id);

-- ============================================
-- 8. INDEXES CHO exam_result_sections
-- ============================================
-- Index cho exam_result_id
CREATE INDEX IF NOT EXISTS idx_exam_result_sections_exam_result_id 
ON exam_result_sections(exam_result_id);

-- Index cho exam_section_id
CREATE INDEX IF NOT EXISTS idx_exam_result_sections_exam_section_id 
ON exam_result_sections(exam_section_id);

-- ============================================
-- NOTES:
-- ============================================
-- 1. Các indexes này sẽ chiếm thêm không gian lưu trữ nhưng cải thiện đáng kể tốc độ query
-- 2. Supabase tự động maintain indexes khi có thay đổi dữ liệu
-- 3. Nếu database đã có indexes tương tự, các lệnh CREATE INDEX IF NOT EXISTS sẽ không tạo duplicate
-- 4. Nên chạy ANALYZE sau khi tạo indexes để PostgreSQL update statistics:
--    ANALYZE jlpt_exam_sections;
--    ANALYZE jlpt_question_types;
--    ANALYZE jlpt_questions;
--    ANALYZE jlpt_answers;
--    ANALYZE jlpt_question_passages;

