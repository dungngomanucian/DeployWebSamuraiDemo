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

// Helper: Render text với <underline>
const renderWithUnderline = (text, keyBase) => {
  const underlineRegex = /<underline>([\s\S]*?)<\/underline>/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = underlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <Underline key={`${keyBase}-ul-${match.index}`} weight={2}>
        {match[1]}
      </Underline>
    );
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

// Helper: Render text với <table>
const renderTextWithTables = (rawText, keyBase) => {
  const tableRegex = /<table>([\s\S]*?)<\/table>/g;
  let tMatch;
  let tLast = 0;
  const out = [];
  while ((tMatch = tableRegex.exec(rawText)) !== null) {
    if (tMatch.index > tLast) {
      const plain = rawText.slice(tLast, tMatch.index);
      if (plain) out.push(<span key={`${keyBase}-plain-${tLast}`}>{renderWithUnderline(plain, `${keyBase}-${tLast}`)}</span>);
    }
    const tableContent = tMatch[1] || '';
    const rows = [];
    const rowRegex = /<r\d+>([\s\S]*?)<\/r\d+>/g;
    let rMatch;
    while ((rMatch = rowRegex.exec(tableContent)) !== null) {
      const rowHtml = rMatch[1] || '';
      const cells = [];
      const cellRegex = /<c\d+>([\s\S]*?)<\/c\d+>/g;
      let cMatch;
      while ((cMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(cMatch[1] || '');
      }
      rows.push(cells);
    }
    out.push(
      <div key={`${keyBase}-table-${tMatch.index}`} className="my-2 overflow-x-auto">
        <table className="mx-auto table-auto min-w-[540px] border border-gray-400 text-sm">
          <tbody>
            {rows.map((cells, ri) => (
              <tr key={`r-${ri}`} className={ri === 0 ? 'bg-gray-100 font-semibold' : ''}>
                {cells.map((cell, ci) => (
                  <td key={`c-${ci}`} className="border border-gray-400 px-4 py-2 text-center whitespace-pre-wrap min-w-[160px]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tLast = tMatch.index + tMatch[0].length;
  }
  if (tLast < rawText.length) {
    const tail = rawText.slice(tLast);
    if (tail) out.push(<span key={`${keyBase}-plain-tail-${tLast}`}>{renderWithUnderline(tail, `${keyBase}-tail`)}</span>);
  }
  return out;
};

// Helper: Render nội dung passage (phần <frame>, <center>, <right>)
// options: { onQuestionClick, renderQuestionPopover, questionRefs }
const renderInlineBlock = (blockText, keyPrefix, options = {}) => {
  const { onQuestionClick, renderQuestionPopover, questionRefs, questions = [], passageQuestionState = {} } = options;
  let globalQuestionIndex = 0;

  const lines = blockText.split('<enter>');
  return (
    <div className="leading-relaxed">
      {lines.map((line, lineIndex) => {
        const segments = [];
        const tagRegex = /<(center|right)>([\s\S]*?)<\/\1>|<question\s*\/>|<question\s*>/g;
        let lastIndex = 0;
        let match;

        while ((match = tagRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            const before = line.slice(lastIndex, match.index);
            if (before) {
              segments.push(
                <span key={`${keyPrefix}-t-${lineIndex}-${lastIndex}`}>
                  {renderTextWithTables(before, `${keyPrefix}-seg-${lineIndex}-${lastIndex}`)}
                </span>
              );
            }
          }
          if (match[0].startsWith('<question')) {
            if (questions && globalQuestionIndex < questions.length) {
              const q = questions[globalQuestionIndex];
              const isOpen = !!passageQuestionState[q.id];
              segments.push(
                <span
                  key={`${keyPrefix}-q-${lineIndex}-${match.index}`}
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
                <span key={`${keyPrefix}-q-${lineIndex}-${match.index}`} className="inline-block align-middle">
                  <span className="inline-flex items-center justify-center border-2 border-gray-800 rounded px-3 py-1 text-sm font-semibold mr-2">?</span>
                </span>
              );
            }
          } else {
            const tag = match[1];
            const content = match[2];
            if (tag === 'center') {
              segments.push(
                <div key={`${keyPrefix}-c-${lineIndex}-${match.index}`} className="text-center">
                  {renderWithUnderline(content, `${keyPrefix}-c-${lineIndex}-${match.index}`)}
                </div>
              );
            } else if (tag === 'right') {
              segments.push(
                <div key={`${keyPrefix}-r-${lineIndex}-${match.index}`} className="text-right">
                  {renderWithUnderline(content, `${keyPrefix}-r-${lineIndex}-${match.index}`)}
                </div>
              );
            }
          }
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < line.length) {
          const remaining = line.slice(lastIndex);
          if (remaining) {
            segments.push(
              <span key={`${keyPrefix}-t-${lineIndex}-end`}>
                {renderTextWithTables(remaining, `${keyPrefix}-rem-${lineIndex}`)}
              </span>
            );
          }
        }

        return (
          <div key={`${keyPrefix}-line-${lineIndex}`} className="leading-relaxed">
            {segments.length > 0 ? segments : <span />}
            {lineIndex < lines.length - 1 && <br className="leading-relaxed" />}
          </div>
        );
      })}
    </div>
  );
};

// 1. HÀM RENDER CHÍNH (Được export)
// options: { questions, questionTypeId, onQuestionClick, renderQuestionPopover, passageQuestionState, questionRefs }
export const renderPassageContent = (text, options = {}) => {
  if (!text) return null;

  const parts = [];
  const frameRegex = /<frame>([\s\S]*?)<\/frame>/g;
  let lastIndex = 0;
  let match;
  let idx = 0;
  while ((match = frameRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim().length > 0) {
        parts.push(
          <div key={`nf-${idx++}`} className="font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
            {renderInlineBlock(before, `nf-${idx}`, options)}
          </div>
        );
      }
    }
    const frameContent = match[1];
    parts.push(
      <div key={`fr-${idx++}`} className="mt-4 border-2 border-black p-4 bg-white rounded-lg">
        <div className="text-lg leading-relaxed text-gray-800 font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
          {renderInlineBlock(frameContent, `frc-${idx}`, options)}
        </div>
      </div>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim().length > 0) {
      parts.push(
        <div key={`nf-${idx++}`} className="font-normal" style={{fontFamily: "UD Digi Kyokasho N-R"}}>
          {renderInlineBlock(remaining, `nf-${idx}`, options)}
        </div>
      );
    }
  }
  return <>{parts}</>;
};

// 2. HÀM RENDER FRAME (Được export)
export const renderFramedPassageBlocks = (passageText, isTimeUp) => {
    if (!passageText) return null;

    const parts = [];
    let currentIndex = 0;
    const frameRegex = /<frame>([\s\S]*?)<\/frame>/g;
    let match;

    while ((match = frameRegex.exec(passageText)) !== null) {
      if (match.index > currentIndex) {
        const beforeText = passageText.slice(currentIndex, match.index);
        parts.push({
          type: 'text',
          content: renderInlineBlock(beforeText, `pre-${currentIndex}`)
        });
      }

      const frameContent = match[1];
      parts.push({
        type: 'frame',
        content: renderInlineBlock(frameContent, `frame-${match.index}`)
      });
      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < passageText.length) {
      const remainingText = passageText.slice(currentIndex);
      parts.push({
        type: 'text',
        content: renderInlineBlock(remainingText, `post-${currentIndex}`)
      });
    }

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

// 3. HÀM FORMAT TEXT (Được export)
export const formatAnswerText = (answerText, questionText, questionTypeId) => {
    if (questionTypeId !== "QT005" || !answerText || !questionText) {
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