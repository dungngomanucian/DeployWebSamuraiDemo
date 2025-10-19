import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function MockExamJLPT() {
  const navigate = useNavigate();
  
  const levels = [
    { code: "N5", tests: 30, score: "80/180" },
    { code: "N4", tests: 30, score: "90/180" },
    { code: "N3", tests: 30, score: "95/180" },
    { code: "N2", tests: 30, score: "90/180" },
    { code: "N1", tests: 30, score: "100/180" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]">
      <Navbar />

      {/* Header Section */}
      <section className="text-center pt-12 pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B1320]">
          MÔ PHỎNG THI THẬT
        </h1>
        <p className="text-lg md:text-xl text-[#0B1320] mt-2 mb-8 max-w-4xl mx-auto leading-relaxed">
          Bí kíp tăng 30 điểm trong 3 tháng trước kỳ thi JLPT tháng 12/2025
        </p>
      </section>

      {/* Main White Box */}
      <section className="relative max-w-7xl mx-auto px-6 pb-20">
        <div className="relative bg-white rounded-3xl border border-[#3B82F6] shadow-md px-12 py-16">
          {/* Floating Button */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="bg-[#D9D9D9] text-[#0B1320] font-bold rounded-full px-16 py-4 text-lg shadow-lg">
              Chọn cấp độ ngay
            </div>
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-16 justify-items-center mt-8">
            {levels.map((lv, idx) => (
              <div
                key={lv.code}
                className={`flex flex-col items-center cursor-pointer hover:scale-105 transition-transform ${
                  idx >= 3 ? "md:col-span-1" : ""
                }`}
                onClick={() => navigate(`/exam-list?level=${lv.code}`)}
              >
                {/* Level Label */}
                <div className="border border-black rounded-full px-8 py-2 text-base font-bold text-[#0B1320] mb-2">
                  Cấp độ {lv.code}
                </div>

                {/* Info Text */}
                <div className="text-base text-[#0B1320] mb-4">
                  {lv.tests} đề | Điểm đỗ: {lv.score}
                </div>

                {/* Gray Box Placeholder */}
                <div className="w-[280px] h-[240px] bg-[#D9D9D9] rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
