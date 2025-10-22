import { useState, useMemo } from 'react';

/**
 * Custom hook để xử lý logic sắp xếp dữ liệu
 * @param {Array} data - Mảng dữ liệu cần sắp xếp
 * @param {Object} config - Cấu hình các cột (định dạng giống COLUMN_CONFIG)
 * @returns {Object} - Các state và hàm xử lý cần thiết cho việc sắp xếp
 */
export function useSortableData(data, config = {}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Hàm so sánh giá trị dựa trên kiểu dữ liệu
  const compareValues = (a, b, key, direction) => {
    // Xử lý giá trị null/undefined
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;

    // Xử lý đặc biệt cho các trường ngày tháng
    if (config[key]?.type === 'date') {
      const dateA = a ? new Date(a).getTime() : 0;
      const dateB = b ? new Date(b).getTime() : 0;
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // Xử lý số
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'asc' ? a - b : b - a;
    }

    // Xử lý chuỗi (mặc định)
    const stringA = String(a).toLowerCase();
    const stringB = String(b).toLowerCase();
    if (stringA < stringB) return direction === 'asc' ? -1 : 1;
    if (stringA > stringB) return direction === 'asc' ? 1 : -1;
    return 0;
  };

  // Sử dụng useMemo để tránh tính toán lại khi render
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      return compareValues(
        a[sortConfig.key], 
        b[sortConfig.key], 
        sortConfig.key, 
        sortConfig.direction
      );
    });
  }, [data, sortConfig, config]);

  // Hàm xử lý sắp xếp
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return {
    items: sortedData,
    sortConfig,
    handleSort
  };
}

/**
 * Hook để quản lý cả sort và search
 * @param {Array} data - Mảng dữ liệu gốc
 * @param {Object} config - Cấu hình các cột
 * @returns {Object} - Các state và hàm xử lý cho sort và search
 */
export function useDataTable(data, config = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { items, sortConfig, handleSort } = useSortableData(data, config);

  // Lọc dữ liệu theo search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    return items.filter(item => {
      return Object.keys(config).some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        
        // Nếu cột có hàm format, sử dụng kết quả của format để tìm kiếm
        const displayValue = config[key].format 
          ? config[key].format(value) 
          : String(value);
          
        return String(displayValue).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [items, searchTerm, config]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return {
    items: filteredItems,
    sortConfig,
    handleSort,
    searchTerm,
    handleSearch
  };
}