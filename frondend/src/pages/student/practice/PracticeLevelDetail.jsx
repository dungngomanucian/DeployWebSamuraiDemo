import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const PracticeCategory = ({ title, items, color, borderColor, textColor, isTopRow = false }) => {
  return (
    <div className={`bg-white rounded-[70px] p-8 shadow-lg w-full md:w-[460px] border-3 ${isTopRow ? 'h-[540px]' : 'h-auto'} flex flex-col`} style={{ borderColor: '#757575' }}>
      <div className="text-center mb-8">
        <h3 className="text-6xl font-semibold text-[#0B1320] mb-2">{title}</h3>
        <div className="border-b-4 mx-4 mt-3 rounded-full" style={{ borderColor: '#757575' }}></div>
      </div>
      
      <div className="space-y-6 flex-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <button 
              className={`w-56 h-10 flex items-center justify-center px-6 py-3 rounded-full font-medium text-lg hover:opacity-90 transition-opacity overflow-hidden whitespace-nowrap text-ellipsis ${textColor}`}
              style={{ 
                backgroundColor: color,
                borderColor: borderColor,
                borderWidth: '4px',
                borderStyle: 'solid',
              }}
            >
              {item.name}
            </button>

            <div className="flex items-center gap-4">
              <div className="w-[84px] h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    backgroundColor: color,
                    width: `${(item.progress / 300) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-lg font-semibold text-[#1E1E1E] min-w-[70px]">
                {item.progress}/300
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PracticeLevelDetail() {
  const [selectedLevel, setSelectedLevel] = useState('N3'); // Default to N3
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const levelParam = params.get('level');
    
    const url = window.location.href;
    const match = url.match(/[?&]level=([^&]*)/);
    const levelFromRegex = match ? match[1] : null;
    
    if (levelParam) {
      setSelectedLevel(levelParam);
      setForceUpdate(prev => prev + 1);
    } else if (levelFromRegex) {
      setSelectedLevel(levelFromRegex);
      setForceUpdate(prev => prev + 1);
    }
  }, []);

  // Thêm useEffect để listen cho URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const levelParam = params.get('level');
      if (levelParam && levelParam !== selectedLevel) {
        setSelectedLevel(levelParam);
        setForceUpdate(prev => prev + 1);
      }
    };

    // Listen for popstate events (back/forward button)
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [selectedLevel]);


  const categories = [
    {
      title: "文字語彙",
      color: "#FFC943",
      borderColor: "#E8A302",
      textColor: "text-black",
      items: [
        { name: "Cách đọc Kanji", progress: 0 },
        { name: "Cách đọc Hiragana", progress: 0 },
        { name: "Cấu tạo từ", progress: 0 },
        { name: "Biểu hiện từ", progress: 0 },
        { name: "Đồng nghĩa", progress: 0 },
        { name: "Cách dùng từ", progress: 0 }
      ]
    },
    {
      title: "読解",
      color: "#5AD8CC",
      borderColor: "#369E94",
      textColor: "text-black",
      items: [
        { name: "Đoản văn", progress: 40 },
        { name: "Trung văn", progress: 20 },
        { name: "Trường văn", progress: 10 },
        { name: "So sánh", progress: 0 },
        { name: "Tìm kiếm thông tin", progress: 0 }
      ]
    },
    {
      title: "聴解",
      color: "#F24822",
      borderColor: "#BD2915",
      textColor: "text-white",
      items: [
        { name: "Vấn đề hiểu", progress: 0 },
        { name: "Điểm hiểu", progress: 0 },
        { name: "Trả lời nhanh", progress: 0 },
        { name: "Nghe hiểu tổng hợp", progress: 0 }
      ]
    },
    {
      title: "文法",
      color: "#874FFF",
      borderColor: "#5427B4",
      textColor: "text-white",
      items: [
        { name: "Trắc nghiệm", progress: 0 },
        { name: "Sắp xếp câu", progress: 0 },
        { name: "Đục lỗ", progress: 0 }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EFFC]" key={`${selectedLevel}-${forceUpdate}`}>
      <Navbar />

      {/* Header */}
      <section className="w-full bg-white pt-10 pb-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0B1320] mb-4">
            LUYỆN TẬP THEO DẠNG BÀI
          </h1>
          <h2 className="text-6xl md:text-7xl font-extrabold text-[#0B1320]">
            LEVEL {selectedLevel}
          </h2>
        </div>
      </section>

      {/* Main Content - 4 Grid Layout */}
      <section className="w-full bg-white pb-32 pt-16">
        <div className="max-w-6xl mx-auto px-19">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-6 justify-items-center mb-8">
            <PracticeCategory
              title={categories[0].title}
              items={categories[0].items}
              color={categories[0].color}
              borderColor={categories[0].borderColor}
              textColor={categories[0].textColor}
              isTopRow={true}
            />
            <PracticeCategory
              title={categories[1].title}
              items={categories[1].items}
              color={categories[1].color}
              borderColor={categories[1].borderColor}
              textColor={categories[1].textColor}
              isTopRow={true}
            />
          </div>
          
          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-8 justify-items-center">
            <PracticeCategory
              title={categories[2].title}
              items={categories[2].items}
              color={categories[2].color}
              borderColor={categories[2].borderColor}
              textColor={categories[2].textColor}
              isTopRow={false}
            />
            <PracticeCategory
              title={categories[3].title}
              items={categories[3].items}
              color={categories[3].color}
              borderColor={categories[3].borderColor}
              textColor={categories[3].textColor}
              isTopRow={false}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
