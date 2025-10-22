import { useCallback } from "react";

const useMedicalValidation = () => {
    const medicalPatterns = {
        english: [
            /(pain|ache|hurt|sore|discomfort)/i, /(symptom|sign|problem|issue)/i,
            /(fever|temperature|hot|cold)/i, /(cough|sneeze|congestion)/i,
            /(headache|migraine)/i, /(nausea|vomit)/i, /(doctor|hospital|clinic|medical)/i,
            /(treatment|medicine|drug)/i, /(disease|illness|sickness)/i,
            /(I have|I feel|I'm feeling)/i
        ],
        arabic: [
            /(ألم|وجع|مؤلم)/i, /(حمى|سخونة|حرارة)/i, /(صداع|رأس)/i,
            /(سعال|كحة)/i, /(غثيان|قيء)/i, /(طبيب|مستشفى|عيادة)/i,
            /(علاج|دواء)/i, /(مرض|اعتلال)/i, /(أعاني من|أشعر|لدي)/i
        ]
    };

    const isMedicalQuestion = useCallback((text) => {
        if (!text || text.trim().length < 3) return false;

        const cleanedText = cleanText(text);
        if (cleanedText.length < 5) return false;

        const hasMedicalKeywords = [...medicalPatterns.english, ...medicalPatterns.arabic]
            .some(pattern => pattern.test(cleanedText));

        const isQuestion = /\?/.test(cleanedText) ||
            /(what|how|when|where|why|should|can|ماذا|كيف|متى|أين|لماذا|هل)/i.test(cleanedText);

        return hasMedicalKeywords || isQuestion || checkSymptomDescription(cleanedText);
    }, [medicalPatterns.arabic, medicalPatterns.english]);

    const detectEmergency = useCallback((text) => {
        const emergencyKeywords = [
            'chest pain', 'heart attack', 'stroke', 'bleeding heavily', 'cannot breathe',
            'difficulty breathing', 'unconscious', 'severe pain', 'suicide',
            'ألم في الصدر', 'نوبة قلبية', 'سكتة دماغية', 'نزيف حاد', 'صعوبة في التنفس'
        ];
        return emergencyKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
    }, []);

    return { isMedicalQuestion, detectEmergency };
};

const cleanText = (text) => text
    .replace(/\b(hi|hello|hey|greetings|مرحبا|السلام عليكم|اهلا)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

const checkSymptomDescription = (text) => {
    const hasIndicator = ['have', 'feel', 'got', 'أعاني', 'أشعر', 'لدي'].some(indicator => text.includes(indicator));
    const hasSymptom = ['pain', 'ache', 'fever', 'headache', 'ألم', 'حمى', 'صداع'].some(keyword => text.includes(keyword));
    return hasIndicator && hasSymptom;
};

export default useMedicalValidation;