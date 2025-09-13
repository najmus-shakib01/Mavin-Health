import { useCallback } from "react";

const useLanguageDetection = () => {
    const detectLanguage = useCallback((text) => {
        const hasEnglish = /[a-zA-Z]/.test(text);
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        return hasEnglish || hasArabic;
    }, []);

    return { detectLanguage };
};

export default useLanguageDetection;