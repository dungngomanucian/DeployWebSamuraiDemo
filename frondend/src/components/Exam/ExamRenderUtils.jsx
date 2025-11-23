// src/components/Exam/ExamRenderUtils.js
import React from 'react';

// Helper: Underline
export const Underline = ({ children, weight = 1, offset = 4, colorClass = '' }) => {
  const weightClass = weight === 2 ? 'decoration-2' : 'decoration-1';
  const offsetClass = offset === 5 ? 'underline-offset-5' : 'underline-offset-4';
  return (
    <span className={`underline ${weightClass} ${offsetClass} ${colorClass}`.trim()}>
      {children}
    </span>
  );
};

// Helper: Border Box
export const PassageBorderBox = ({ isTimeUp, children }) => (
  <div className={`border-2 border-black p-6 rounded-lg ${isTimeUp ? 'bg-red-100' : 'bg-white'}`}>
    <div className="text-lg md:text-xl leading-relaxed text-gray-800 font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
      {children}
    </div>
  </div>
);

// Helper: Định dạng thời gian
export const formatTime = (seconds, padMinutes = false) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const m = padMinutes ? String(minutes).padStart(2, "0") : String(minutes);
  return `${m}:${String(secs).padStart(2, "0")}`;
};

// Helper: Render text với <tab> (thay bằng khoảng trắng 0.5cm)
const renderTextWithTabs = (text, keyBase) => {
  if (!text) return null;
  
  const tabRegex = /<tab>/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let tabIndex = 0;
  
  while ((match = tabRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={`${keyBase}-tab-${tabIndex++}`} style={{ display: 'inline-block', width: '0.5cm' }} />
    );
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  // Nếu không có <tab>, trả về text gốc
  if (parts.length === 0) {
    return text;
  }
  
  // Nếu chỉ có 1 phần tử và không phải là React element, trả về text
  if (parts.length === 1 && typeof parts[0] === 'string') {
    return parts[0];
  }
  
  return parts;
};

// Helper: Render text với <bolder>
const renderWithBolder = (text, keyBase) => {
  if (!text) return text;
  
  const bolderRegex = /<bolder>([\s\S]*?)<\/bolder>/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  const addProcessedText = (processedText) => {
    if (Array.isArray(processedText)) {
      parts.push(...processedText);
    } else if (processedText !== null && processedText !== undefined) {
      parts.push(processedText);
    }
  };
  
  while ((match = bolderRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      const processedBefore = renderTextWithTabs(beforeText, `${keyBase}-before-bolder-${match.index}`);
      addProcessedText(processedBefore);
    }
    const processedContent = renderTextWithTabs(match[1], `${keyBase}-bolder-content-${match.index}`);
    parts.push(
      <strong key={`${keyBase}-bolder-${match.index}`} className="font-bold">
        {processedContent}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const processedRemaining = renderTextWithTabs(remainingText, `${keyBase}-after-bolder-${lastIndex}`);
    addProcessedText(processedRemaining);
  }
  
  return parts.length > 0 ? parts : text;
};

// Helper: Render text với <underline>
const renderWithUnderline = (text, keyBase) => {
  const underlineRegex = /<underline>([\s\S]*?)<\/underline>/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  const addProcessedText = (processedText) => {
    if (Array.isArray(processedText)) {
      parts.push(...processedText);
    } else if (processedText !== null && processedText !== undefined) {
      parts.push(processedText);
    }
  };
  
  while ((match = underlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      const processedBefore = renderWithBolder(beforeText, `${keyBase}-before-ul-${match.index}`);
      addProcessedText(processedBefore);
    }
    const processedContent = renderWithBolder(match[1], `${keyBase}-ul-content-${match.index}`);
    parts.push(
      <Underline key={`${keyBase}-ul-${match.index}`} weight={2}>
        {processedContent}
      </Underline>
    );
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const processedRemaining = renderWithBolder(remainingText, `${keyBase}-after-ul-${lastIndex}`);
    addProcessedText(processedRemaining);
  }
  
  return parts.length > 0 ? parts : text;
};

// Helper: Render text với các tag phức tạp (enter, center, underline, bolder, tab)
// Dùng cho nội dung trong table cells
const renderRichText = (text, keyBase) => {
  if (!text) return null;
  
  // Xử lý <enter> trước - chia thành các dòng
  const lines = text.split('<enter>');
  
  if (lines.length === 1) {
    // Không có <enter>, xử lý các tag khác trực tiếp
    return renderRichTextLine(text, keyBase);
  }
  
  // Có <enter>, render từng dòng và thêm <br> giữa chúng
  return (
    <>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={`${keyBase}-line-${lineIndex}`}>
          {renderRichTextLine(line, `${keyBase}-line-${lineIndex}`)}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

// Helper: Render một dòng text với các tag (center, right, underline, bolder, tab)
const renderRichTextLine = (lineText, keyBase) => {
  if (!lineText) return null;
  
  // Xử lý <center></center> và <right></right>
  const alignmentRegex = /<(center|right)>([\s\S]*?)<\/\1>/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  const addProcessedText = (processedText, alignment = null) => {
    if (Array.isArray(processedText)) {
      if (alignment) {
        parts.push(
          <div key={`${keyBase}-align-${parts.length}`} className={alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : ''}>
            {processedText}
          </div>
        );
      } else {
        parts.push(...processedText);
      }
    } else if (processedText !== null && processedText !== undefined) {
      if (alignment) {
        parts.push(
          <div key={`${keyBase}-align-${parts.length}`} className={alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : ''}>
            {processedText}
          </div>
        );
      } else {
        parts.push(processedText);
      }
    }
  };
  
  while ((match = alignmentRegex.exec(lineText)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = lineText.slice(lastIndex, match.index);
      const processedBefore = renderWithUnderline(beforeText, `${keyBase}-before-align-${match.index}`);
      addProcessedText(processedBefore);
    }
    const alignmentType = match[1]; // 'center' hoặc 'right'
    const processedContent = renderWithUnderline(match[2], `${keyBase}-${alignmentType}-content-${match.index}`);
    addProcessedText(processedContent, alignmentType);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < lineText.length) {
    const remainingText = lineText.slice(lastIndex);
    const processedRemaining = renderWithUnderline(remainingText, `${keyBase}-after-align-${lastIndex}`);
    addProcessedText(processedRemaining);
  }
  
  return parts.length > 0 ? parts : renderWithUnderline(lineText, keyBase);
};

// Helper: Render text với <table>
const renderTextWithTables = (rawText, keyBase) => {
  if (!rawText) return null;
  
  const tableRegex = /<table\s*[^>]*>([\s\S]*?)<\/table\s*>/gi;
  let tLast = 0;
  const out = [];
  
  tableRegex.lastIndex = 0;
  
  const matches = [];
  let match;
  while ((match = tableRegex.exec(rawText)) !== null) {
    matches.push({
      index: match.index,
      fullMatch: match[0],
      content: match[1]
    });
  }
  
  for (const tMatch of matches) {
    if (tMatch.index > tLast) {
      const plain = rawText.slice(tLast, tMatch.index);
      if (plain) out.push(<span key={`${keyBase}-plain-${tLast}`}>{renderWithUnderline(plain, `${keyBase}-${tLast}`)}</span>);
    }
    
    const tableContent = tMatch.content || '';
    const rows = [];
    const rowRegex = /<r\d+>([\s\S]*?)<\/r\d+>/gi;
    const rowMatches = [];
    let rowMatch;
    rowRegex.lastIndex = 0;
    
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      rowMatches.push({
        index: rowMatch.index,
        content: rowMatch[1]
      });
    }
    
    for (const rMatch of rowMatches) {
      const rowHtml = rMatch.content || '';
      const cells = [];
      
      // Tìm tất cả merge tags và cell tags
      const mergeRegex = /<merge>([\s\S]*?)<\/merge>/gi;
      const cellRegex = /<c\d+>([\s\S]*?)<\/c\d+>/gi;
      
      const mergeMatches = [];
      let mergeMatch;
      mergeRegex.lastIndex = 0;
      while ((mergeMatch = mergeRegex.exec(rowHtml)) !== null) {
        mergeMatches.push({
          index: mergeMatch.index,
          endIndex: mergeMatch.index + mergeMatch[0].length,
          content: mergeMatch[1]
        });
      }
      
      const cellMatches = [];
      let cellMatch;
      cellRegex.lastIndex = 0;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // Kiểm tra xem cell có nằm trong merge tag không
        const isInMerge = mergeMatches.some(m => 
          cellMatch.index >= m.index && cellMatch.index < m.endIndex
        );
        
        if (!isInMerge) {
          cellMatches.push({
            index: cellMatch.index,
            endIndex: cellMatch.index + cellMatch[0].length,
            content: cellMatch[1],
            isMerge: false
          });
        }
      }
      
      // Sắp xếp tất cả matches theo index
      const allMatches = [
        ...mergeMatches.map(m => ({ ...m, type: 'merge' })),
        ...cellMatches.map(m => ({ ...m, type: 'cell' }))
      ].sort((a, b) => a.index - b.index);
      
      // Xử lý từng match
      for (const match of allMatches) {
        if (match.type === 'merge') {
          // Xử lý merge tag
          const mergeContent = match.content || '';
          // Đếm số lượng cell tags bên trong merge
          const cellCountRegex = /<c\d+>[\s\S]*?<\/c\d+>/gi;
          const cellCount = (mergeContent.match(cellCountRegex) || []).length;
          
          // Lấy nội dung giữa các cell tags (loại bỏ các cell tags)
          const contentWithoutCells = mergeContent.replace(/<c\d+>[\s\S]*?<\/c\d+>/gi, '').trim();
          
          cells.push({
            content: renderRichText(contentWithoutCells, `${keyBase}-merge-${rMatch.index}-${match.index}`),
            colspan: cellCount || 1,
            isMerge: true
          });
        } else {
          // Xử lý cell tag bình thường
          const cellContent = match.content || '';
          cells.push({
            content: renderRichText(cellContent, `${keyBase}-cell-${rMatch.index}-${match.index}`),
            colspan: 1,
            isMerge: false
          });
        }
      }
      
      // Chỉ thêm row nếu có cells
      if (cells.length > 0) {
        rows.push(cells);
      }
    }
    
    // Chỉ render table nếu có rows
    if (rows.length > 0) {
      out.push(
        <div key={`${keyBase}-table-${tMatch.index}`} className="my-2 overflow-x-auto">
          <table className="mx-auto table-auto min-w-[540px] border border-gray-400 text-base">
            <tbody>
              {rows.map((cells, ri) => (
                <tr key={`r-${ri}`}>
                  {cells.map((cell, ci) => (
                    <td 
                      key={`c-${ci}`} 
                      colSpan={cell.colspan || 1}
                      className={`border border-gray-400 px-4 py-2 whitespace-pre-wrap min-w-[160px] font-normal text-base ${
                        cell.isMerge ? 'text-center' : 'text-left'
                      }`}
                    >
                      {cell.content}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    tLast = tMatch.index + tMatch.fullMatch.length;
  }
  
  if (tLast < rawText.length) {
    const tail = rawText.slice(tLast);
    if (tail) {
      out.push(<span key={`${keyBase}-plain-tail-${tLast}`}>{renderWithUnderline(tail, `${keyBase}-tail`)}</span>);
    }
  }
  
  if (out.length === 0 && rawText) {
    return renderWithUnderline(rawText, keyBase);
  }
  
  return out.length > 0 ? out : null;
};

// Helper: Render nội dung passage (phần <frame>, <center>, <right>)
// options: { onQuestionClick, renderQuestionPopover, questionRefs }
const renderInlineBlock = (blockText, keyPrefix, options = {}) => {
  const { onQuestionClick, renderQuestionPopover, questionRefs, questions = [], passageQuestionState = {} } = options;
  let globalQuestionIndex = 0;

  // QUAN TRỌNG: Xử lý table tags TRƯỚC, tách chúng ra khỏi text chính
  // Sau đó xử lý phần còn lại với <enter>
  const parts = [];
  let partIndex = 0;
  
  // Tìm tất cả table tags trước
  const tableRegex = /<table\s*[^>]*>([\s\S]*?)<\/table\s*>/gi;
  const tableMatches = [];
  let tableMatch;
  tableRegex.lastIndex = 0;
  
  while ((tableMatch = tableRegex.exec(blockText)) !== null) {
    tableMatches.push({
      fullMatch: tableMatch[0],
      index: tableMatch.index,
      endIndex: tableMatch.index + tableMatch[0].length
    });
  }
  
  // Nếu không có table nào, xử lý bình thường với <enter>
  if (tableMatches.length === 0) {
    const textParts = blockText.split('<enter>');
    textParts.forEach((part, idx) => {
      if (part.trim() || idx === 0) {
        parts.push({
          type: 'text',
          content: part,
          key: `${keyPrefix}-text-${partIndex++}`
        });
      }
      if (idx < textParts.length - 1) {
        parts.push({
          type: 'break',
          key: `${keyPrefix}-br-${partIndex++}`
        });
      }
    });
  } else {
    // Có table tags, xử lý từng phần
    let currentIndex = 0;
    
    tableMatches.forEach((match) => {
      if (match.index > currentIndex) {
        const beforeTable = blockText.slice(currentIndex, match.index);
        if (beforeTable.trim()) {
          const beforeParts = beforeTable.split('<enter>');
          beforeParts.forEach((part, idx) => {
            if (part.trim() || idx === 0) {
              parts.push({
                type: 'text',
                content: part,
                key: `${keyPrefix}-before-table-${partIndex++}`
              });
            }
            if (idx < beforeParts.length - 1) {
              parts.push({
                type: 'break',
                key: `${keyPrefix}-br-${partIndex++}`
              });
            }
          });
        }
      }
      
      // Table tag
      parts.push({
        type: 'table',
        content: match.fullMatch,
        key: `${keyPrefix}-table-${partIndex++}`
      });
      
      currentIndex = match.endIndex;
    });
    
    // Phần text còn lại sau table cuối cùng
    if (currentIndex < blockText.length) {
      const afterTable = blockText.slice(currentIndex);
      if (afterTable.trim()) {
        const afterParts = afterTable.split('<enter>');
        afterParts.forEach((part, idx) => {
          if (part.trim() || idx === 0) {
            parts.push({
              type: 'text',
              content: part,
              key: `${keyPrefix}-after-table-${partIndex++}`
            });
          }
          if (idx < afterParts.length - 1) {
            parts.push({
              type: 'break',
              key: `${keyPrefix}-br-after-${partIndex++}`
            });
          }
        });
      }
    }
  }
  
  return (
    <div className="leading-relaxed">
      {parts.map((part) => {
        if (part.type === 'table') {
          const tableResult = renderTextWithTables(part.content, part.key);
          return <React.Fragment key={part.key}>{tableResult}</React.Fragment>;
        } else if (part.type === 'break') {
          return <br key={part.key} className="leading-relaxed" />;
        } else {
          const segments = [];
          const tagRegex = /<(center|right)>([\s\S]*?)<\/\1>|<question\s*\/>|<question\s*>/g;
          let lastIndex = 0;
          let match;

          while ((match = tagRegex.exec(part.content)) !== null) {
            if (match.index > lastIndex) {
              const before = part.content.slice(lastIndex, match.index);
              if (before) {
                const tableResult = renderTextWithTables(before, `${part.key}-seg-${lastIndex}`);
                if (Array.isArray(tableResult)) {
                  tableResult.forEach((item, idx) => {
                    if (React.isValidElement(item)) {
                      segments.push(React.cloneElement(item, { key: `${part.key}-t-${lastIndex}-${idx}` }));
                    } else {
                      segments.push(
                        <span key={`${part.key}-t-${lastIndex}-${idx}`}>
                          {item}
                        </span>
                      );
                    }
                  });
                } else if (tableResult) {
                  segments.push(
                    <span key={`${part.key}-t-${lastIndex}`}>
                      {tableResult}
                    </span>
                  );
                }
              }
            }
            if (match[0].startsWith('<question')) {
              if (questions && globalQuestionIndex < questions.length) {
                const q = questions[globalQuestionIndex];
                const isOpen = !!passageQuestionState[q.id];
                segments.push(
                  <span
                    key={`${part.key}-q-${match.index}`}
                    className="inline-block align-middle relative"
                    ref={(el) => {
                      if (el && questionRefs) {
                        questionRefs.current[q.id] = el;
                      } else if (questionRefs) {
                        delete questionRefs.current[q.id];
                      }
                    }}
                  >
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center border-2 rounded px-3 py-1.5 text-sm font-semibold mr-2 min-w-[60px] relative ${isOpen ? 'bg-white border-[#3748EF] text-[#3748EF]' : 'bg-white border-[#3748EF] text-gray-900'} hover:bg-gray-50`}
                      onClick={() => onQuestionClick(q.id)}
                      title={`Câu ${q.position || ''}`}
                    >
                      {q.position ?? ''}
                      <svg 
                        className={`ml-1 w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && renderQuestionPopover(q)}
                  </span>
                );
                globalQuestionIndex += 1;
              } else {
                segments.push(
                  <span key={`${part.key}-q-${match.index}`} className="inline-block align-middle">
                    <span className="inline-flex items-center justify-center border-2 border-gray-800 rounded px-3 py-1 text-sm font-semibold mr-2">?</span>
                  </span>
                );
              }
            } else {
              const tag = match[1];
              const content = match[2];
              if (tag === 'center') {
                segments.push(
                  <div key={`${part.key}-c-${match.index}`} className="text-center">
                    {renderWithUnderline(content, `${part.key}-c-${match.index}`)}
                  </div>
                );
              } else if (tag === 'right') {
                segments.push(
                  <div key={`${part.key}-r-${match.index}`} className="text-right">
                    {renderWithUnderline(content, `${part.key}-r-${match.index}`)}
                  </div>
                );
              }
            }
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < part.content.length) {
            const remaining = part.content.slice(lastIndex);
            if (remaining) {
              const tableResult = renderTextWithTables(remaining, `${part.key}-rem`);
              if (Array.isArray(tableResult)) {
                tableResult.forEach((item, idx) => {
                  if (React.isValidElement(item)) {
                    segments.push(React.cloneElement(item, { key: `${part.key}-t-end-${idx}` }));
                  } else {
                    segments.push(
                      <span key={`${part.key}-t-end-${idx}`}>
                        {item}
                      </span>
                    );
                  }
                });
              } else if (tableResult) {
                segments.push(
                  <span key={`${part.key}-t-end`}>
                    {tableResult}
                  </span>
                );
              }
            }
          }

          return segments.length > 0 ? <span key={part.key}>{segments}</span> : null;
        }
      })}
    </div>
  );
};

// Helper: Tìm vị trí thẻ đóng tương ứng với thẻ mở tại startIndex
const findMatchingCloseTag = (text, startIndex) => {
  const openTag = '<frame>';
  const closeTag = '</frame>';
  const openTagLength = openTag.length;
  
  let depth = 0;
  let index = startIndex + openTagLength;
  
  while (index < text.length) {
    const openIndex = text.indexOf(openTag, index);
    const closeIndex = text.indexOf(closeTag, index);
    
    // Không tìm thấy thẻ nào
    if (openIndex === -1 && closeIndex === -1) {
      return -1; // Không có thẻ đóng tương ứng
    }
    
    // Xác định thẻ nào xuất hiện trước
    if (openIndex !== -1 && (closeIndex === -1 || openIndex < closeIndex)) {
      // Gặp thẻ mở, tăng depth
      depth++;
      index = openIndex + openTagLength;
    } else {
      // Gặp thẻ đóng
      if (depth === 0) {
        // Đây là thẻ đóng tương ứng
        return closeIndex;
      }
      // Giảm depth và tiếp tục tìm
      depth--;
      index = closeIndex + closeTag.length;
    }
  }
  
  return -1; // Không tìm thấy thẻ đóng tương ứng
};

// Helper: Parse các frame tags lồng nhau bằng đệ quy
const parseNestedFrames = (text, startPos = 0) => {
  if (!text) return [];
  
  const result = [];
  const openTag = '<frame>';
  const closeTag = '</frame>';
  let currentIndex = startPos;
  
  while (currentIndex < text.length) {
    const openIndex = text.indexOf(openTag, currentIndex);
    
    if (openIndex === -1) {
      // Không còn thẻ mở nào, thêm phần text còn lại
      const remainingText = text.slice(currentIndex);
      if (remainingText.trim().length > 0) {
        result.push({ type: 'text', content: remainingText });
      }
      break;
    }
    
    // Thêm text trước thẻ mở
    if (openIndex > currentIndex) {
      const beforeText = text.slice(currentIndex, openIndex);
      if (beforeText.trim().length > 0) {
        result.push({ type: 'text', content: beforeText });
      }
    }
    
    // Tìm thẻ đóng tương ứng
    const closeIndex = findMatchingCloseTag(text, openIndex);
    
    if (closeIndex === -1) {
      // Không tìm thấy thẻ đóng, xử lý phần còn lại như text thường
      const remainingText = text.slice(openIndex);
      if (remainingText.trim().length > 0) {
        result.push({ type: 'text', content: remainingText });
      }
      break;
    }
    
    // Lấy nội dung bên trong frame (không bao gồm các thẻ)
    const frameContent = text.slice(openIndex + openTag.length, closeIndex);
    
    // Parse đệ quy nội dung frame để xử lý các frame lồng nhau
    const nestedContent = parseNestedFrames(frameContent, 0);
    
    result.push({
      type: 'frame',
      content: frameContent,
      nestedContent: nestedContent
    });
    
    // Tiếp tục sau thẻ đóng
    currentIndex = closeIndex + closeTag.length;
  }
  
  return result;
};

// Helper: Render các frame đã parse (hỗ trợ lồng nhau)
const renderParsedFrames = (parsedFrames, keyPrefix, options = {}) => {
  const parts = [];
  let idx = 0;
  
  for (const item of parsedFrames) {
    if (item.type === 'text') {
      if (item.content.trim().length > 0) {
        parts.push(
          <div key={`${keyPrefix}-text-${idx++}`} className="font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
            {renderInlineBlock(item.content, `${keyPrefix}-text-${idx}`, options)}
          </div>
        );
      }
    } else if (item.type === 'frame') {
      // Render nội dung frame (có thể chứa frame lồng nhau)
      let frameContent;
      if (item.nestedContent && item.nestedContent.length > 0) {
        // Có frame lồng nhau, render đệ quy
        frameContent = renderParsedFrames(item.nestedContent, `${keyPrefix}-frame-${idx}`, options);
      } else {
        // Không có frame lồng nhau, render bình thường
        frameContent = renderInlineBlock(item.content, `${keyPrefix}-frame-${idx}`, options);
      }
      
      parts.push(
        <div key={`${keyPrefix}-frame-${idx++}`} className="mt-4 border-2 border-black p-4 bg-white rounded-lg">
          <div className="text-lg leading-relaxed text-gray-800 font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
            {frameContent}
          </div>
        </div>
      );
    }
  }
  
  return parts.length > 0 ? <>{parts}</> : null;
};

// 1. HÀM RENDER CHÍNH (Được export)
// options: { questions, questionTypeId, onQuestionClick, renderQuestionPopover, passageQuestionState, questionRefs }
export const renderPassageContent = (text, options = {}) => {
  if (!text) return null;

  // Parse các frame lồng nhau
  const parsedFrames = parseNestedFrames(text);
  
  // Render các frame đã parse
  return renderParsedFrames(parsedFrames, 'passage', options);
};

// Helper: Render các frame đã parse cho renderFramedPassageBlocks (hỗ trợ lồng nhau)
const renderParsedFramesForBlocks = (parsedFrames, isTimeUp, keyPrefix = 'block') => {
  const parts = [];
  let idx = 0;
  
  for (const item of parsedFrames) {
    if (item.type === 'text') {
      if (item.content.trim().length > 0) {
        parts.push({
          type: 'text',
          content: renderInlineBlock(item.content, `${keyPrefix}-text-${idx++}`)
        });
      }
    } else if (item.type === 'frame') {
      // Render nội dung frame (có thể chứa frame lồng nhau)
      let frameContent;
      if (item.nestedContent && item.nestedContent.length > 0) {
        // Có frame lồng nhau, render đệ quy và wrap trong React Fragment
        const nestedParts = renderParsedFramesForBlocks(item.nestedContent, isTimeUp, `${keyPrefix}-frame-${idx}`);
        // Chuyển đổi nested parts thành React elements
        frameContent = (
          <>
            {nestedParts.map((part, partIdx) => {
              if (part.type === 'frame') {
                return (
                  <div key={`nested-${partIdx}`} className={`mt-4 border-2 border-black p-4 rounded-lg ${isTimeUp ? 'bg-red-100' : 'bg-white'}`}>
                    <div className="text-lg md:text-xl leading-relaxed text-gray-800 font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
                      {part.content}
                    </div>
                  </div>
                );
              }
              return <div key={`nested-${partIdx}`} className="font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>{part.content}</div>;
            })}
          </>
        );
      } else {
        // Không có frame lồng nhau, render bình thường
        frameContent = renderInlineBlock(item.content, `${keyPrefix}-frame-${idx}`);
      }
      
      parts.push({
        type: 'frame',
        content: frameContent
      });
      idx++;
    }
  }
  
  return parts;
};

// 2. HÀM RENDER FRAME (Được export)
export const renderFramedPassageBlocks = (passageText, isTimeUp) => {
    if (!passageText) return null;

    // Parse các frame lồng nhau
    const parsedFrames = parseNestedFrames(passageText);
    
    // Render các frame đã parse
    const parts = renderParsedFramesForBlocks(parsedFrames, isTimeUp, 'block');

    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: renderInlineBlock(passageText, `all-0`)
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'frame') {
        return (
          <div key={index} className={`mt-4 border-2 border-black p-4 rounded-lg ${isTimeUp ? 'bg-red-100' : 'bg-white'}`}>
            <div className="text-lg md:text-xl leading-relaxed text-gray-800 font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
              {part.content}
            </div>
          </div>
        );
      }
      return <div key={index} className="font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>{part.content}</div>;
    });
};

// Helper: Render question_text với tất cả các tag (bolder, underline, tab, center, right, table, enter)
// và hỗ trợ underline_text nếu có
export const renderQuestionText = (questionText, underlineText = null) => {
  if (!questionText) return null;

  // Nếu có underline_text, xử lý underline_text trước
  if (underlineText && questionText.includes(underlineText)) {
    const firstIndex = questionText.indexOf(underlineText);
    const beforeText = questionText.substring(0, firstIndex);
    const underlinedText = questionText.substring(firstIndex, firstIndex + underlineText.length);
    const afterText = questionText.substring(firstIndex + underlineText.length);

    return (
      <>
        {renderQuestionTextContent(beforeText)}
        <Underline weight={1} offset={4} colorClass="decoration-black">
          {renderQuestionTextContent(underlinedText)}
        </Underline>
        {renderQuestionTextContent(afterText)}
      </>
    );
  }

  // Không có underline_text, render bình thường với tất cả tags
  return renderQuestionTextContent(questionText);
};

// Helper: Render nội dung question_text với các tag (không xử lý underline_text)
const renderQuestionTextContent = (text) => {
  if (!text) return null;

  // Xử lý <enter> trước - chia thành các dòng
  const lines = text.split('<enter>');
  
  if (lines.length === 1) {
    // Không có <enter>, xử lý các tag khác trực tiếp
    return renderQuestionTextLine(text, 'qt-line-0');
  }
  
  // Có <enter>, render từng dòng và thêm <br> giữa chúng
  return (
    <>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={`qt-line-${lineIndex}`}>
          {renderQuestionTextLine(line, `qt-line-${lineIndex}`)}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

// Helper: Render một dòng question_text với các tag (center, right, underline, bolder, tab, table)
const renderQuestionTextLine = (lineText, keyBase) => {
  if (!lineText) return null;
  
  // Xử lý table tags trước
  const tableResult = renderTextWithTables(lineText, keyBase);
  
  // Nếu có table tags, renderTextWithTables đã xử lý tất cả và trả về array hoặc React element
  if (Array.isArray(tableResult) || React.isValidElement(tableResult)) {
    return tableResult;
  }
  
  // Nếu renderTextWithTables trả về string hoặc null, có nghĩa là không có table
  // Nhưng có thể có alignment tags (<center>, <right>), cần xử lý riêng
  // Kiểm tra xem có alignment tags không
  const alignmentRegex = /<(center|right)>([\s\S]*?)<\/\1>/g;
  const hasAlignment = alignmentRegex.test(lineText);
  
  // Nếu không có alignment tags, chỉ cần render với underline/bolder/tab
  if (!hasAlignment) {
    return tableResult || renderWithUnderline(lineText, keyBase);
  }
  
  // Có alignment tags, xử lý từng phần
  alignmentRegex.lastIndex = 0; // Reset regex
  const parts = [];
  let lastIndex = 0;
  let match;
  
  const addProcessedText = (processedText, alignment = null) => {
    if (Array.isArray(processedText)) {
      if (alignment) {
        parts.push(
          <div key={`${keyBase}-align-${parts.length}`} className={alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : ''}>
            {processedText}
          </div>
        );
      } else {
        parts.push(...processedText);
      }
    } else if (processedText !== null && processedText !== undefined) {
      if (alignment) {
        parts.push(
          <div key={`${keyBase}-align-${parts.length}`} className={alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : ''}>
            {processedText}
          </div>
        );
      } else {
        parts.push(processedText);
      }
    }
  };
  
  while ((match = alignmentRegex.exec(lineText)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = lineText.slice(lastIndex, match.index);
      const processedBefore = renderWithUnderline(beforeText, `${keyBase}-before-align-${match.index}`);
      addProcessedText(processedBefore);
    }
    const alignmentType = match[1]; // 'center' hoặc 'right'
    const processedContent = renderWithUnderline(match[2], `${keyBase}-${alignmentType}-content-${match.index}`);
    addProcessedText(processedContent, alignmentType);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < lineText.length) {
    const remainingText = lineText.slice(lastIndex);
    const processedRemaining = renderWithUnderline(remainingText, `${keyBase}-after-align-${lastIndex}`);
    addProcessedText(processedRemaining);
  }
  
  return parts.length > 0 ? parts : (tableResult || renderWithUnderline(lineText, keyBase));
};

// 3. HÀM FORMAT TEXT (Được export)
export const formatAnswerText = (answerText, questionText, questionTypeId, isCorrectUsage = false) => {
    if (!isCorrectUsage || !answerText || !questionText) {
      return answerText;
    }

    const normalizeText = (text) => {
      return text.replace(/\s+/g, ' ').trim().toLowerCase();
    };

    const findLongestCommonSubstring = (str1, str2) => {
      const normalized1 = normalizeText(str1);
      const normalized2 = normalizeText(str2);
      
      let longest = "";
      let longestLength = 0;
      const minLengths = [5, 4, 3, 2];
      
      for (const minLength of minLengths) {
        for (let i = 0; i < normalized1.length - minLength + 1; i++) {
          for (let j = i + minLength; j <= normalized1.length; j++) {
            const substring = normalized1.substring(i, j);
            if (normalized2.includes(substring) && substring.length > longestLength) {
              const originalSubstring = str1.substring(i, j);
              longest = originalSubstring;
              longestLength = substring.length;
            }
          }
        }
        if (longestLength > 0) break;
      }
      return longest;
    };

    const commonText = findLongestCommonSubstring(answerText, questionText);
    
    if (commonText && commonText.length >= 2) {
      const parts = answerText.split(commonText);
      return (
          <>
            {parts[0]}
            <Underline weight={1} offset={5} colorClass="decoration-black">
              {commonText}
            </Underline>
            {parts[1]}
          </>
      );
    }
    return answerText;
};