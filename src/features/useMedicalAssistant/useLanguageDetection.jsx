import { useCallback } from "react";

export const useLanguageDetection = () => {
    // ভাষা ডিটেক্ট করা (শুধু ইংরেজি/আরবি)
    const detectLanguage = useCallback((text) => {
        const hasEnglish = /[a-zA-Z]/.test(text);
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        return hasEnglish || hasArabic;
    }, []);

    return { detectLanguage };
};