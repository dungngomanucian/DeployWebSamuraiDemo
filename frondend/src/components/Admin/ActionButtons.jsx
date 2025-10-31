// frontend/src/components/common/ActionButtons.jsx
import React, { useRef, useMemo } from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

/**
 * Component hiển thị menu hành động (Sửa/Xóa mặc định + tùy chỉnh)
 * @param {string} recordId - ID của bản ghi
 * @param {function} onEdit - Hàm xử lý khi nhấn nút sửa
 * @param {function} onDelete - Hàm xử lý khi nhấn nút xóa
 * @param {Array<Object>} [customActions=[]] - Mảng các hành động tùy chỉnh. 
 * Mỗi object: { label: string, icon: string (PrimeIcons), onClick: function(recordId), className?: string }
 */
function ActionButtons({ recordId, onEdit, onDelete, customActions = [] }) {
  const menuRef = useRef(null);

  // Tạo model cho PrimeReact Menu
  const menuItems = useMemo(() => {
    // --- Các hành động mặc định ---
    const defaultActions = [
      {
        label: "Chỉnh sửa",
        icon: "pi pi-pencil", // Icon mặc định
        command: () => {
          if (onEdit) onEdit(recordId); // Gọi hàm onEdit từ props
        },
        template: (item, options) => ( // Dùng template để style
          <button onClick={options.onClick} className="w-full flex items-center justify-center p-2 rounded-md gap-2 text-sm text-info hover:bg-info hover:text-info-content" role="menuitem">
            {item.icon && <span className={`p-menuitem-icon ${item.icon} text-base`} />}
            <span className="p-menuitem-text">{item.label}</span>
          </button>
        )
      },
      {
        label: "Xóa",
        icon: "pi pi-trash", // Icon mặc định
        command: () => {
          if (onDelete) onDelete(recordId); // Gọi hàm onDelete từ props
        },
        template: (item, options) => ( // Dùng template để style
          <button onClick={options.onClick} className="w-full flex items-center justify-center p-2 rounded-md gap-2 text-sm text-error hover:bg-error hover:text-error-content" role="menuitem">
            {item.icon && <span className={`p-menuitem-icon ${item.icon} text-base`} />}
            <span className="p-menuitem-text">{item.label}</span>
          </button>
        )
      }
    ];

    // --- Các hành động tùy chỉnh ---
    const customMenuItems = customActions.map(action => ({
      label: action.label,
      icon: action.icon,
      command: () => {
        // Gọi hàm onClick của custom action, truyền recordId
        if (action.onClick) action.onClick(recordId); 
      },
       template: (item, options) => ( // Dùng template để style
          <button onClick={options.onClick} className={`w-full flex items-center justify-center p-2 rounded-md gap-2 text-sm ${action.className || 'hover:bg-base-200'}`} role="menuitem">
            {item.icon && <span className={`p-menuitem-icon ${item.icon} text-base`} />}
            <span className="p-menuitem-text">{item.label}</span>
          </button>
        )
    }));

    // Kết hợp các hành động (custom trước, default sau, hoặc ngược lại tùy ý)
    return [...defaultActions, ...customMenuItems ]; 

  }, [recordId, onEdit, onDelete, customActions]); // Dependencies

  // Không hiển thị nút nếu không có hành động nào (kể cả mặc định nếu onEdit/onDelete không được truyền)
  if (menuItems.length === 0 || (!onEdit && !onDelete && customActions.length === 0) ) {
    return null; 
  }

  const toggleMenu = (event) => {
    menuRef.current?.toggle(event);
  };

  return (
    <>
      <Button
        label="Chức năng" 
        icon="pi pi-chevron-down" 
        iconPos="right"
        className="p-button-sm p-button-outlined" 
        onClick={toggleMenu}
        aria-controls="action_menu_popup"
        aria-haspopup
        style={{ width: '170px' }}
      />
      <Menu
        model={menuItems}
        popup
        ref={menuRef}
        id="action_menu_popup"
        className="w-12" // Giữ lại width cố định nếu muốn
        style={{ width: '170px' }}
      />
    </>
  );
}

export default ActionButtons; 