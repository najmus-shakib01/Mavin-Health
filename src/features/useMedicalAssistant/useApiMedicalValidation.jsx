import { useCallback } from "react";

const MEDICAL_PATTERNS = {
  english: [
    /(pain|ache|hurt|sore|discomfort|tender)/i,
    /(symptom|sign|problem|issue|condition|complaint)/i,
    /(fever|temperature|chill|cough|sneeze|congestion|runny nose)/i,
    /(headache|migraine|nausea|vomit|diarrhea|rash|dizzy)/i,
    /(doctor|hospital|clinic|medical|healthcare|health)/i,
    /(infection|inflammation|disease|illness)/i,
    /(heart|chest|lung|breath|breathe|stomach|abdominal)/i,
  ],
  arabic: [
    /(ألم|وجع|مؤلم|مؤلمة|آلام)/i,
    /(حمى|سخونة|حرارة)/i,
    /(صداع|رأس|دوخة)/i,
    /(سعال|كحة|بلغم)/i,
    /(غثيان|قيء|إسهال|طفح)/i,
    /(طبيب|مستشفى|عيادة|صحة)/i,
    /(مرض|اعتلال|عدوى|التهاب|تورم)/i,
    /(صدر|قلب|رئة|تنفس|معدة|بطن|ضغط|سكري)/i,
  ],
};

const EMERGENCY_KEYWORDS = [
  "chest pain",
  "heart attack",
  "stroke",
  "bleeding heavily",
  "cannot breathe",
  "difficulty breathing",
  "unconscious",
  "severe pain",
  "suicide",
  "kill myself",
  "ألم في الصدر",
  "نوبة قلبية",
  "سكتة دماغية",
  "نزيف حاد",
  "صعوبة في التنفس",
];

const cleanText = (text) =>
  text
    .replace(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|مرحبا|السلام عليكم|اهلا)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const useMedicalValidation = () => {
  const isMedicalQuestion = useCallback((text) => {
    if (!text || text.trim().length < 3) return false;

    const cleaned = cleanText(text);
    if (cleaned.length < 5) return false;

    // Must match at least one clear medical pattern
    const hasMedical = [...MEDICAL_PATTERNS.english, ...MEDICAL_PATTERNS.arabic].some((p) => p.test(cleaned));

    // Question alone is NOT enough (prevents false positives)
    const isQuestion = /\?/.test(cleaned) || /^(what|how|when|where|why|should|can|could|ماذا|كيف|متى|أين|لماذا|هل)\b/i.test(cleaned);

    return hasMedical || (isQuestion && hasMedical);
  }, []);

  const detectEmergency = useCallback((text) => {
    const lower = String(text || "").toLowerCase();
    return EMERGENCY_KEYWORDS.some((k) => lower.includes(k.toLowerCase()));
  }, []);

  return { isMedicalQuestion, detectEmergency };
};

export default useMedicalValidation;
