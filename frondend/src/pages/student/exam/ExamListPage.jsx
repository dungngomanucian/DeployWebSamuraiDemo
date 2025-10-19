import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function ExamListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedLevel, setSelectedLevel] = useState("N1"); // Default level
  
  // Get level from URL params
  useEffect(() => {
    const level = searchParams.get('level');
    if (level) {
      setSelectedLevel(level);
    }
  }, [searchParams]);
  
  // Mock data for exam papers - different data based on level
  const getExamPapersByLevel = (level) => {
    const baseData = {
      N1: { time: "170 phút", passingScore: "100/180", difficulty: "Khó" },
      N2: { time: "155 phút", passingScore: "90/180", difficulty: "Trung bình" },
      N3: { time: "140 phút", passingScore: "95/180", difficulty: "Dễ" },
      N4: { time: "125 phút", passingScore: "90/180", difficulty: "Dễ" },
      N5: { time: "110 phút", passingScore: "80/180", difficulty: "Dễ" }
    };
    
    const levelData = baseData[level] || baseData.N3;
    
    return Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      title: `Đề ${index + 1}`,
      time: levelData.time,
      passingScore: levelData.passingScore,
      difficulty: levelData.difficulty,
      progress: index === 0 ? 45 : 0, // First exam has progress
      status: index === 0 ? "in-progress" : "not-started"
    }));
  };

  const examPapers = getExamPapersByLevel(selectedLevel);

  const handleStartExam = (examId) => {
    // Navigate to exam detail or start exam
    console.log(`Starting exam ${examId}`);
    // navigate(`/exam/${examId}`);
  };

  const handleContinueExam = (examId) => {
    // Navigate to continue exam
    console.log(`Continuing exam ${examId}`);
    // navigate(`/exam/${examId}/continue`);
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

          {/* Exam Papers Grid - 3 cards per row on desktop, tighter spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 justify-center max-w-[960px] mx-auto">
            {examPapers.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 w-[300px] h-[253px]"
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
                    <div className="text-sm font-semibold text-[#0B1320]">{exam.time}</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-2 py-2 text-center flex-1">
                    <div className="text-xs text-gray-600 mb-1">Điểm đỗ</div>
                    <div className="text-sm font-semibold text-[#0B1320]">{exam.passingScore}</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-2 py-2 text-center flex-1">
                    <div className="text-xs text-gray-600 mb-1">Độ khó</div>
                    <div className="text-sm font-semibold text-[#0B1320]">{exam.difficulty}</div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-3">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-600">Tiến độ làm bài</div>
                      <div className="text-sm font-bold text-[#0B1320]">{exam.progress}%</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-[6px]">
                    <div
                      className="bg-gray-500 h-[6px] rounded-full transition-all duration-500"
                      style={{ width: `${exam.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => 
                    exam.status === "in-progress" 
                      ? navigate(`/exam-intro?level=${selectedLevel}&examId=${exam.id}`)
                      : navigate(`/exam-intro?level=${selectedLevel}&examId=${exam.id}`)
                  }
                  className="mx-auto mt-5 block min-w-[130px] h-[30px] w-fit px-5 text-[14px] bg-[#874FFF] hover:bg-[#7a46ea] text-white font-semibold rounded-full transition-all duration-300 shadow-sm border-3 border-[#5427B4]"
                >
                  {exam.status === "in-progress" ? "Làm tiếp" : "Bắt đầu làm"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
