import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import heroBg from "../../../assets/hero-bg.png";
import background from "../../../assets/background.png";
import back1 from "../../../assets/back1.png";
import back2 from "../../../assets/back2.png";
import back3 from "../../../assets/back3.png";
import back4 from "../../../assets/back4.png";

// 🌟 NEW IMPORTS FOR HIGHLIGHT/NOTE/TRANSLATE 🌟
import { AnnotationProvider, useAnnotationContext } from '../../../context/AnnotationContext';
import ContentHighlighter from '../../../components/Highlight/ContentHighlighter';
import TranslationModal from '../../../components/Highlight/TranslationModal';
import { useTranslation } from '../../../hooks/exam/useTranslation';
import NotepadModal from "../../../components/Highlight/NotepadModal";

const FeatureCard = ({
  title,
  description,
  primaryText = "Khám phá tính năng",
  secondaryText = "Vào học ngay",
  showSecondary = true,
  hideArrow = false,
  buttonWidthClass = "w-full",
  cardMaxWidthClass = "max-w-[423px]",
  cardHeightClass = "h-[466px]",
  primaryVariant = "white", // 'white' | 'yellow'
  onPrimaryClick
}) => {
  // Class tùy chỉnh cho Box Shadow mờ (glow effect) màu xanh
  const glowShadowClass = 'shadow-[0_4px_60px_-15px_rgba(45,91,255,0.6),0_20px_25px_-5px_rgba(45,91,255,0.4)]';
  const defaultShadowClass = 'shadow-lg';

  // State để theo dõi trạng thái hover
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="group relative flex-1 flex justify-center">
      {/* Card Container: */}
      <div
        className={`relative rounded-[24px] p-8 transition-all duration-300 w-full ${cardMaxWidthClass} ${cardHeightClass} text-left
          ${isHovered
            ? `bg-[#2D5BFF] text-white ${glowShadowClass} -translate-y-2`
            : `bg-[#F3F4F6] text-[#0B1320] ${defaultShadowClass}`
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Nội dung tĩnh */}
        <h3 className="text-2xl sm:text-[28px] font-semibold mb-4">{title}</h3>
        <p className="opacity-90 text-left leading-relaxed">
          {description}
        </p>
        
        {/* Mũi tên góc dưới (Chỉ hiển thị khi KHÔNG hover) */}
        {!hideArrow && (
          <div className={`absolute bottom-8 right-8 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-[#111827]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
          </div>
        )}

        {/* Các nút Button (Hiển thị khi hover) */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 flex flex-col gap-4 items-center w-[279px] ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
          style={{ bottom: '40px' }}
        >
          
          {/* Button 1: Khám phá tính năng (White pill) */}
          <button 
            onClick={() => {
              if (onPrimaryClick) {
                onPrimaryClick();
              } else if (title === 'Học bài') {
                document.getElementById('hoc-bai')?.scrollIntoView({ behavior: 'smooth' });
              } else if (title === 'Luyện đề') {
                document.getElementById('luyen-thi')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`relative inline-flex items-center justify-center gap-3 rounded-full ${
              primaryVariant === 'yellow' ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black' : 'bg-white text-[#2D5BFF]'
            } ${buttonWidthClass} h-[52px] px-6 text-[16px] font-medium shadow-sm hover:shadow-md`}>
            {primaryText}
            <span className={`absolute right-4 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                primaryVariant === 'yellow' ? 'bg-white text-[#2D5BFF]' : 'bg-[#2D5BFF] text-white'
              }`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </span>
          </button>
          
          {/* Button 2: Vào học ngay (Yellow pill) */}
          {showSecondary && (
            <button 
              onClick={() => {
                if (title === 'Luyện đề') {
                  document.getElementById('lua-chon-ky-thi')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="relative inline-flex items-center justify-center gap-3 rounded-full bg-[#FBBF24] text-black w-full h-[52px] px-6 text-[16px] font-medium shadow-sm hover:bg-[#F59E0B]"
            >
              {secondaryText}
              <span className="absolute right-4 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-[#2D5BFF]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================
// Feedback Section (Slider 2-up)
// =============================
const FeedbackSection = () => {
  const testimonials = [
    {
      text:
        "Orci vel eget in eu. Integer amet porttitor hendrerit etiam arcu, aliquet duis pretium consequat. Semper sed viverra enim ut nunc.",
      author: "Courtney Henry",
    },
    {
      text:
        "Tincidunt risus, blandit proin semper. Tellus ac pellentesque convallis vitae. Lorem enim cursus et consequat viverra id justo ullamcorper.",
      author: "Courtney Henry",
    },
    {
      text:
        "Nunc lacus, tincidunt at pulvinar quis, aliquam id risus. Nam cursus, arcu quis malesuada tempor, eros leo congue.",
      author: "Jenny Wilson",
    },
    {
      text:
        "Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla.",
      author: "Albert Flores",
    },
  ];

  const [startIdx, setStartIdx] = useState(0);
  const len = testimonials.length;

  const prev = () => setStartIdx((idx) => (idx - 2 + len) % len);
  const next = () => setStartIdx((idx) => (idx + 2) % len);

  const visible = [testimonials[startIdx], testimonials[(startIdx + 1) % len]];

  const StarRow = () => (
    <div className="flex items-center gap-1 text-[#2563EB] mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
        </svg>
      ))}
    </div>
  );

  return (
    <section className="w-full bg-white pt-14 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-3xl md:text-4xl font-extrabold text-center text-[#0B1320]">Feedback Học Viên</h3>
        <p className="text-center text-[#5B6476] mt-2">Neque, pulvinar vestibulum non aliquam.</p>

          <div className="mt-10 relative">
          {/* Slider container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start place-items-center">
            {visible.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-md text-center w-[454px] min-h-[220px] max-w-full flex flex-col justify-between">
                <StarRow />
                <p className="text-[#0B1320] italic mb-6">“{item.text}”</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300" />
                  <span className="text-sm text-[#5B6476]">{item.author}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full border text-[#0B1320] hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full border text-[#0B1320] hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

// =============================
// Weekly Leaderboard Section
// =============================
const WeeklyLeaderboard = () => {
  const [examType, setExamType] = useState('JLPT'); // 'JLPT' | 'EJU'
  const [level, setLevel] = useState('N1');
  const [ejuType, setEjuType] = useState('RIKEI'); // EJU filters

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const ejuFilters = ['RIKEI', 'SOGO', 'TOÁN', 'NHẬT'];

  const Item = ({ idx, name }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-[#0B1320]">{String(idx).padStart(2, '0')}</div>
      <div className="text-sm">
        <p className="font-semibold text-[#0B1320]">{name}</p>
        <p className="text-[11px] text-[#5B6476]">Lớp 2501.SAMURAI.N1</p>
        <p className="text-[11px] text-[#5B6476]">60 giờ tự học 5/30 d</p>
      </div>
    </div>
  );

  const Card = ({ title }) => (
    <div className="bg-white rounded-xl p-5 shadow-md w-[320px] md:w-[360px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-300 rounded-md" />
        <div className="text-sm">
          <p className="font-bold text-[#0B1320]">THÀNH VIÊN</p>
          <p className="text-[#0B1320]">{title}</p>
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <Item key={i} idx={i + 1} name="Nguyễn Bình Minh" />
      ))}
    </div>
  );

  return (
    <section className="w-full bg-[#E9EFFC] pt-12 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-3xl md:text-4xl font-extrabold text-center text-[#0B1320]">Thành tích luyện thi theo tuần</h3>

        {/* Exam type segmented control */}
        <div className="mt-6 flex justify-center gap-6">
          <div className="inline-flex bg-white rounded-full p-1 shadow-sm">
            <button onClick={() => setExamType('JLPT')} className={`px-10 py-2 rounded-full text-sm font-semibold transition ${examType === 'JLPT' ? 'bg-[#2563EB] text-white' : 'text-[#0B1320]'}`}>JLPT</button>
            <button onClick={() => setExamType('EJU')} className={`px-10 py-2 rounded-full text-sm font-semibold transition ${examType === 'EJU' ? 'bg-[#2563EB] text-white' : 'text-[#0B1320]'}`}>EJU</button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          {examType === 'JLPT' ? (
            <>
              {levels.map((lv) => (
                <button key={lv} onClick={() => setLevel(lv)} className={`w-8 h-8 rounded-full text-xs font-semibold border flex items-center justify-center ${level === lv ? 'bg-[#2563EB] text-white border-transparent' : 'bg-white text-[#0B1320] border-gray-200'}`}>{lv}</button>
              ))}
            </>
          ) : (
            <>
              {ejuFilters.map((f) => (
                <button key={f} onClick={() => setEjuType(f)} className={`px-4 py-1 rounded-md text-xs font-semibold border ${ejuType === f ? 'bg-[#2563EB] text-white border-transparent' : 'bg-gray-200 text-[#0B1320] border-transparent'}`}>{f}</button>
              ))}
            </>
          )}
        </div>

        {/* Two columns cards */}
        <div className="mt-6 flex justify-center gap-8 flex-wrap">
          <Card title="CHĂM HỌC NHẤT" />
          <Card title="THÀNH TÍCH CAO" />
        </div>
      </div>
    </section>
  );
};

// Card chỉ hiển thị - không có hover effects
const InfoCard = ({ title, description, icon }) => {
  return (
    <div className="relative flex-1 flex justify-center">
      <div className="relative rounded-[24px] p-8 shadow-lg w-full max-w-[423px] min-h-[280px] text-left bg-white border-2 border-gray-100">
        {icon && <div className="flex justify-center mb-6">{icon}</div>}
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#0B1320]">{title}</h3>
        <p className="text-[#5B6476] leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </div>
  );
};

// Card EJU/JLPT với hover, không có mũi tên
const ExamCard = ({ title, description, highlighted, buttonText }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (highlighted) {
    return (
      <div 
        className="bg-[#2D5BFF] rounded-2xl p-8 text-center shadow-[0_10px_40px_-10px_rgba(45,91,255,0.5)] hover:shadow-[0_15px_50px_-10px_rgba(45,91,255,0.6)] transition-all duration-300 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h5 className="text-3xl font-bold text-white mb-4">{title}</h5>
        <p className="text-white/90 text-sm mb-6 leading-relaxed">
          {description}
        </p>
        <button className="btn bg-[#FBBF24] hover:bg-[#F59E0B] text-black border-none rounded-full px-6 py-3 font-medium inline-flex items-center gap-2">
          {buttonText || "Luyện đề ngay"}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-[#2D5BFF] hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h5 className="text-3xl font-bold text-[#0B1320] mb-4">{title}</h5>
      <p className="text-[#5B6476] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

// =============================
// Tabs + Gallery Component
// =============================
const TabsGallery = () => {
  const tabs = [
    { key: 'homework', label: 'Bài tập về nhà', img: background },
    { key: 'listening', label: 'Luyện Nghe (Chou)', img: back1 },
    { key: 'grammar', label: 'Luyện Ngữ pháp (Bun)', img: back4 },
    { key: 'reading', label: 'Luyện Đọc (Doku)', img: heroBg },
  ];
  const [active, setActive] = useState('listening');

  // order images: center is active, left/right are others
  const ordered = (key) => {
    const idx = tabs.findIndex(t => t.key === key);
    const arr = [...tabs.slice(idx), ...tabs.slice(0, idx)];
    return arr;
  };

  const images = ordered(active);

  return (
    <div className="mt-8">
      {/* Tab buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-5 py-2 rounded-full text-sm md:text-base shadow ${
              active === t.key ? 'bg-white text-[#2D5BFF]' : 'bg-white/70 text-[#0B1320]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Gallery area */}
      <div className="relative mt-8 h-[520px] md:h-[540px]">
        {/* center active image - theo kích thước thiết kế ~1008x460 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 w-[90%] md:w-[1008px] h-[360px] md:h-[460px] rounded-2xl overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] bg-white">
          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
          <img src={images[0].img} alt="active image" className="w-full h-full object-cover" />
        </div>
        {/* Side images full-bleed to viewport edges */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[120px] w-screen flex justify-between pointer-events-none">
          <div className="ml-0 w-[120px] h-[320px] md:w-[163px] md:h-[460px] rounded-xl overflow-hidden shadow-[0_12px_30px_-12px_rgba(0,0,0,0.3)] bg-white">
            <img src={images[1].img} alt="left image" className="w-full h-full object-cover" />
          </div>
          <div className="mr-0 w-[120px] h-[320px] md:w-[163px] md:h-[460px] rounded-xl overflow-hidden shadow-[0_12px_30px_-12px_rgba(0,0,0,0.3)] bg-white">
            <img src={images[2].img} alt="right image" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePageContent = () => {
  const navigate = useNavigate();
  // Images for the hero background (using the same placeholder for now)
  const heroImages = useMemo(() => [heroBg, back1, back2, back3, background], []);
  const [activeIdx, setActiveIdx] = useState(0);

  // 🌟 NEW: State và handler cho Notepad Modal 🌟
  const [isNotepadVisible, setIsNotepadVisible] = useState(false);
  const { annotations } = useAnnotationContext(); // Lấy annotations để kiểm tra

  const noteCount = annotations.filter(a => a.type === 'note').length;

  // Chỉ hiển thị nút Notepad nếu người dùng đã đăng nhập và có ít nhất 1 ghi chú
  const token = localStorage.getItem('auth_token');
  const shouldShowNotepad = !!token; // Luôn hiển thị nút nếu đã đăng nhập, huy hiệu sẽ cho biết có note hay không

  const handleNotepadToggle = () => setIsNotepadVisible(prev => !prev);

  // 🌟 NEW: useTranslation hook 🌟
  const {
    isLoading,
    error,
    translation,
    originalText,
    translateText,
    clearTranslation
  } = useTranslation();

  // 🌟 NEW: handleTranslateRequest function 🌟
  const handleTranslateRequest = (selectedText) => {
    console.log("Yêu cầu dịch từ HomePage cho văn bản:", selectedText);
    translateText(selectedText);
  };

  // Auto-rotate background every 5s
  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIdx((idx) => (idx + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar 
        showNotepadButton={shouldShowNotepad}
        onNotepadClick={handleNotepadToggle}
        noteCount={noteCount}
      />

      {/* 🌟 WRAP MAIN CONTENT WITH ANNOTATION PROVIDER AND CONTENT HIGHLIGHTER 🌟 */}
      <ContentHighlighter
        showTranslateButton={true} // Enable translate button for home page
        onTranslate={handleTranslateRequest}
      >
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] overflow-hidden flex items-center justify-start text-left">
        {/* Image layers */}
        {heroImages.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              activeIdx === idx ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}

        {/* Overlay tối nhẹ để text nổi bật */}
        <div className="absolute inset-0"/>

          {/* Button nằm giữa phía dưới, lùi xuống (Điều chỉnh bottom thấp) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
              <button 
                onClick={() => {
                  document.getElementById('kham-pha-tinh-nang')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn rounded-full bg-[#4169E1] hover:bg-[#365AAB] text-white border-none text-[16px] font-medium w-[239px] h-[52px] shadow-lg"
              >
                  Khám phá ngay
              </button>
          </div>
      </section>


      {/* Học bài - Tabs + Gallery      */}

      {/* Dots below hero, above features (on white bg) */}
      <div className="bg-white py-6">
        <div className="flex justify-center gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setActiveIdx(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeIdx === idx ? "bg-[#2563EB]" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Section (Đã sử dụng component FeatureCard) */}
      <section id="kham-pha-tinh-nang" className="py-16 sm:py-20 bg-white px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-12 text-[#0B1320]">
          Khám phá tính năng
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Card Học bài */}
          <FeatureCard 
            title="Học bài"
            description="Tính năng độc quyền dành cho học sinh Samurai: Học & Luyện tập Choubundoku, làm & nộp BTVN."
          />
          {/* Card Luyện đề */}
          <FeatureCard 
            title="Luyện đề"
            description="Thực chiến đề JLPT và EJU với 2 hình thức: Luyện tập theo dạng bài & Mô phỏng thi thật."
          />
        </div>
      </section>

      {/* Section HỌC BÀI đặt đúng vị trí dưới "Khám phá tính năng" */}
      <section id="hoc-bai" className="w-full bg-[#E9EFFC] pt-14 pb-24 md:pb-28">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-base md:text-lg font-semibold text-[#5B6476] text-center">Giới thiệu tính năng</p>
          <h3 className="text-3xl md:text-4xl font-bold text-[#0B1320] text-center mt-2 uppercase">勉強する</h3>
          <TabsGallery />
        </div>
      </section>

      {/* Section LUYỆN THI */}
      <section id="luyen-thi" className="w-full bg-white pt-14 pb-24 md:pb-28">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-base md:text-lg font-semibold text-[#5B6476] text-center">Giới thiệu tính năng</p>
          <h3 className="text-3xl md:text-4xl font-bold text-[#0B1320] text-center mt-2 uppercase">LUYỆN THI</h3>
          <p className="text-center text-[#0B1320] mt-4 text-sm md:text-base max-w-2xl mx-auto font-medium">
            THỰC CHIẾN JLPT/EJU VỚI CÁC CHẾ ĐỘ LUYỆN THI
          </p>

          {/* Grid 2 cards - chỉ hiển thị, không hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
            <InfoCard
              title="LUYỆN TẬP THEO DẠNG BÀI"
              description="Việc luyện tập theo từng phần trong khoảng thời gian quy định giúp bạn tập trung vào việc giải quyết xác từng câu hỏi, đồng thời rèn luyện kỹ năng cảm nhận và quản lý thời gian hiệu quả."
              icon={<div className='w-[75px] h-[75px] rounded-md bg-gray-300'></div>}
            />

            <InfoCard
              title="MÔ PHỎNG THI THẬT"
              description="Hình thức luyện đề mô phỏng được thiết kế như kỳ thi thật: mỗi phần Ngữ pháp – Từ vựng có thời gian làm bài riêng, và sau khi chuyển sang phần tiếp theo, sẽ không thể quay lại chỉnh sửa đáp án."
              icon={<div className='w-[75px] h-[75px] rounded-md bg-gray-300'></div>}
            />
          </div>

          {/* Lựa chọn kỳ thi bạn muốn luyện tập */}
          <div id="lua-chon-ky-thi" className="mt-16 scroll-mt-25">
            <h4 className="text-2xl md:text-3xl font-bold text-[#0B1320] text-center mb-10">
              LỰA CHỌN KỲ THI BẠN MUỐN LUYỆN TẬP
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              <FeatureCard 
                title="EJU"
                description="Luyện đề EJU SOGO, tiếng Nhật & Toán ngay tại đây"
                primaryText="Luyện đề ngay"
                showSecondary={false}
                hideArrow={true}
                buttonWidthClass="w-[220px] md:w-[240px]"
                cardMaxWidthClass="max-w-[420px]"
                cardHeightClass="min-h-[320px]"
                primaryVariant="yellow"
                onPrimaryClick={() => {
                  navigate('/practice-eju');
                  window.scrollTo(0, 0);
                }}
              />

              <FeatureCard 
                title="JLPT"
                description="Bộ đề đa dạng từ N5 đến N1, tích hợp các tính năng hỗ trợ tuyển thi và mô phỏng chuẩn thực kỳ thi thật để bạn rèn luyện toàn diện trước ngày thi."
                primaryText="Luyện đề ngay"
                showSecondary={false}
                hideArrow={true}
                buttonWidthClass="w-[220px] md:w-[240px]"
                cardMaxWidthClass="max-w-[420px]"
                cardHeightClass="min-h-[320px]"
                primaryVariant="yellow"
                onPrimaryClick={() => {
                  navigate('/practice-jlpt');
                  window.scrollTo(0, 0);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section - Cùng Samurai tối ưu hóa việc học & luyện thi */}
      <section className="w-full bg-[#E9EFFC] pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-center text-3xl md:text-4xl font-extrabold text-[#0B1320] leading-snug">
            Cùng Samurai, tối ưu hóa việc học <br className="hidden md:block" />
            & luyện thi tiếng Nhật
          </h3>

          {/* Grid 2x2 features - Căn giữa đúng */}
          <div className="mt-10 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
              {/* Card 1 */}
              <div className="bg-white rounded-xl p-6 shadow-md w-[454px] h-[292px] max-w-full">
                <div className="w-[56px] h-[56px] bg-gray-300 rounded-md mb-4"></div>
                <h4 className="font-bold text-[#0B1320] text-lg mb-2">
                  Tự động tổng hợp lỗi sai vào sổ tay ngữ pháp cá nhân
                </h4>
                <p className="text-[#5B6476] text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl p-6 shadow-md w-[454px] h-[292px] max-w-full">
                <div className="w-[56px] h-[56px] bg-gray-300 rounded-md mb-4"></div>
                <h4 className="font-bold text-[#0B1320] text-lg mb-2">
                  Phân tích và so sánh từ vựng theo tư duy gốc, giúp hiểu sâu thay vì học thuộc
                </h4>
                <p className="text-[#5B6476] text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl p-6 shadow-md w-[454px] h-[292px] max-w-full">
                <div className="w-[56px] h-[56px] bg-gray-300 rounded-md mb-4"></div>
                <h4 className="font-bold text-[#0B1320] text-lg mb-2">
                  Theo dõi và kiểm soát tiến độ ôn tập bằng repetition learning và spaced review
                </h4>
                <p className="text-[#5B6476] text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl p-6 shadow-md w-[454px] h-[292px] max-w-full">
                <div className="w-[56px] h-[56px] bg-gray-300 rounded-md mb-4"></div>
                <h4 className="font-bold text-[#0B1D] text-lg mb-2">
                  Hệ thống Flashcard thông minh tự động tạo từ dữ liệu lỗi sai của học viên
                </h4>
                <p className="text-[#5B6476] text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
                </p>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <div className="mt-10 flex justify-center">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black border-none px-6 py-3 font-medium shadow">
              Vào học ngay
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <FeedbackSection />

      {/* Weekly Leaderboard */}
      <WeeklyLeaderboard />

    </ContentHighlighter>

    {/* 🌟 NEW: MODAL FOR TRANSLATION (ĐÃ SỬA LỖI) 🌟 */}
    <TranslationModal
        isVisible={!!translation || isLoading || !!error}
        isLoading={isLoading}
        originalText={originalText}
        translation={translation}
        onClose={clearTranslation}
    />
    
    {/* 🌟 NEW: NOTEPAD MODAL 🌟 */}
    <NotepadModal 
      isVisible={isNotepadVisible}
      onClose={() => setIsNotepadVisible(false)}
    />

    <Footer />
  </div>
);
}

export default function HomePage() {
  return (
    <AnnotationProvider>
      <HomePageContent />
    </AnnotationProvider>
  );
}