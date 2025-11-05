import React, { useState, useMemo, useEffect } from 'react'; // Thêm useEffect
import { useAnnotationContext } from '../../context/AnnotationContext';
import NotepadItem from './NotepadItem';
// Giả định icon tìm kiếm từ Lucide
const SearchIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CloseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>;

const NotepadModal = ({ isVisible, onClose }) => {
    const { annotations, scrollHandler, editAnnotation, removeAnnotationHandler } = useAnnotationContext(); 
    const [searchTerm, setSearchTerm] = useState('');
    
    const [editingNote, setEditingNote] = useState(null); // { id: string, initialNote: string }

    // 🌟 LOGIC MỚI: TỰ ĐỘNG ĐÓNG TẤT CẢ MENU DROPDAWN KHI MODAL EDIT MỞ 🌟
    useEffect(() => {
        if (editingNote) {
            // Lấy tất cả các button dropdown đang mở và buộc chúng mất focus (tắt menu)
            const openButtons = document.querySelectorAll('.dropdown-end button[tabindex="0"]:focus');
            openButtons.forEach(button => button.blur());
        }
    }, [editingNote]);
    // -------------------------------------------------------------

    const filteredAnnotations = useMemo(() => {
        if (!searchTerm) {
            return [...annotations].reverse();
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        
        return [...annotations]
            .filter(ann => 
                ann.text.toLowerCase().includes(lowerCaseSearch) || // Tìm trong đoạn văn bản bôi đen
                (ann.note && ann.note.toLowerCase().includes(lowerCaseSearch)) // Tìm trong ghi chú
            )
            .reverse(); // Hiển thị mới nhất lên trước
    }, [annotations, searchTerm]);
    

    const handleItemClick = (id) => {
        if (scrollHandler) {
            scrollHandler(id); 
            onClose(); 
        }
    };
    
    // HÀM XỬ LÝ XÓA
    const handleDelete = (id) => {
        if (removeAnnotationHandler) {
            removeAnnotationHandler(id);
        }
    };
    
    // HÀM XỬ LÝ CHỈNH SỬA (Mở Modal)
    const handleEdit = (id, currentNote) => {
        // Mở Modal chỉnh sửa và điền nội dung cũ vào
        setEditingNote({ id: id, initialNote: currentNote });
    };

    // HÀM LƯU CHỈNH SỬA
    const handleSaveEdit = () => {
        if (editingNote.initialNote.trim()) {
            editAnnotation(editingNote.id, editingNote.initialNote);
        } else {
             handleDelete(editingNote.id);
        }
        setEditingNote(null);
    };


    return (
        <>
            <div className={`modal ${isVisible ? 'modal-open' : ''} transition-opacity duration-300`}>
                <div className="modal-box w-11/12 max-w-lg bg-white shadow-3xl">
                    <h3 className="text-2xl font-extrabold text-indigo-700 border-b-2 border-gray-200 pb-3 mb-4 flex items-center justify-between">
                        Notepad
                        <button className="btn btn-sm btn-ghost p-1" onClick={onClose} aria-label="Đóng Notepad">
                            <CloseIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </h3>
                    
                    {/* 🌟 Ô TÌM KIẾM (Search Input) 🌟 */}
                    <div className="mb-4 relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm trong ghi chú và highlight..."
                            className="input input-bordered w-full pl-10 pr-4 rounded-full text-base focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {/* --------------------------------- */}
                    
                    {/* MODAL CHỈNH SỬA NOTE */}
                    {editingNote && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"> 
                            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm z-[101]">
                                <h4 className="text-lg font-bold mb-3">Chỉnh sửa Ghi chú</h4>
                                <textarea
                                    className="textarea textarea-bordered w-full h-24 resize-none"
                                    value={editingNote.initialNote}
                                    onChange={(e) => setEditingNote(prev => ({ ...prev, initialNote: e.target.value }))}
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button 
                                        className="btn btn-ghost" 
                                        onClick={() => setEditingNote(null)}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        className="btn btn-primary bg-indigo-600 text-white hover:bg-indigo-700" 
                                        onClick={handleSaveEdit}
                                        disabled={editingNote.initialNote.trim() === ''} 
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="max-h-96 overflow-y-auto pr-2">
                        {filteredAnnotations.length === 0 ? (
                            <p className="text-gray-500 text-sm py-12 text-center">
                                {searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : `Chưa có ghi chú nào được thêm vào. Bôi đen văn bản để bắt đầu!`}
                            </p>
                        ) : (
                            filteredAnnotations.map(ann => (
                                <NotepadItem 
                                    key={ann.id}
                                    annotation={ann}
                                    onScroll={handleItemClick}
                                    // 🌟 TRUYỀN CÁC HÀM XỬ LÝ 🌟
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
            {/* Modal Backdrop */}
            {isVisible && <div className="modal-backdrop bg-black opacity-30" onClick={onClose}></div>}
        </>
    );
};

export default NotepadModal;
