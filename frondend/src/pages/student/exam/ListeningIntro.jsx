import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getExamById } from "../../../api/examService";

export default function ListeningIntro() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const examId = params.get("examId");

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!examId) {
        navigate("/mock-exam-jlpt");
        return;
      }

      setLoading(true);
      const { data, error } = await getExamById(examId);
      if (error) {
        console.error("Error loading exam:", error);
        alert("Không thể tải thông tin đề thi. Vui lòng thử lại!");
        navigate(-1);
        return;
      }
      setExamData(data);
      setLoading(false);
    };

    load();
  }, [examId, navigate]);

  const handleStart = () => {
    navigate(`/exam-start?examId=${examId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-[#0B1320]">Đang tải thông tin đề thi...</div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EFFC]">
        <div className="text-2xl font-bold text-red-600">Không tìm thấy đề thi!</div>
      </div>
    );
  }

  const listeningDuration =
    examData.listening_duration || examData.total_duration || 50;
  const isN3 = examData?.level?.title === "N3";

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 px-8 md:px-14 py-10">
            {/* Title */}
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-extrabold tracking-wide text-[#0B1320]">
                {examData.level.title}
              </div>
              <div
                className="mt-2 text-3xl md:text-[40px] leading-none text-[#0B1320]"
                style={{
                  fontFamily:
                    '"UD Digi Kyokasho NK-B", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
                  fontWeight: 900,
                  letterSpacing: "-0.01em",
                }}
              >
                聴解
              </div>
              <div
                className="mt-3 text-3xl md:text-[40px] leading-none text-[#0B1320]"
                style={{
                  fontFamily:
                    '"UD Digi Kyokasho NK-B", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
                  fontWeight: 900,
                  letterSpacing: "0",
                }}
              >
                ({listeningDuration}分)
              </div>
            </div>

            {/* Notice Box */}
            <div className="mt-10">
              <div className="border-2 border-black rounded-xl p-6 md:p-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <div className="text-3xl font-extrabold text-[#0B1320]">注意</div>
                  <div className="text-[#0B1320]">/ Chú ý</div>
                </div>

                <div className="space-y-4">
                  <div className="pt-4 border-t border-black">
                    <div className="font-semibold text-[#0B1320]">1. Phần Nghe hiểu</div>
                    {isN3 ? (
                      <div className="text-[#0B1320] mt-1">
                        Khi một câu đã kết thúc, bạn sẽ không thể quay lại, vì vậy hãy tập trung lắng nghe ngay từ đầu nhé.
                        {" "}
                        <span className="font-semibold">Các câu nghe hiểu sẽ chuyển tự động theo audio.</span>
                      </div>
                    ) : (
                      <div className="text-[#0B1320] mt-1">
                        Audio sẽ chạy xuyên suốt từ đầu đến cuối và không dừng lại. Hãy tập trung để tránh bị miss.
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-black">
                    <div className="font-semibold text-[#0B1320]">2. Tính năng hỗ trợ</div>
                    <div className="text-[#0B1320] mt-1">
                      Bạn có thể sử dụng tính năng ghi chú để ghi lại những thông tin quan trọng đã nghe được.
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black">
                    <div className="font-semibold flex items-center gap-2 text-[#0B1320]">
                      <span>⚠️</span> Lưu ý
                    </div>
                    <div className="text-[#0B1320] mt-1">
                      Hãy chuẩn bị tai nghe và đường truyền mạng thật ổn định để tránh bị gián đoạn trong quá trình làm bài.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-center gap-4 md:gap-6">
              <button
                onClick={() => navigate(-1)}
                className="rounded-full px-6 md:px-8 h-[42px] border-2 border-[#5427B4] text-[#5427B4] bg-white font-semibold shadow-sm"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleStart}
                className="rounded-full px-6 md:px-8 h-[42px] bg-[#874FFF] text-white font-semibold shadow-sm border-2 border-[#5427B4]"
              >
                BẮT ĐẦU NGAY
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


