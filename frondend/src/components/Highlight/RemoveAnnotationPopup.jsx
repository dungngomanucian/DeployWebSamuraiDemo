import React from 'react';
// Icon thùng rác
const TrashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const RemoveAnnotationPopup = ({ popupData, onRemove, onClose }) => {
    if (!popupData || !popupData.id) return null;

    const { x, y, id, type } = popupData;
    
    const actionText = type === 'note' ? 'Remove Note' : 'Remove Highlight';

    const style = {
        left: x,
        top: y,
        // Dịch lên trên 100% (chiều cao của chính popup) để nằm ngay trên vùng highlight/note
        // và dịch sang trái 50% để căn giữa.
        transform: 'translate(-50%, -100%)', 
        zIndex: 10000, 
    };

    return (
        // Thêm class 'remove-popup' để Listener Xóa/Tạo biết bỏ qua khi click
        <div
            className="remove-popup absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl tooltip tooltip-bottom" 
            data-tip="Click để xóa"
            style={style}
            onMouseDown={(e) => e.stopPropagation()} // Ngăn chặn sự kiện mousedown đóng modal
        >
            <button
                className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition-colors"
                onClick={() => onRemove(id)} // Gọi hàm xóa với ID annotation
            >
                <TrashIcon className="w-4 h-4" />
                {actionText}
            </button>
            
            {/* Mũi tên tooltip (tùy chọn) */}
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-gray-800"></span>
        </div>
    );
};

export default RemoveAnnotationPopup;