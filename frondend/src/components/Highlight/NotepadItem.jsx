import React, { useState } from 'react';
// Giả định các icons từ Lucide
const MoreVertical = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const EditIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const TrashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// Component NotepadItem
const NotepadItem = ({ annotation, onScroll, onDelete, onEdit }) => {
    const isNote = annotation.type === 'note';
    // isMenuOpen quản lý trạng thái hiển thị của menu ba chấm
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    
    // Lấy 60 ký tự đầu tiên của đoạn được chọn
    const displayText = annotation.text.substring(0, 60) + (annotation.text.length > 60 ? '...' : '');

    return (
        // Container chính cho mỗi Item
        <div
            className={`p-3 mb-3 rounded-lg shadow-sm border transition-all hover:shadow-md relative`}
            style={{ backgroundColor: isNote ? '#e0f7fa' : '#fffbe0' }} // Cyan/Yellow nhạt
        >
            <div className="flex justify-between items-start">
                
                {/* Khu vực Nội dung - Click để scroll */}
                <div 
                    className="flex-1 cursor-pointer pr-4"
                    onClick={() => onScroll(annotation.id)} // Cuộn đến vị trí annotation trong bài thi
                >
                    <p className="text-sm font-semibold mb-1 flex justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isNote ? 'bg-red-500 text-white' : 'bg-yellow-500 text-gray-800'}`}>
                            {isNote ? '📝 Note' : '✨ Highlight'}
                        </span>
                        <span className="text-xs text-gray-500">{annotation.date}</span>
                    </p>
                    <p className="text-gray-900 text-sm leading-snug italic mt-2 line-clamp-2">
                        "{displayText}"
                    </p>
                    {isNote && annotation.note && (
                        // 🌟 HIỂN THỊ NOTE (KHÔNG PHẢI CHẾ ĐỘ SỬA) 🌟
                        <p className="text-xs text-blue-800 mt-2 p-1 border-t border-gray-200">
                            Ghi chú: {annotation.note}
                        </p>
                    )}
                </div>

                {/* 🌟 NÚT BA CHẤM (MENU) 🌟 */}
                <div 
                    // Loại bỏ lớp 'dropdown' và 'dropdown-open' để kiểm soát thủ công 
                    className={`absolute top-3 right-3`}
                >
                    <button 
                        // Loại bỏ tabIndex=0 vì không muốn nó tự động focus/blur
                        role="button" 
                        className="btn btn-xs btn-ghost p-1"
                        aria-label="Tùy chọn"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setIsMenuOpen(prev => !prev); // TOGGLE MENU
                        }}
                    >
                        <MoreVertical />
                    </button>
                    {/* Kiểm tra isMenuOpen để render menu */}
                    {isMenuOpen && (
                        // Dùng Popover thay vì Dropdown DaisyUI phức tạp
                        <ul 
                            // Loại bỏ tabIndex=-1
                            className="absolute top-full right-0 mt-1 z-[100] menu p-2 shadow bg-base-100 rounded-box w-32 border border-gray-100" // Tăng Z-index cho menu con
                            onMouseDown={(e) => e.stopPropagation()} // Ngăn chặn mousedown làm mất focus ngay lập tức
                        >
                            {/* Nút Edit (Chỉ hiển thị cho Note) */}
                            {isNote && (
                                <li>
                                    <a onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onEdit(annotation.id, annotation.note); 
                                        setIsMenuOpen(false); // ĐÓNG MENU KHI EDIT
                                    }}>
                                        <EditIcon className="w-4 h-4" /> Edit
                                    </a>
                                </li>
                            )}
                            {/* Nút Delete */}
                            <li>
                                <a onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onDelete(annotation.id); 
                                    setIsMenuOpen(false); // ĐÓNG MENU KHI DELETE
                                }}>
                                    <TrashIcon className="w-4 h-4" /> Delete
                                </a>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotepadItem;
