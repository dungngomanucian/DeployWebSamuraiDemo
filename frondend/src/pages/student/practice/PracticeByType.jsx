import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const LEVELS = [
  {
    code: "N5",
    list_items: [
      "Nắm vững 103 chữ Hán, 800 từ vựng, 40 ngữ pháp N5",
      "Thành thạo từng dạng để mỗi kỹ năng nghe, đọc, TVCH cơ bản",
      "Tổng hợp hồ sơ những lỗi sai đã mắc và có cơ chế ôn tập lại",
      "THI ĐỖ JLPT N5",
    ],
  },
  {
    code: "N4",
    list_items: [
      "Nắm vững 181 chữ Hán, 1,500 từ vựng, 80 ngữ pháp N4",
      "Thành thạo từng dạng để mỗi kỹ năng nghe, đọc, TVCH trung cấp",
      "Tổng hợp hồ sơ những lỗi sai đã mắc và có cơ chế ôn tập lại",
      "THI ĐỖ JLPT N4",
    ],
  },
  {
    code: "N3",
    list_items: [
      "Nắm vững 393 chữ Hán, 860 từ vựng, 128 ngữ pháp N3",
      "Thành thạo từng dạng đề mỗi kỹ năng nghe, đọc, TVCH",
      "Tổng hợp hồ sơ những lỗi sai đã mắc và có cơ chế ôn tập lại",
      "THI ĐỖ JLPT N3",
    ],
  },
  {
    code: "N2",
    list_items: [
      "Nắm vững 739 chữ Hán, 1,200 từ vựng, 180 ngữ pháp N2",
      "Thành thạo từng dạng đề mỗi kỹ năng nghe, đọc, TVCH chuyên sâu",
      "Tổng hợp hồ sơ những lỗi sai đã mắc và có cơ chế ôn tập lại",
      "THI ĐỖ JLPT N2",
    ],
  },
  {
    code: "N1",
    list_items: [
      "Nắm vững 1,200 chữ Hán, 1,500 từ vựng, 200 ngữ pháp N1",
      "Thành thạo từng dạng đề mỗi kỹ năng nghe, đọc, TVCH thành thạo",
      "Tổng hợp hồ sơ những lỗi sai đã mắc và có cơ chế ôn tập lại",
      "THI ĐỖ JLPT N1",
    ],
  },
];

