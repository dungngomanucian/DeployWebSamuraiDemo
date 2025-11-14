// E:/Năm 5/Japannese/Highlight/Samurai_Japanese_App-1/frondend/src/hooks/useSelectionHandler.js

import { useState, useEffect, useCallback, useRef } from 'react';

const useSelectionHandler = (containerRef) => { // 1. Nhận containerRef làm tham số
  const [popupPos, setPopupPos] = useState(null); // { x: number, y: number }
  const [selectedRange, setSelectedRange] = useState(null); // Đối tượng Range DOM
  const [selectedText, setSelectedText] = useState('');
  
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();

      // Chỉ xử lý nếu vùng chọn nằm trong container được chỉ định
      if (containerRef.current && containerRef.current.contains(range.commonAncestorContainer)) {
        if (text.length > 0) {
          setSelectedText(text);
          setSelectedRange(range);

          // --- 2. THAY ĐỔI CÁCH TÍNH TOÁN VỊ TRÍ ---
          const selectionRect = range.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Tính toán vị trí tương đối so với container
          const relativeTop = selectionRect.top - containerRect.top;
          const relativeLeft = selectionRect.left - containerRect.left;

          setPopupPos({
            x: relativeLeft + selectionRect.width / 2,
            y: relativeTop, // Vị trí y tương đối so với container
          });
          return;
        }
      }
    }

    setSelectedRange(null);
    setSelectedText('');
    setPopupPos(null);
  }, [containerRef]); // Thêm containerRef vào dependency

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, [handleSelection]);

  const clearSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    setPopupPos(null);
    setSelectedRange(null);
    setSelectedText('');
  };

  return { popupPos, selectedRange, selectedText, clearSelection };
};

// **ĐÂY LÀ EXPORT CHÍNH XÁC CHO FILE HOOKS**
export default useSelectionHandler;