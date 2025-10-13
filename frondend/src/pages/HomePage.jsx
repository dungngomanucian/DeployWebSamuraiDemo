// src/pages/HomePage.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section với background tối */}
      <section className="bg-[#1F2937] flex-grow flex flex-col items-center justify-center text-center py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white mb-6 sm:mb-8 lg:mb-10 leading-tight max-w-4xl">
          Trung Tâm Giáo Dục Và Tư Vấn Du Học<br className="hidden sm:block" />Nhật Bản Samurai
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all text-sm sm:text-base">
            Tìm hiểu thêm
          </button>
          <button className="border-2 border-[#4F46E5] text-white hover:bg-[#4F46E5] px-6 sm:px-8 py-3 rounded-lg font-medium transition-all text-sm sm:text-base">
            Khóa học tại Samurai
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
