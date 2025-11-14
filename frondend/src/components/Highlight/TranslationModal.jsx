import React from 'react';

const CloseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>;
const SpeakerIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;

const TranslationModal = ({ isVisible, onClose, isLoading, error, translation, originalText }) => {
    if (!isVisible) {
        return null;
    }

    /**
     * Sử dụng Web Speech API để phát âm văn bản.
     * @param {string} textToSpeak - Văn bản cần phát âm.
     * @param {string} lang - Mã ngôn ngữ (ví dụ: 'ja-JP' cho tiếng Nhật).
     */
    const handleSpeak = (textToSpeak, lang = 'ja-JP') => {
        if (!('speechSynthesis' in window)) {
            alert('Rất tiếc, trình duyệt của bạn không hỗ trợ tính năng này.');
            return;
        }

        // Dừng mọi âm thanh đang phát trước đó
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = lang;
        utterance.rate = 0.9; // Điều chỉnh tốc độ đọc cho dễ nghe

        // Cố gắng chọn giọng đọc tiếng Nhật nếu có
        const japaneseVoice = window.speechSynthesis.getVoices().find(voice => voice.lang === 'ja-JP');
        if (japaneseVoice) {
            utterance.voice = japaneseVoice;
        }

        window.speechSynthesis.speak(utterance);
    };

    // Component để render chi tiết từ vựng
    const WordDetails = ({ data }) => (
        <div className="text-left space-y-2 text-gray-800">
            <p>
                <span className="font-bold text-2xl">{data.kanji}</span>
                {data.reading && <span className="ml-2 text-lg">({data.reading})</span>}
            </p>
            {data.sino_vietnamese && (
                <p>
                    <span className="font-semibold text-blue-600">Hán Việt:</span> {data.sino_vietnamese}
                </p>
            )}
            <p>
                <span className="font-semibold text-green-700">Nghĩa:</span> {data.meaning}
            </p>
            {data.usage && (
                <p>
                    <span className="font-semibold text-purple-700">Cách dùng:</span> {data.usage}
                </p>
            )}
            {data.grammar && (
                <p>
                    <span className="font-semibold text-orange-700">Ngữ pháp:</span> {data.grammar}
                </p>
            )}
        </div>
    );

    // Component để render bản dịch câu
    const SentenceTranslation = ({ data }) => (
        <p className="text-gray-900 text-left">{data.translation}</p>
    );


    return (
        <>
            <div className="modal modal-open transition-opacity duration-300">
                <div className="modal-box w-11/12 max-w-lg bg-white shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
                        <span>Tra cứu với SAMURAI</span>
                        <button className="btn btn-sm btn-ghost p-1" onClick={onClose} aria-label="Đóng">
                            <CloseIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </h3>

                    <div className="space-y-4">
                        {/* Văn bản gốc */}
                        <div>
                            <p className="font-semibold text-gray-600 text-sm mb-1">Văn bản gốc:</p>
                            <div className="bg-gray-100 p-3 rounded-md text-gray-800 italic flex items-center justify-between">
                                <span>"{originalText}"</span>
                                <button 
                                    className="btn btn-ghost btn-sm p-1 ml-2" 
                                    onClick={() => handleSpeak(originalText)}
                                    aria-label="Nghe phát âm">
                                    <SpeakerIcon className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                                </button>
                            </div>
                        </div>

                        {/* Kết quả dịch */}
                        <div>
                            <p className="font-semibold text-green-700 text-sm mb-1">Kết quả:</p>
                            <div className="bg-green-50 p-4 rounded-md min-h-[120px] flex items-center justify-center">
                                {isLoading && (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="loading loading-spinner text-green-600"></span>
                                        <p className="text-sm text-gray-500">Đang dịch...</p>
                                    </div>
                                )}
                                {error && (
                                    <p className="text-red-600 text-sm text-center">
                                        <strong>Lỗi:</strong> {error}
                                    </p>
                                )}
                                {translation && translation.type === 'word' && (
                                    <WordDetails data={translation} />
                                )}
                                {translation && translation.type === 'sentence' && (
                                    <SentenceTranslation data={translation} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-action mt-6">
                        <button className="btn" onClick={onClose}>Đóng</button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop bg-black opacity-40" onClick={onClose}></div>
        </>
    );
};

export default TranslationModal;