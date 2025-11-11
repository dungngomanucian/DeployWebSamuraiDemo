import React from 'react';

const CloseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>;

const TranslationModal = ({ isVisible, onClose, isLoading, error, translation, originalText }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <>
            <div className="modal modal-open transition-opacity duration-300">
                <div className="modal-box w-11/12 max-w-lg bg-white shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
                        <span>Tra cứu với Gemini</span>
                        <button className="btn btn-sm btn-ghost p-1" onClick={onClose} aria-label="Đóng">
                            <CloseIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </h3>

                    <div className="space-y-4">
                        {/* Văn bản gốc */}
                        <div>
                            <p className="font-semibold text-gray-600 text-sm mb-1">Văn bản gốc:</p>
                            <p className="bg-gray-100 p-3 rounded-md text-gray-800 italic">"{originalText}"</p>
                        </div>

                        {/* Kết quả dịch */}
                        <div>
                            <p className="font-semibold text-green-700 text-sm mb-1">Kết quả:</p>
                            <div className="bg-green-50 p-3 rounded-md min-h-[80px] flex items-center justify-center">
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
                                {translation && (
                                    <p className="text-gray-900">{translation}</p>
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