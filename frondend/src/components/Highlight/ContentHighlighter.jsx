import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSelectionHandler from '../../hooks/exam/useSelectionHandler';
import HighlightAndAnnotationPopup from './HighlightAndAnnotationPopup';
import RemoveAnnotationPopup from './RemoveAnnotationPopup';
// 🌟 THAY ĐỔI: Lấy setter mới từ Context 🌟
import { useAnnotationContext } from '../../context/AnnotationContext'; 
// Giữ nguyên hàm tạo ID ngẫu nhiên
const generateTempId = () => {
    return 'temp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};


const ContentHighlighter = ({ children }) => {
    // 🌟 Cập nhật để lấy setter mới 🌟
    const { addAnnotation, removeAnnotation, setScrollHandler, setRemoveAnnotationHandler } = useAnnotationContext(); 

    const contentRef = useRef(null);
    const { popupPos, selectedRange, selectedText, clearSelection } = useSelectionHandler(contentRef);
    
    // 🌟 STATE MỚI: Quản lý Popup Xóa 🌟
    const [removePopup, setRemovePopup] = useState(null); // { x, y, id, type }

    // ----------------------------------------------------
    // HÀM CHÍNH: XÓA ANNOTATION KHỎI DOM VÀ GỌI CONTEXT 
    // Hàm này được gọi khi xóa từ Notepad hoặc Popup Xóa
    const handleRemoveAndDOM = useCallback((id) => {
        // 1. Xóa khỏi DOM
        const spans = document.querySelectorAll(`span[data-id="${id}"]`);
        spans.forEach(span => {
            const textNode = document.createTextNode(span.textContent);
            if (span.parentNode) {
                span.parentNode.replaceChild(textNode, span);
            }
        });
        
        // 2. Xóa khỏi Context (Metadata)
        removeAnnotation(id); 
        
        // 3. Đóng Popup Xóa (nếu đang mở)
        setRemovePopup(null);
    }, [removeAnnotation]);
    
    // 🌟 ĐĂNG KÝ HÀM XÓA DOM/CONTEXT VÀO CONTEXT 🌟
    useEffect(() => {
        const handleScrollToAnnotation = (id) => { 
            const targetElement = document.querySelector(`span[data-id="${id}"]`);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                targetElement.classList.add('animate-pulse', 'ring-4', 'ring-red-500', 'ring-opacity-50');
                setTimeout(() => {
                    targetElement.classList.remove('animate-pulse', 'ring-4', 'ring-red-500', 'ring-opacity-50');
                }, 1500);
            }
        };
        setScrollHandler(() => handleScrollToAnnotation); 
        
        // 🌟 ĐĂNG KÝ HÀM XÓA CHÍNH (handleRemoveAndDOM) VÀO CONTEXT 🌟
        setRemoveAnnotationHandler(() => handleRemoveAndDOM);
        
    }, [setScrollHandler, setRemoveAnnotationHandler, handleRemoveAndDOM]);


    // Xử lý click vào vùng Highlight/Note (Giữ nguyên)
    const handleAnnotatedClick = useCallback((e) => {
        const target = e.target;
        if (target.matches('.highlighted')) {
            const highlightRect = target.getBoundingClientRect();
            const id = target.dataset.id;
            const type = target.dataset.actionType;
            
            e.stopPropagation();

            // Lấy vị trí của container để tính toán tương đối
            const containerRect = contentRef.current.getBoundingClientRect();

            // Tính toán vị trí tương đối của popup so với container
            const relativeTop = highlightRect.top - containerRect.top;
            const relativeLeft = highlightRect.left - containerRect.left;

            setRemovePopup({
                x: relativeLeft + highlightRect.width / 2,
                y: relativeTop,
                id: id,
                type: type,
            });
            clearSelection();
        } else {
            setRemovePopup(null);
        }
    }, [clearSelection, contentRef]);


    // LISTENER XÓA VÀ TẠO (Giữ nguyên)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.matches('.highlighted') && !e.target.closest('.remove-popup')) {
                setRemovePopup(null);
            }
        };
        const handleMouseUp = (e) => {
            if (e.target.closest('.highlight-popup')) {
                e.stopPropagation();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('mouseup', handleMouseUp, true); // Dùng capture phase (true)
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mouseup', handleMouseUp, true);
        }
    }, []);


    const applyAction = useCallback((actionType, color, note = '') => {
        if (!selectedRange) return;
        
        const range = selectedRange.cloneRange(); 
        const highlightId = generateTempId(); 
        
        let classNames = `highlighted relative cursor-pointer transition-all duration-300 ease-in-out`;
        let inlineStyle = {}; 
        let noteText = (actionType === 'note' && note) ? note : '';
        let finalColor = color; 

        if (actionType === 'highlight') {
            classNames += ` opacity-70`; 
            inlineStyle.backgroundColor = 'rgb(253, 224, 71)'; 
            finalColor = 'yellow';
        } else if (actionType === 'note') {
            // 🌟 NOTE: GẠCH CHÂN ĐỎ NÉT LIỀN 🌟
            classNames += ` underline decoration-red-500 decoration-solid underline-offset-4 tooltip tooltip-hover text-red-500`; 
            finalColor = 'red-note'; 
        }

        try {
            const fragment = range.extractContents();
            const walker = document.createTreeWalker(
                fragment,
                NodeFilter.SHOW_TEXT, 
                null,
                false
            );

            let node;
            const nodesToWrap = [];

            // 1. Thu thập tất cả các Text Node cần bọc
            while (node = walker.nextNode()) {
                if (node.textContent.length > 0) { 
                     nodesToWrap.push(node);
                }
            }

            // 2. Bọc từng Text Node đã thu thập
            nodesToWrap.forEach(nodeToWrap => {
                const textContent = nodeToWrap.textContent;
                
                // Nếu node chỉ là khoảng trắng, KHÔNG BỌC, chèn lại nguyên trạng
                if (textContent.trim().length === 0) {
                    return; // Bỏ qua node chỉ là khoảng trắng
                }
                
                const newSpan = document.createElement('span');
                    
                newSpan.className = classNames;
                Object.assign(newSpan.style, inlineStyle);
                newSpan.dataset.id = highlightId;
                newSpan.dataset.actionType = actionType;
                newSpan.dataset.color = finalColor; 
                
                if (noteText) { newSpan.setAttribute('data-tip', noteText); }
                
                newSpan.addEventListener('click', handleAnnotatedClick);
                
                // Bọc Text Node vào Span
                newSpan.appendChild(document.createTextNode(textContent));
                nodeToWrap.parentNode.replaceChild(newSpan, nodeToWrap);
            });
            
            // 3. Chèn Fragment đã được bọc trở lại vào vị trí Range cũ
            range.insertNode(fragment);
            
            // 4. LƯU METADATA VÀO CONTEXT CHỈ KHI LÀ NOTE (Có Ghi chú)
            if (actionType === 'note') {
                addAnnotation({ 
                    id: highlightId, 
                    text: selectedText, 
                    note: noteText, 
                    type: actionType, 
                    date: new Date().toLocaleTimeString()
                });
            }

        } catch (error) {
            console.error("Lỗi khi áp dụng Highlight/Note vào vùng phức tạp:", error);
        }

        clearSelection();
    }, [selectedRange, selectedText, clearSelection, addAnnotation, handleAnnotatedClick]);

    
    // 🌟 ĐẢM BẢO CHUYỂN noteText ĐẾN applyAction 🌟
    const handleAction = (actionType, color = null, noteText = '') => {
        if (actionType === 'highlight') {
            applyAction('highlight', 'yellow');
        } else if (actionType === 'note') {
            // Dữ liệu noteText được truyền từ Popover khi nhấn Save
            if (noteText) { 
                applyAction('note', 'gray', noteText); 
            }
        }
    };


    return (
        <div ref={contentRef} className="relative"> 
            {children} 
            
            <HighlightAndAnnotationPopup
                position={popupPos}
                onAction={handleAction}
                onClosePopup={clearSelection} // 🌟 TRUYỀN HÀM ẨN POPUP CHO POPUP NOTE 🌟
            />

            <RemoveAnnotationPopup
                popupData={removePopup}
                onRemove={handleRemoveAndDOM} // GỌI HÀM XÓA DOM/CONTEXT
                onClose={() => setRemovePopup(null)}
            />
        </div>
    );
};

export default ContentHighlighter;
