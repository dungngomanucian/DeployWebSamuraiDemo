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

        // 1. GÁN ID VÀ THIẾT LẬP STYLE (Giống hệt code cũ)
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
            classNames += ` underline decoration-red-500 decoration-solid underline-offset-4 tooltip tooltip-hover text-red-500`; 
            finalColor = 'red-note'; 
        }

        // 2. LOGIC "SPLIT AND WRAP" AN TOÀN (Đây là phần thay đổi)
        try {
            // Lấy tất cả các TextNode giao với vùng bôi đen
            const allTextNodes = [];
            const walker = document.createTreeWalker(
                range.commonAncestorContainer,
                NodeFilter.SHOW_TEXT,
                (node) => {
                    // Lọc: Chỉ chấp nhận các node giao với Range
                    return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            );

            while (walker.nextNode()) {
                // Bỏ qua các node chỉ có khoảng trắng (giống logic cũ của bạn)
                if (walker.currentNode.textContent.trim().length > 0) { 
                    allTextNodes.push(walker.currentNode);
                }
            }

            // Tách (split) và Bọc (wrap) các node đã tìm thấy
            allTextNodes.forEach((node) => {
                const isStartNode = (node === range.startContainer);
                const isEndNode = (node === range.endContainer);
                
                let nodeToWrap = node;

                // Tách (split) node nếu nó bị chọn 1 phần
                
                // Case 1: Chọn 1 phần bên trong 1 node duy nhất (ví dụ: "Hello [World]!")
                if (isStartNode && isEndNode) {
                    nodeToWrap = node.splitText(range.startOffset);
                    nodeToWrap.splitText(range.endOffset - range.startOffset);
                } 
                // Case 2: Đây là node đầu tiên, bị chọn 1 phần (ví dụ: "[Hello] World")
                else if (isStartNode) {
                    nodeToWrap = node.splitText(range.startOffset);
                } 
                // Case 3: Đây là node cuối cùng, bị chọn 1 phần (ví dụ: "Hello [World]")
                else if (isEndNode) {
                    node.splitText(range.endOffset); // Tách phần "sau", nodeToWrap vẫn là node gốc (giờ đã bị cắt ngắn)
                }
                // Case 4 (ngầm định): Node nằm hoàn toàn bên trong, không cần split.
                

                // 3. BỌC (WRAP) NODE
                // Tạo span mới cho MỖI text node (để click handler hoạt động)
                const newSpan = document.createElement('span');
                newSpan.className = classNames;
                Object.assign(newSpan.style, inlineStyle);
                newSpan.dataset.id = highlightId;
                newSpan.dataset.actionType = actionType;
                newSpan.dataset.color = finalColor; 
                if (noteText) { newSpan.setAttribute('data-tip', noteText); }
                newSpan.addEventListener('click', handleAnnotatedClick);

                // Thao tác DOM an toàn: Dùng insertBefore + appendChild
                // Bọc nodeToWrap bằng newSpan
                if (nodeToWrap.parentNode) {
                    nodeToWrap.parentNode.insertBefore(newSpan, nodeToWrap);
                    newSpan.appendChild(nodeToWrap);
                }
            });

            // 4. LƯU METADATA (Giống hệt code cũ)
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
            console.error("Lỗi khi áp dụng Highlight/Note:", error);
            // Ngay cả khi lỗi, chúng ta không "cắt" gì cả, nên DOM vẫn an toàn
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
