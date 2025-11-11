import React, { useState } from 'react';
// Giả định bạn đang sử dụng thư viện icon như Lucide hoặc Feather
const NoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>; 
const HighlightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M15 5l4 4"/></svg>; 
// 🌟 ICON MỚI: Icon cho chức năng dịch 🌟
const TranslateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>;

const HighlightAndAnnotationPopup = ({ position, onAction, onClosePopup, showTranslateButton }) => { 
    if (!position) return null;

    const [isNoteInputVisible, setIsNoteInputVisible] = useState(false);
    const [noteText, setNoteText] = useState('');
    
    const NOTE_COLOR = 'gray'; 

    const style = {
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -110%)', 
        zIndex: 9999,
    };

    const handleNoteClick = (e) => {
        e.stopPropagation(); // Chặn click vào nút Note nổi bọt lên
        setIsNoteInputVisible(true);
    };
    
    const handleSave = () => {
        onAction('note', NOTE_COLOR, noteText); 
        setNoteText('');
        setIsNoteInputVisible(false);
        onClosePopup(); 
    };

    const handleCancel = () => {
        setNoteText('');
        setIsNoteInputVisible(false);
        onClosePopup(); 
    };


    return (
        <div
            className="highlight-popup absolute bg-base-100 rounded-xl shadow-2xl border border-gray-200 p-2 flex flex-col items-center animate-fade-in"
            style={style}
            // 🌟 KHẮC PHỤC: DÙNG onMouseUp THAY CHO onMouseDown cho Popup chính
            // Khi nhấn nút trên Popover nhập liệu, sự kiện MouseUp vẫn nổi lên đây, và chúng ta chặn nó lại.
            onMouseUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            tabIndex={-1} 
        >
            {/* 1. Hàng nút chính (Note & Highlight) */}
            <div className="flex gap-4">
                
                {/* Nút Note */}
                <button
                    className="btn btn-ghost btn-sm flex-col p-1 h-auto min-h-0 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={handleNoteClick} 
                >
                    <NoteIcon />
                    <span className="text-xs font-semibold mt-1">Note</span>
                </button>

                {/* Nút Highlight */}
                <button
                    className="btn btn-ghost btn-sm flex-col p-1 h-auto min-h-0 text-gray-700 hover:text-yellow-600 transition-colors"
                    onClick={() => {
                        onAction('highlight', 'yellow');
                        onClosePopup(); // Đóng popup ngay sau khi highlight
                    }} 
                >
                    <HighlightIcon />
                    <span className="text-xs font-semibold mt-1">Highlight</span>
                </button>

                {/* 🌟 NÚT TRA CỨU (MỚI) 🌟 */}
                {showTranslateButton && (
                    <button
                        className="btn btn-ghost btn-sm flex-col p-1 h-auto min-h-0 text-gray-700 hover:text-green-600 transition-colors"
                        onClick={() => {
                            onAction('translate');
                            onClosePopup(); // Đóng popup ngay sau khi nhấn
                        }}
                    >
                        <TranslateIcon />
                        <span className="text-xs font-semibold mt-1">Tra cứu</span>
                    </button>
                )}
            </div>

            {/* 2. Modal/Popover Input Note */}
            {isNoteInputVisible && (
                <div 
                    className="absolute top-full mt-3 p-4 bg-white rounded-lg shadow-2xl border border-gray-300 w-64 flex flex-col animate-scale-up"
                    style={{ transform: 'translateX(-50%)' }} 
                    // 🌟 KHẮC PHỤC: Chặn MouseDown/MouseUp trên Popover Input 🌟
                    // Điều này ngăn click vào Textarea/Save/Cancel nổi bọt lên document và kích hoạt logic đóng.
                    onMouseDown={(e) => e.stopPropagation()} 
                    onMouseUp={(e) => e.stopPropagation()}
                >
                    <textarea
                        className="textarea textarea-bordered h-24 w-full text-base resize-none focus:outline-none focus:border-indigo-400"
                        placeholder="Nhập ghi chú của bạn..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    ></textarea>
                    
                    <div className="flex justify-end gap-2 mt-3">
                        <button className="btn btn-sm btn-ghost" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button 
                            className="btn btn-sm btn-primary bg-indigo-600 text-white hover:bg-indigo-700" 
                            onClick={handleSave}
                            disabled={noteText.trim() === ''} 
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HighlightAndAnnotationPopup;
