import React from "react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 xl:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          {/* Cột 1 - Logo và thông tin công ty (chiếm 2 cột) */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <img
                src={logo}
                alt="Samurai Japanese"
                className="h-[50px] sm:h-[60px] w-auto object-contain mr-3 sm:mr-4"
              />
            </div>
            
            <h3 className="font-bold text-base sm:text-lg leading-tight mb-4 sm:mb-6">
              Trung tâm giáo dục & Tư vấn Du học Nhật Bản Samurai
            </h3>
            
            <div className="space-y-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <p><strong>Địa chỉ:</strong> 9C3 ngõ 243 Trần Quốc Hoàn, Cầu Giấy, Hà Nội</p>
              <p><strong>Hotline:</strong> 0962 810 208</p>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Follow Us:</p>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Cột 2 - VỀ SAMURAI */}
          <div>
            <h4 className="font-bold text-xs sm:text-sm mb-3 sm:mb-4">VỀ SAMURAI</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Giới thiệu chung</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Tầm nhìn, sứ mệnh</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Triết lý giáo dục</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Các khóa học</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Sự kiện</a></li>
            </ul>
          </div>

          {/* Cột 3 - HỌC BÀI */}
          <div>
            <h4 className="font-bold text-xs sm:text-sm mb-3 sm:mb-4">HỌC BÀI</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">BTVN</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Nghe (Chou)</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Ngữ pháp (Bun)</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Đọc hiểu (Doku)</a></li>
            </ul>
          </div>

          {/* Cột 4 - LUYỆN ĐỀ & HỆ SINH THÁI */}
          <div>
            <h4 className="font-bold text-xs sm:text-sm mb-3 sm:mb-4">LUYỆN ĐỀ</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Luyện tập theo dạng bài</a></li>
              <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Thi thử JLPT</a></li>
            </ul>

            <h4 className="font-bold text-xs sm:text-sm mb-3 sm:mb-4">HỆ SINH THÁI</h4>
            <div className="flex gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded"></div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded"></div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
