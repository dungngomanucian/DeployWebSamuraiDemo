import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/hero-bg.png"; 

export default function PracticeEJU() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      {/* 1. Hero Section - Luyện đề EJU (Giữ nguyên) */}
      <section className="relative w-full bg-[#E9EFFC]">
        {/* background image (subtle) */}
        <img 
            src={heroBg} 
            alt="bg" 
            className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-10" 
        />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 lg:py-40 text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0B1320] mb-4">
                LUYỆN ĐỀ EJU
            </h1>
          <h2 className="text-xl md:text-2xl font-bold text-[#0B1320] mb-4 max-w-3xl">
                BỨT PHÁ EJU: Nắm chắc điểm số với kho đề thi phân loại.
            </h2>
          <p className="text-[#0B1320] max-w-3xl text-base md:text-lg mb-8">
            Luyện nhuần nhuyễn từng kỹ năng, sẵn sàng chinh phục EJU.
          </p>
            
            {/* Nút Khám phá ngay */}
          <button 
            onClick={() => {
              document.getElementById('che-do-luyen-thi')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn rounded-full bg-[#4169E1] hover:bg-[#365AAB] text-white border-none px-8 text-base md:text-lg"
          >
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* 2. Practice modes - CHẾ ĐỘ LUYỆN THI (ĐÃ SỬA KHOẢNG CÁCH) */}
      {/* Thay pb-10 bằng pb-0 để giảm tối đa khoảng đệm dưới section */}
      <section id="che-do-luyen-thi" className="w-full bg-white pt-14 pb-0"> 
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1320] mb-12">
            THỰC CHIẾN EJU VỚI <br /> CÁC CHẾ ĐỘ LUYỆN THI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Card 1 */}
            <div className="bg-white rounded-[16px] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="w-[64px] h-[64px] bg-[#E9EFFC] rounded-md mb-6 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#4169E1]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-9 0h2.25c.51 0 .93.42.93.93v2.14a.75.75 0 0 1-.75.75H4.28a.75.75 0 0 1-.75-.75V11.43c0-.51.42-.93.93-.93Z" />
                    </svg>
                </div>
              <h3 className="font-extrabold text-xl text-[#0B1320] mb-2">LUYỆN TẬP THEO DẠNG BÀI</h3>
              <p className="text-[#5B6476] text-sm mb-6 leading-relaxed max-w-md">
                Việc luyện tập theo từng phần trong khoảng thời gian quy định giúp bạn 
                tập trung vào việc giải quyết chính xác từng câu hỏi, đồng thời rèn 
                luyện khả năng cảm nhận và quản lý thời gian hiệu quả.
              </p>
              <button className="btn rounded-full bg-[#4169E1] hover:bg-[#365AAB] text-white border-none text-base font-medium px-8 h-[44px]">
                Xem chi tiết
            </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[16px] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="w-[64px] h-[64px] bg-[#E9EFFC] rounded-md mb-6 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#4169E1]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H9.75A2.25 2.25 0 0 1 7.5 18V5.625c0-.621.504-1.125 1.125-1.125h3.375M12 7.5V10.5m0-3h-3v3m3-3h3v3m-3 3v3m0 0h-3v3m3-3h3v3m-3 3v3m0 0h-3v3m3-3h3v3" />
                    </svg>
                </div>
              <h3 className="font-extrabold text-xl text-[#0B1320] mb-2">MÔ PHỎNG THI THẬT</h3>
              <p className="text-[#5B6476] text-sm mb-6 leading-relaxed max-w-md">
                Hình thức luyện đề mô phỏng được thiết kế như kỳ thi thật: mỗi phần 
                có thời gian làm bài riêng, và sau khi chuyển sang phần tiếp theo, 
                sẽ không thể quay lại chỉnh sửa đáp án.
              </p>
              <button className="btn rounded-full bg-[#4169E1] hover:bg-[#365AAB] text-white border-none text-base font-medium px-8 h-[44px]">
                Xem chi tiết
            </button>
            </div>
          </div>
          
          {/* Đường kẻ ngang */}
          <div className="mt-12 border-t border-gray-400"></div> 
          
        </div>
      </section>

      <Footer />
    </div>
  );
}