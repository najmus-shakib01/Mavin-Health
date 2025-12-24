export const verifyLanguage = (text, isEnglish, isArabic) => {
  const hasEnglish = /[a-zA-Z]/.test(text);
  const hasArabic = /[\u0600-\u06FF]/.test(text);

  if (isEnglish && hasArabic) {
    return {
      valid: false,
      message: "<span style='color:red'>Please ask your question in English. You selected English language.</span>",
    };
  }

  if (isArabic && hasEnglish) {
    return {
      valid: false,
      message: "<span style='color:red'>يرجى طرح سؤالك باللغة العربية. لقد حددت اللغة العربية.</span>",
    };
  }

  if (!hasEnglish && !hasArabic) {
    return {
      valid: false,
      message: isEnglish
        ? "<span style='color:red'>I only accept questions in English. Please ask in English.</span>"
        : "<span style='color:red'>أقبل الأسئلة باللغة العربية فقط. يرجى السؤال باللغة العربية.</span>",
    };
  }

  return { valid: true };
};

export const detectEmergency = (text) => {
  const emergencyKeywords = [
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
  const lower = text.toLowerCase();
  return emergencyKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
};

const cleanText = (text) => {
  const greetings = {
    english: /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/gi,
    arabic: /\b(مرحبا|السلام عليكم|اهلا|مساء الخير|صباح الخير)\b/gi,
  };

  return text
    .replace(greetings.english, "")
    .replace(greetings.arabic, "")
    .replace(/\s+/g, " ")
    .trim();
};

const MEDICAL_KEYWORDS_EN = [
  "symptom",
  "symptoms",
  "pain",
  "ache",
  "hurt",
  "sore",
  "fever",
  "temperature",
  "cough",
  "congestion",
  "runny nose",
  "sneeze",
  "headache",
  "migraine",
  "nausea",
  "vomit",
  "diarrhea",
  "rash",
  "infection",
  "inflammation",
  "swelling",
  "dizzy",
  "dizziness",
  "shortness of breath",
  "breath",
  "breathe",
  "chest",
  "heart",
  "lung",
  "stomach",
  "abdominal",
  "blood pressure",
  "hypertension",
  "diabetes",
  "doctor",
  "clinic",
  "hospital",
  "medical",
  "health",
];

const MEDICAL_KEYWORDS_AR = [
  "ألم",
  "وجع",
  "آلام",
  "حمى",
  "سخونة",
  "حرارة",
  "سعال",
  "كحة",
  "بلغم",
  "غثيان",
  "قيء",
  "إسهال",
  "طفح",
  "عدوى",
  "التهاب",
  "تورم",
  "دوخة",
  "ضيق",
  "تنفس",
  "صدر",
  "قلب",
  "رئة",
  "معدة",
  "بطن",
  "ضغط",
  "سكري",
  "طبيب",
  "عيادة",
  "مستشفى",
  "صحة",
];

const SYMPTOM_VERBS_EN = ["i have", "i feel", "i'm feeling", "i am feeling", "suffering", "experiencing"];
const SYMPTOM_VERBS_AR = ["أعاني", "أشعر", "لدي", "عندي"];

const isQuestionLike = (text) => {
  return /\?/.test(text) || /^(what|how|when|where|why|should|can|could)\b/i.test(text) || /^(ماذا|كيف|متى|أين|لماذا|هل)\b/.test(text);
};

export const isMedicalQuestion = (text) => {
  if (!text || text.trim().length < 3) return false;

  const cleaned = cleanText(text);
  if (cleaned.length < 5) return false;

  const lower = cleaned.toLowerCase();

  const hasMedicalKeyword =
    MEDICAL_KEYWORDS_EN.some((k) => lower.includes(k)) ||
    MEDICAL_KEYWORDS_AR.some((k) => cleaned.includes(k)); // arabic: keep original chars

  const hasSymptomVerb =
    SYMPTOM_VERBS_EN.some((v) => lower.includes(v)) ||
    SYMPTOM_VERBS_AR.some((v) => cleaned.includes(v));

  // if user says "I have ..." but no medical nouns, don't accept blindly
  const hasSymptomNoun =
    ["pain", "fever", "cough", "headache", "nausea", "rash", "infection", "dizzy"].some((k) => lower.includes(k)) ||
    ["ألم", "حمى", "سعال", "صداع", "غثيان", "طفح", "عدوى", "دوخة"].some((k) => cleaned.includes(k));

  const symptomDescription = (hasSymptomVerb && (hasSymptomNoun || hasMedicalKeyword)) || (hasSymptomNoun && hasMedicalKeyword);

  const medicalQuestion = isQuestionLike(cleaned) && (hasMedicalKeyword || hasSymptomNoun);

  return hasMedicalKeyword || symptomDescription || medicalQuestion;
};
