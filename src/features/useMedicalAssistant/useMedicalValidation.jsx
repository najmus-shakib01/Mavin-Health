import { useCallback } from "react";

const useMedicalValidation = () => {
    const isMedicalQuestion = useCallback((text) => {
        const medicalKeywords = [
            'pain', 'symptom', 'fever', 'headache', 'cough', 'disease',
            'diagnos', 'treatment', 'medicine', 'doctor', 'hospital',
            'ألم', 'حمى', 'صداع', 'سعال', 'مرض', 'علاج', 'دواء'
        ];

        return medicalKeywords.some(keyword =>
            text.toLowerCase().includes(keyword.toLowerCase())
        );
    }, []);

    return { isMedicalQuestion };
};

export default useMedicalValidation;