export default function PracticeByType() {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const x = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(2);
  const [itemStep, setItemStep] = useState(0);
  const [bounds, setBounds] = useState({ left: -1000, right: 1000 });

  // Dimensions consistent with design
  const PILL_WIDTH = 125;
  const PILL_HEIGHT = 432;
  const GAP_PX = 64; // gap-16

  useEffect(() => {
    const calc = () => {
      const container = containerRef.current;
      const firstItem = itemsRef.current[0];
      if (!container || !firstItem) return;

      const containerWidth = container.clientWidth;
      const itemWidth = PILL_WIDTH;
      const gap = GAP_PX;
      const step = itemWidth + gap;
      setItemStep(step);

      const centerOffset = (containerWidth - itemWidth) / 2;
      const minX = -((LEVELS.length - 1) * step - centerOffset);
      const maxX = centerOffset;
      setBounds({ left: minX - 40, right: maxX + 40 });

      const target = -(activeIndex * step - centerOffset);
      animate(x, target, { type: "spring", stiffness: 180, damping: 20 });
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateToIndex = (index) => {
    const container = containerRef.current;
    if (!container || itemStep === 0) return;
      const containerWidth = container.clientWidth;
      const itemWidth = PILL_WIDTH;
    const centerOffset = (containerWidth - itemWidth) / 2;
    const target = -(index * itemStep - centerOffset);
    animate(x, target, { type: "spring", stiffness: 160, damping: 20 });
    setActiveIndex(index);
  };

  const handleDragEnd = (event, info) => {
    const currentX = x.get();
    const container = containerRef.current;
    if (!container || itemStep === 0) return;
    const containerWidth = container.clientWidth;
    const itemWidth = PILL_WIDTH;
    const centerOffset = (containerWidth - itemWidth) / 2;
    const raw = (centerOffset + currentX) / itemStep;
    let idx = Math.round(raw);
    idx = Math.max(0, Math.min(LEVELS.length - 1, idx));
    animateToIndex(idx);
  };

  const onPillClick = (i) => {
    animateToIndex(i);
  };

  itemsRef.current = [];
  const activeLevel = LEVELS[activeIndex];

  const wrapIndex = (i) => {
    const len = LEVELS.length;
    return (i + len) % len;
  };
  
  // Tính toán các pill xung quanh level đang active
  const leftIndices = [wrapIndex(activeIndex - 2), wrapIndex(activeIndex - 1)];
  const rightIndices = [wrapIndex(activeIndex + 1), wrapIndex(activeIndex + 2)];

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]">
      <Navbar />

      {/* HEADER on white background */}
      <section className="w-full bg-white pt-10 pb-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B1320] mb-4">
            LUYỆN TẬP THEO DẠNG BÀI
          </h1>
          <p className="text-[#0B1320] max-w-3xl mx-auto text-base md:text-xl leading-relaxed">
            Việc luyện tập theo từng phần trong khoảng thời gian quy định giúp bạn tập trung vào việc giải
            chính xác từng câu hỏi, đồng thời rèn luyện khả năng cảm nhận và quản lý thời gian hiệu quả.
          </p>
        </div>
      </section>

      {/* LEVEL SELECTOR on blue background */}
      <section className="w-full bg-[#E9EFFC] pb-32 pt-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-3xl shadow-2xl p-6 lg:p-8 w-[430px] h-[480px] max-w-full"
            style={{ filter: "drop-shadow(0 15px 15px rgba(0, 0, 0, 0.1))" }}
          >
            <div className="text-center mb-6">
              <div className="mx-auto bg-gray-200 rounded-full" style={{ width: '95%', padding: '14px 0' }}>
                <h3 className="text-4xl font-bold text-[#0B1320] text-center">LEVEL {activeLevel.code}</h3>
              </div>
            </div>

            <ul className="space-y-4 text-[#0B1320] text-lg mb-8 text-left">
              {activeLevel.list_items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span className={index === activeLevel.list_items.length - 1 ? "font-semibold" : ""}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-center">
              <button 
                onClick={() => {
                  window.location.href = `/practice-level-detail?level=${activeLevel.code}`;
                }}
                className="rounded-full bg-[#4169E1] hover:bg-[#365AAB] text-white border-none text-[16px] font-medium w-[239px] h-[52px] shadow-lg cursor-pointer"
              >
                Luyện tập ngay
              </button>
            </div>
          </motion.div>

          <div className="relative h-[432px]">
            <div className="flex items-center justify-center gap-16 h-full">
              {/* Left 2 pills */}
              {leftIndices.map((idx, i) => (
                <motion.div 
                  key={`L-${LEVELS[idx].code}`} 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <motion.div
                    onClick={() => setActiveIndex(idx)}
                    role="button"
                    tabIndex={0}
                    className="relative select-none bg-white rounded-[62px] shadow-lg w-[125px] h-[432px] border border-[rgba(15,23,42,0.04)] cursor-pointer hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[99px] h-[99px] rounded-full bg-[#E5E7EB] flex items-center justify-center shadow">
                      <span className="text-[#0B1320] font-bold text-2xl">{LEVELS[idx].code}</span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}

              {/* Spacer equals to detail card width */}
              <div className="w-[430px] h-[432px] shrink-0" />

              {/* Right 2 pills */}
              {rightIndices.map((idx, i) => (
                <motion.div 
                  key={`R-${LEVELS[idx].code}`} 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <motion.div
                    onClick={() => setActiveIndex(idx)}
                    role="button"
                    tabIndex={0}
                    className="relative select-none bg-white rounded-[62px] shadow-lg w-[125px] h-[432px] border border-[rgba(15,23,42,0.04)] cursor-pointer hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[99px] h-[99px] rounded-full bg-[#E5E7EB] flex items-center justify-center shadow">
                      <span className="text-[#0B1320] font-bold text-2xl">{LEVELS[idx].code}</span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
