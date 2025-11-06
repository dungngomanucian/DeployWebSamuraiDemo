// src/components/ProfilePage.jsx
import React, { useState } from 'react';
import PracticeSummary from './PracticeSummary';
import { HiOutlineUserCircle, HiOutlineBookOpen, HiOutlinePencil, HiOutlineCalendar, HiOutlineLibrary, HiOutlineCollection } from 'react-icons/hi';

// TODO: API sẽ lấy data này
const mockProfileData = {
  name: 'Nguyễn Bình Minh',
  dob: '12/12/2008',
  school: 'THPT Chuyên Ngoại ngữ',
  classes: ['2501.SAMURAI.N2', '2510.SAMURAI.EJU.SOGO1'],
  // Data cho PracticeSummary (sẽ được tải từ API)
  practice_summary: {
    "N2": {
      "overall": 120, "maxOverall": 180, "request_score": 90,
      "sections": [
        { "title": "TVCH", "score": 32, "max": 35, "isLow": false },
        { "title": "NGỮ PHÁP", "score": 25, "max": 25, "isLow": false },
        { "title": "ĐỌC HIỂU", "score": 40, "max": 60, "isLow": false },
        { "title": "NGHE HIỂU", "score": 23, "max": 60, "isLow": true }
      ]
    },
    // ... data cho N1, N3...
  }
};

const ProfilePage = ({ profileData, isLoading }) => {
  // State để quản lý tab "Luyện đề" / "Học bài"
  const [activeTab, setActiveTab] = useState('luyen_de'); 

  return (
    <div className="p-8">
      
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Profile học viên
      </h1>
      
      {/* 1. Phần Header Profile (Ảnh 2) */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-white shadow-lg rounded-xl">
        {/* Ảnh Profile */}
        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400 rounded-l-xl">
          Ảnh Profile
        </div>
        {/* Thông tin */}
        <div className="flex-1 px-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{mockProfileData.name}</h1>
            <a href="#" className="text-sm font-medium text-blue-600">Sửa</a>
          </div>
          <div className="space-y-3 text-gray-700"> {/* Tăng space-y một chút */}
            {/* D.O.B */}
            <div className="flex items-center gap-3">
              <HiOutlineCalendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span><strong>D.O.B:</strong> {mockProfileData.dob}</span>
            </div>
            {/* Trường */}
            <div className="flex items-center gap-3">
              <HiOutlineLibrary className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span><strong>Trường:</strong> {mockProfileData.school}</span>
            </div>
            {/* Lớp tại Samurai */}
            <div className="flex items-start gap-3"> {/* Dùng items-start để icon căn lề trên */}
              <HiOutlineCollection className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex flex-wrap gap-2 items-center">
                <strong>Lớp tại Samurai:</strong>
                {mockProfileData.classes.map(cls => (
                  <span key={cls} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Phần Tabs (Ảnh 2) */}
      <div className="flex items-center border-b-2 border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('luyen_de')}
          className={`py-3 px-6 font-semibold text-lg ${activeTab === 'luyen_de' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500'}`}
        >
          Luyện đề
        </button>
        <button 
          onClick={() => setActiveTab('hoc_bai')}
          className={`py-3 px-6 font-semibold text-lg ${activeTab === 'hoc_bai' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500'}`}
        >
          Học bài
        </button>
      </div>

      {/* 3. Phần Nội dung (Ảnh 2 & 3) */}
      {activeTab === 'luyen_de' ? (
        <div className="space-y-6">
          {/* Mục tiêu & Điểm TB (Tái sử dụng PracticeSummary) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              {/* (Card Mục tiêu - Tạm thời) */}
              <h4 className="font-bold mb-2">Mục tiêu</h4>
              <p className="text-5xl font-bold text-blue-700">130+</p>
              <p>/180</p>
            </div>
            <div className="md:col-span-2">
              <PracticeSummary 
                practiceData={mockProfileData.practice_summary} 
                isLoading={false} 
              />
            </div>
          </div>
          
          {/* Tỷ lệ lỗi sai (Tạm thời) */}
          <div className="bg-white p-6 rounded-xl shadow-md">
             <h4 className="font-bold">Tỷ lệ lỗi sai (Đang cập nhật)</h4>
             {/* ... (Code cho 4 cột TVCH, Ngữ pháp... sẽ ở đây) ... */}
          </div>

          {/* Thống kê điểm (Tạm thời) */}
          <div className="bg-white p-6 rounded-xl shadow-md">
             <h4 className="font-bold">Thống kê điểm (Đang cập nhật)</h4>
             {/* ... (Code cho biểu đồ cột sẽ ở đây) ... */}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">
          Nội dung "Học bài" đang được xây dựng.
        </div>
      )}
    </div>
  );
};

export default ProfilePage;