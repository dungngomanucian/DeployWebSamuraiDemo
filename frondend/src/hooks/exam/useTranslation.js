import { useState, useCallback } from 'react';
// 🌟 BƯỚC 1: Import hàm service mới
import { translateTextWithGemini } from '../../api/AIService';

export const useTranslation = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [translation, setTranslation] = useState(null);
    const [originalText, setOriginalText] = useState('');

    const translateText = useCallback(async (text) => {
        if (!text) return;

        setIsLoading(true);
        setError(null);
        setTranslation(null);
        setOriginalText(text);

        try {
            // 🌟 BƯỚC 2: Sử dụng hàm service đã import
            const { data, error } = await translateTextWithGemini(text);

            if (error) {
                throw new Error(error);
            }
            setTranslation(data.translatedText); // Giả định API trả về { data: { translatedText: '...' } }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearTranslation = useCallback(() => {
        setTranslation(null);
        setError(null);
        setOriginalText('');
    }, []);

    return { isLoading, error, translation, originalText, translateText, clearTranslation };
};