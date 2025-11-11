import React, { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import useSelectionHandler from '../../hooks/exam/useSelectionHandler';
import HighlightAndAnnotationPopup from './HighlightAndAnnotationPopup';
import RemoveAnnotationPopup from './RemoveAnnotationPopup';
// 🌟 THAY ĐỔI: Lấy setter mới từ Context 🌟
import { useAnnotationContext } from '../../context/AnnotationContext'; 

// Giữ nguyên hàm tạo ID ngẫu nhiên
const generateTempId = () => {
    return 'temp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};


const ContentHighlighter = forwardRef(({ children, showTranslateButton = false, onTranslate }, ref) => {
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

    // Helper function để tạo span wrapper, tránh lặp code
    const createWrapperSpan = (id, classNames, style, actionType, color, note) => {
        const span = document.createElement('span');
        span.className = classNames;
        Object.assign(span.style, style);
        span.dataset.id = id;
        span.dataset.actionType = actionType;
        span.dataset.color = color;
        if (note) {
            span.setAttribute('data-tip', note);
        }
        span.addEventListener('click', handleAnnotatedClick);
        return span;
    };

    const CONTEXT_LENGTH = 20; // Độ dài của prefix/suffix



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
            const nodesToWrap = [];
            const walker = document.createTreeWalker(
                range.commonAncestorContainer,
                NodeFilter.SHOW_TEXT,
                (node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
            );

            while (walker.nextNode()) {
                // Bỏ qua các node chỉ có khoảng trắng (giống logic cũ của bạn)
                if (walker.currentNode.textContent.trim().length > 0) { 
                    nodesToWrap.push(walker.currentNode);
                }
            }

            // Duyệt ngược để việc split không ảnh hưởng đến các node chưa xử lý
            for (let i = nodesToWrap.length - 1; i >= 0; i--) {
                const node = nodesToWrap[i];
                const isStartNode = node === range.startContainer;
                const isEndNode = node === range.endContainer;

                let middlePart = node;

                // Case 1: Vùng chọn nằm hoàn toàn trong 1 TextNode
                if (isStartNode && isEndNode) {
                    // Tách phần sau ra trước
                    const endPart = node.splitText(range.endOffset);
                    // Tách phần đầu, phần còn lại chính là phần giữa cần bọc
                    const middlePart = node.splitText(range.startOffset);

                    // Bọc phần giữa
                    const span = createWrapperSpan(highlightId, classNames, inlineStyle, actionType, finalColor, noteText);
                    span.appendChild(middlePart);
                    endPart.parentNode.insertBefore(span, endPart);

                } else if (isEndNode) { // Case 2: Đây là node cuối của vùng chọn
                    // Chỉ cần tách phần sau ra
                    middlePart = node.splitText(range.endOffset);
                    // Bọc phần đầu (phần còn lại của node gốc)
                    const span = createWrapperSpan(highlightId, classNames, inlineStyle, actionType, finalColor, noteText);
                    node.parentNode.insertBefore(span, middlePart);
                    span.appendChild(node);

                } else if (isStartNode) { // Case 3: Đây là node đầu của vùng chọn
                    // Tách phần đầu ra, phần còn lại là phần cần bọc
                    middlePart = node.splitText(range.startOffset);
                    const span = createWrapperSpan(highlightId, classNames, inlineStyle, actionType, finalColor, noteText);
                    middlePart.parentNode.insertBefore(span, middlePart);
                    span.appendChild(middlePart);
                } else { // Case 4: Node nằm hoàn toàn trong vùng chọn
                    const span = createWrapperSpan(highlightId, classNames, inlineStyle, actionType, finalColor, noteText);
                    node.parentNode.insertBefore(span, node);
                    span.appendChild(node);
                }
            }

            // 4. LƯU METADATA VỚI NGỮ CẢNH (PREFIX/SUFFIX)
            const fullText = contentRef.current.textContent || '';
            const startIndex = fullText.indexOf(selectedText);
            
            if (startIndex !== -1) {
                const prefixStart = Math.max(0, startIndex - CONTEXT_LENGTH);
                const suffixEnd = Math.min(fullText.length, startIndex + selectedText.length + CONTEXT_LENGTH);
                
                const prefix = fullText.substring(prefixStart, startIndex);
                const suffix = fullText.substring(startIndex + selectedText.length, suffixEnd);

                addAnnotation({ 
                    id: highlightId, 
                    text: selectedText, 
                    note: noteText,
                    type: actionType, 
                    date: new Date().toLocaleTimeString(),
                    // Dữ liệu ngữ cảnh mới
                    prefix: prefix,
                    suffix: suffix,
                });
            } else {
                 // Fallback nếu không tìm thấy, lưu không có ngữ cảnh
                 addAnnotation({ 
                    id: highlightId, 
                    text: selectedText, 
                    note: noteText, 
                    type: actionType, 
                    date: new Date().toLocaleTimeString(),
                    prefix: '',
                    suffix: '',
                });
            }

        } catch (error) {
            console.error("Lỗi khi áp dụng Highlight/Note:", error);
            // Ngay cả khi lỗi, chúng ta không "cắt" gì cả, nên DOM vẫn an toàn
        }

        clearSelection();
    }, [selectedRange, selectedText, clearSelection, addAnnotation, handleAnnotatedClick, contentRef]);

    
    // 🌟 ĐẢM BẢO CHUYỂN noteText ĐẾN applyAction 🌟
    const handleAction = (actionType, color = null, noteText = '') => { // 🌟 CẬP NHẬT: Xử lý action 'translate'
        switch (actionType) {
            case 'highlight':
                applyAction('highlight', 'yellow');
                break;
            case 'note':
                if (noteText) applyAction('note', 'gray', noteText);
                break;
            case 'translate':
                if (onTranslate && selectedText) onTranslate(selectedText);
                break;
            default:
                break;
            }
    };

    // HÀM "VẼ LẠI" ANNOTATION
    const reapplyAnnotations = useCallback((annotationsToApply) => {
        if (!contentRef.current || annotationsToApply.length === 0) return;

        const container = contentRef.current;
        const fullText = container.textContent || '';

        annotationsToApply.forEach(ann => {
            const { id, text, note, type, prefix, suffix } = ann;
            
            // Tìm vị trí chính xác bằng ngữ cảnh
            const searchTerm = prefix + text + suffix;
            const searchIndex = fullText.indexOf(searchTerm);

            if (searchIndex === -1) {
                // console.warn(`Không thể vẽ lại annotation ID ${id}: không tìm thấy ngữ cảnh.`);
                return;
            }

            const targetStartIndex = searchIndex + prefix.length;
            const targetEndIndex = targetStartIndex + text.length;

            // Tạo range để bọc lại
            const range = document.createRange();
            let charCount = 0;
            let startNode, startOffset, endNode, endOffset;

            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent.length;

                if (!startNode && targetStartIndex < charCount + nodeLength) {
                    startNode = node;
                    startOffset = targetStartIndex - charCount;
                }
                if (!endNode && targetEndIndex <= charCount + nodeLength) {
                    endNode = node;
                    endOffset = targetEndIndex - charCount;
                    break; // Đã tìm thấy cả điểm đầu và cuối
                }
                charCount += nodeLength;
            }

            if (startNode && endNode) {
                range.setStart(startNode, startOffset);
                range.setEnd(endNode, endOffset);

                // Logic bọc lại, tương tự applyAction nhưng không lưu metadata
                let classNames = `highlighted relative cursor-pointer transition-all duration-300 ease-in-out`;
                let inlineStyle = {};
                let finalColor = '';

                if (type === 'highlight') {
                    classNames += ` opacity-70`;
                    inlineStyle.backgroundColor = 'rgb(253, 224, 71)';
                    finalColor = 'yellow';
                } else if (type === 'note') {
                    classNames += ` underline decoration-red-500 decoration-solid underline-offset-4 tooltip tooltip-hover text-red-500`;
                    finalColor = 'red-note';
                }

                const span = createWrapperSpan(id, classNames, inlineStyle, type, finalColor, note);
                
                try {
                    // Bọc nội dung của range bằng span
                    range.surroundContents(span);
                } catch (e) {
                    // Lỗi có thể xảy ra nếu range cắt ngang qua các thẻ không hợp lệ.
                    // Trong trường hợp này, chúng ta có thể chọn không vẽ lại thay vì làm crash app.
                    console.error("Lỗi khi surroundContents, có thể do range không hợp lệ:", e, ann);
                }
            }
        });
    }, [contentRef, handleAnnotatedClick]);

    // Expose hàm reapplyAnnotations ra bên ngoài để ExamPage có thể gọi
    useImperativeHandle(ref, () => ({
        reapplyAnnotations
    }));


    return (
        <div ref={contentRef} className="relative">
            {children} 
            
            <HighlightAndAnnotationPopup
                position={popupPos}
                onAction={handleAction}
                showTranslateButton={showTranslateButton}
                onClosePopup={clearSelection} // 🌟 TRUYỀN HÀM ẨN POPUP CHO POPUP NOTE 🌟
            />

            <RemoveAnnotationPopup
                popupData={removePopup}
                onRemove={handleRemoveAndDOM} // GỌI HÀM XÓA DOM/CONTEXT
                onClose={() => setRemovePopup(null)}
            />
        </div>
    );
});

export default ContentHighlighter;
