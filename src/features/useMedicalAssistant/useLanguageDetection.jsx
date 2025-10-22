import { useCallback } from "react";

const useLanguageDetection = () => {
    const detectLanguage = useCallback((text) => /[a-zA-Z]/.test(text) || /[\u0600-\u06FF]/.test(text), []);
    return { detectLanguage };
};

export default useLanguageDetection;