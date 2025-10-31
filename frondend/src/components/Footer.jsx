import React from "react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-white text-[#111827] py-16 px-6 md:px-12 lg:px-24 border-t border-gray-200" style={{fontFamily: "Nunito"}}>
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* === LƯỚI CHÍNH: Cột logo + 3 nhóm nội dung + HỆ SINH THÁI phía dưới === */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16">
          {/* === CỘT 1: Logo + Thông tin trung tâm === */}
          <div className="md:col-span-2 flex flex-col">
            {/* Logo */}
            <img
              src={logo}
              alt="Samurai Japanese"
              className="h-[60px] w-auto object-contain mb-6 self-start"
            />

            {/* Tên trung tâm */}
            <h3 className="font-extrabold text-2xl leading-snug mb-6">
              Trung tâm giáo dục & Tư vấn Du học Nhật Bản Samurai
            </h3>

            {/* Thông tin liên hệ */}
            <div className="text-sm space-y-1 mb-6">
              <p>
                <span className="font-semibold">Địa chỉ:</span> 9C3 ngõ 243 Trần
                Quốc Hoàn, Cầu Giấy, Hà Nội
              </p>
              <p>
                <span className="font-semibold">Hotline:</span> 0962 810 208
              </p>
            </div>

            {/* Follow us */}
            <div>
              <p className="text-sm font-semibold mb-3">Follow Us:</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
                <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
                <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
              </div>
            </div>
          </div>

          {/* === KHỐI PHẢI: 3 cột nội dung + HỆ SINH THÁI bên dưới === */}
          <div className="md:col-span-3 mt-22">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 items-start">
              {/* CỘT 2: VỀ SAMURAI */}
              <div>
                <h4 className="font-bold text-lg mb-4">VỀ SAMURAI</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-[#4F46E5] transition-colors">Giới thiệu chung</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#4F46E5] transition-colors">Tầm nhìn, sứ mệnh</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#4F46E5] transition-colors">Triết lý giáo dục</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#4F46E5] transition-colors">Các khóa học</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#4F46E5] transition-colors">Sự kiện</a>
                  </li>
                </ul>
              </div>

              {/* CỘT 3: HỌC BÀI */}
              <div>
                <h4 className="font-bold text-lg mb-4">HỌC BÀI</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-[#4F46E5] transition-colors">BTVN</a></li>
                  <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Nghe (Chou)</a></li>
                  <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Ngữ pháp (Bun)</a></li>
                  <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Đọc hiểu (Doku)</a></li>
                </ul>
              </div>

              {/* CỘT 4: LUYỆN ĐỀ */}
              <div>
                <h4 className="font-bold text-lg mb-4">LUYỆN ĐỀ</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Luyện tập theo dạng bài</a></li>
                  <li><a href="#" className="hover:text-[#4F46E5] transition-colors">Thi thử JLPT</a></li>
                </ul>
              </div>
            </div>

            {/* HỆ SINH THÁI: nằm dưới 3 cột, độc lập */}
            <div className="mt-4">
              <div className="flex items-center gap-6">
                <h4 className="font-bold text-lg">HỆ SINH THÁI</h4>
                <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
                <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
                <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
