import React, { useState } from 'react';

// Dữ liệu giả lập (Mock data)
// Sau này, bro sẽ fetch (tải) data này từ API
// 'blue' = học tốt (hoặc đã học), 'red' = học kém (hoặc đã nghỉ)
const MOCK_STUDY_DATA = {
  '2025-10-01': 'blue',
  '2025-10-02': 'blue',
  '2025-10-03': 'blue',
  '2025-10-06': 'red',
  '2025-10-07': 'blue',
  '2025-10-08': 'red',
  '2025-10-09': 'blue',
  '2025-10-10': 'blue',
  '2025-10-13': 'blue',
  '2025-10-14': 'blue',
  '2025-10-15': 'blue',
  '2025-10-16': 'blue',
  '2025-10-17': 'blue',
  '2025-10-18': 'red',
  '2025-10-19': 'red',
  // 20/10 (hôm nay) chưa có data
};

// Hàm helper để tạo key YYYY-MM-DD
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Calendar = () => {
const [displayDate, setDisplayDate] = useState(new Date());
  
  // SỬA: Thêm state cho animation
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);

  // SỬA: Cập nhật hàm handlePrevMonth
  const handlePrevMonth = () => {
    setIsCalendarVisible(false); // 1. Mờ đi
    setTimeout(() => {
      const prevMonth = new Date(
        displayDate.getFullYear(),
        displayDate.getMonth() - 1, // 2. Đổi tháng
        1
      );
      setDisplayDate(prevMonth);
      setIsCalendarVisible(true); // 3. Hiện ra
    }, 300); // Khớp với duration
  };

  // SỬA: Cập nhật hàm handleNextMonth
  const handleNextMonth = () => {
    setIsCalendarVisible(false); // 1. Mờ đi
    setTimeout(() => {
      const nextMonth = new Date(
        displayDate.getFullYear(),
        displayDate.getMonth() + 1, // 2. Đổi tháng
        1
      );
      setDisplayDate(nextMonth);
      setIsCalendarVisible(true); // 3. Hiện ra
    }, 300); // Khớp với duration
  };
  // ============================

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const monthName = displayDate.toLocaleString('vi-VN', { month: 'long' });

  const isCurrentMonthOrFuture = 
    year > new Date().getFullYear() || 
    (year === new Date().getFullYear() && month >= new Date().getMonth());

  // 3. Logic lấy ngày
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = [];
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    daysInMonth.push(new Date(year, month, d));
  }

  // 4. Logic lấy ngày "padding" (ngày mờ của tháng trước)
  // (Wireframe bắt đầu từ T2)
  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0=T2, 1=T3, ... 6=CN
  const paddingDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    const paddingDate = new Date(year, month, 0 - i);
    paddingDays.unshift(paddingDate); // Thêm vào đầu
  }

  // 5. Logic lấy ngày "padding" (ngày mờ của tháng sau)
  const totalDaysInGrid = 42; // Lịch luôn có 6 hàng * 7 cột = 42 ô
  const nextPaddingCount = totalDaysInGrid - (paddingDays.length + daysInMonth.length);
  const nextPaddingDays = [];
  for (let i = 1; i <= nextPaddingCount; i++) {
    nextPaddingDays.push(new Date(year, month + 1, i));
  }
  
  // 6. Gộp 3 mảng lại
  const allDays = [...paddingDays, ...daysInMonth, ...nextPaddingDays];
  const todayKey = formatDateKey(new Date()); // Key của ngày hôm nay

  return (
    <div className="bg-white p-6 rounded-xl shadow-md ">
      
      {/* 1. Header (Tựa đề + Nút tháng) */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <p className="font-bold text-gray-800 uppercase">TẦN SUẤT HỌC</p>
          <div className="w-28 border-b-4 border-gray-300 rounded-full mt-1"></div>
        </div>

        {/* Bọc nút tháng trong 1 div flex để thêm 2 nút < > */}
        <div className="flex items-center gap-2">
          {/* Nút LÙI tháng */}
          <button 
            onClick={handlePrevMonth} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            &lt;
          </button>
          
          {/* Tên Tháng */}
          <span className="bg-yellow-400 text-gray-800 font-semibold px-4 py-2 rounded-full text-sm capitalize w-28 text-center">
            {monthName}
          </span>
          
          {/* Nút TIẾN tháng */}
          <button 
            onClick={handleNextMonth} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={isCurrentMonthOrFuture}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* 2. Lưới Lịch */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isCalendarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}
        `}
      >
        <div className="grid grid-cols-7 gap-y-2 text-center">
            
            {/* Hàng Tên Thứ (Mo, Tu, We...) */}
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
            <div 
                key={day} 
                className={`text-xs font-semibold ${i >= 5 ? 'text-blue-500' : 'text-gray-400'}`}
            >
                {day}
            </div>
            ))}

            {/* SỬA: Dùng map để render 42 ngày */}
            {allDays.map((date, index) => {
            const dateKey = formatDateKey(date);
            const status = MOCK_STUDY_DATA[dateKey]; // Lấy status từ data
            const isCurrentMonth = date.getMonth() === month;
            const isToday = dateKey === todayKey;

            // Style cho ngày
            let dayClass = 'text-gray-800'; // Mặc định
            if (!isCurrentMonth) {
                dayClass = 'text-gray-300'; // Ngày mờ
            } else if (status === 'blue') {
                dayClass = 'bg-blue-500 text-white'; // Tần suất tốt
            } else if (status === 'red') {
                dayClass = 'bg-red-600 text-white'; // Tần suất tệ/nghỉ
            }

            // Style cho viền (hôm nay)
            const todayBorder = isToday ? 'border-2 border-blue-700' : '';

            return (
                <div 
                key={index} 
                className={`
                    w-6 h-6 flex items-center justify-center mx-auto rounded-full text-sm
                    ${dayClass}
                    ${todayBorder}
                `}
                >
                {date.getDate()}
                </div>
            );
            })}
        </div>
      </div>



    </div>
  );
};

export default Calendar;