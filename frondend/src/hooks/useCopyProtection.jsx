import React, { useState, useCallback } from 'react';

// --- PHẦN 1: CUSTOM HOOK TÁI SỬ DỤNG (THE MODULE) ---

/**
 * Custom Hook: useCopyProtection
 * Cung cấp logic chống sao chép, chặn bôi đen và chặn menu ngữ cảnh.
 * @param {string} copyrightMessage (Tùy chọn) Thông báo sẽ được sao chép vào clipboard thay thế.
 * @returns {object} Các props cần thiết để gắn vào phần tử HTML (onCopy, onContextMenu, onSelectStart).
 */
export const useCopyProtection = (copyrightMessage) => {
    const [isCopying, setIsCopying] = useState(false);

    /**
     * Tiện ích: Ghi nội dung vào clipboard (sử dụng document.execCommand cho tính tương thích).
     */
    const copyToClipboardFallback = useCallback((text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            return true;
        } catch (err) {
            console.error('Không thể thực hiện lệnh copy (execCommand)', err);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }, []);

    /**
     * Xử lý sự kiện onSelectStart: Ngăn chặn bôi đen văn bản.
     */
    const handleSelectStart = useCallback((e) => {
        e.preventDefault(); 
    }, []);
    
    /**
     * Xử lý sự kiện onContextMenu: Ngăn chặn menu chuột phải/nhấn giữ.
     */
    const handleContextMenu = useCallback((e) => {
        e.preventDefault(); 
    }, []);

    /**
     * Xử lý sự kiện onCopy: Chặn hành động mặc định và ghi thông báo bản quyền.
     */
    const handleCopy = useCallback((e) => {
        e.preventDefault(); 

        if (isCopying) return;
        setIsCopying(true);
        
        const success = copyToClipboardFallback(copyrightMessage);

        // Không hiển thị toast nữa

        setTimeout(() => {
            setIsCopying(false);
        }, 500); // Giảm thời gian reset isCopying
        
    }, [isCopying, copyrightMessage, copyToClipboardFallback]);

    // Trả về các props để gắn (spread) vào component muốn bảo vệ
    return {
        onCopy: handleCopy,
        onContextMenu: handleContextMenu,
        onSelectStart: handleSelectStart,
    };
};
