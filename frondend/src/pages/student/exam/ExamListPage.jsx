import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getExamsByLevel, getLevels } from "../../../api/examService";

export default function ExamListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedLevel, setSelectedLevel] = useState("N1");
  const [examPapers, setExamPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  
  // Load levels
  useEffect(() => {
    const loadLevels = async () => {
      const { data, error } = await getLevels();
      if (!error && data) {
        setLevels(data);
      }
    };
    loadLevels();
  }, []);

  // Get level from URL params
  useEffect(() => {
    const level = searchParams.get('level');
    if (level) {
      setSelectedLevel(level);
    }
  }, [searchParams]);
  
  // Load exam data when level changes
  useEffect(() => {
    const loadExamData = async () => {
      setLoading(true);
      
      // Find level_id from title
      const levelData = levels.find(l => l.title === selectedLevel);
      if (!levelData) {
        setLoading(false);
        return;
      }

      const { data, error } = await getExamsByLevel(levelData.id);
      
      if (error) {
        console.error("Error loading exams:", error);
        setExamPapers([]);
      } else {
        setExamPapers(data || []);
      }
      
      setLoading(false);
    };

    if (levels.length > 0) {
      loadExamData();
    }
  }, [selectedLevel, levels]);

  const handleStartExam = (examId) => {
    navigate(`/exam-intro?examId=${examId}`);
  };

  const handleContinueExam = (examId) => {
    navigate(`/exam-start?examId=${examId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]">
      <Navbar />

      {/* Header Section */}
      <section className="text-center pt-12 pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B1320]">
          MÔ PHỎNG THI THẬT - CẤP ĐỘ {selectedLevel}
        </h1>
        <p className="text-lg md:text-xl text-[#0B1320] mt-2 mb-8 max-w-4xl mx-auto leading-relaxed">
          Bí kíp tăng 30 điểm trong 3 tháng trước kỳ thi JLPT tháng 12/2025
        </p>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {loading ? (
            <div className="text-center py-20">
              <div className="text-2xl font-bold text-[#0B1320]">Đang tải danh sách đề thi...</div>
            </div>
          ) : examPapers.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-2xl font-bold text-gray-600">Chưa có đề thi nào cho cấp độ này</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 justify-center max-w-[960px] mx-auto">
              {examPapers.map((exam) => {
                // Determine difficulty based on type
                const difficulty = exam.type === "Official" ? "Chính thức" : "Mock";
                const progress = 0; // TODO: Get from student progress data
                
                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 w-[300px] h-[273px]"
                  >
                    {/* Exam Title with separator line */}
                    <div className="text-center mb-2">
                      <h3 className="text-2xl font-bold text-[#0B1320] mb-2">
                        {exam.title}
                      </h3>
                      <div className="w-full h-px bg-gray-200"></div>
                    </div>

                    {/* Info Pills - 3 pills in one row */}
                    <div className="flex gap-2 mb-3">
                      <div className="bg-gray-100 rounded-lg px-2 py-2 text-center flex-1">
                        <div className="text-xs text-gray-600 mb-1">Thời gian</div>
                        <div className="text-sm font-semibold text-[#0B1320]">{exam.total_duration} phút</div>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-2 py-2 text-center flex-1">
                        <div className="text-xs text-gray-600 mb-1">Điểm đỗ</div>
                        <div className="text-sm font-semibold text-[#0B1320]">{exam.request_score}/180</div>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-2 py-2 text-center flex-1">
                        <div className="text-xs text-gray-600 mb-1">Loại đề</div>
                        <div className="text-sm font-semibold text-[#0B1320]">{difficulty}</div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-3">
                      <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-600">Tiến độ làm bài</div>
                          <div className="text-sm font-bold text-[#0B1320]">{progress}%</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-[6px]">
                        <div
                          className="bg-gray-500 h-[6px] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      className="mx-auto mt-5 block min-w-[130px] h-[30px] w-fit px-5 text-[14px] bg-[#874FFF] hover:bg-[#7a46ea] text-white font-semibold rounded-full transition-all duration-300 shadow-sm border-3 border-[#5427B4]"
                    >
                      {progress > 0 ? "Làm tiếp" : "Bắt đầu làm"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          </div>
      </section>

      <Footer />
    </div>
  );
}
