export const verifyLanguage = (text, isEnglish, isArabic) => {
  const hasEnglish = /[a-zA-Z]/.test(text);
  const hasArabic = /[\u0600-\u06FF]/.test(text);

  if (isEnglish && hasArabic) {
    return {
      valid: false,
      message: "<span style='color:red'>Please ask your question in English. You selected English language.</span>"
    };
  }

  if (isArabic && hasEnglish) {
    return {
      valid: false,
      message: "<span style='color:red'>يرجى طرح سؤالك باللغة العربية. لقد حددت اللغة العربية.</span>"
    };
  }

  if (!hasEnglish && !hasArabic) {
    return {
      valid: false,
      message: isEnglish
        ? "<span style='color:red'>I only accept questions in English. Please ask in English.</span>"
        : "<span style='color:red'>أقبل الأسئلة باللغة العربية فقط. يرجى السؤال باللغة العربية.</span>"
    };
  }

  return { valid: true };
};

export const detectEmergency = (text) => {
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'bleeding heavily',
    'cannot breathe', 'difficulty breathing', 'unconscious',
    'severe pain', 'suicide', 'kill myself', 'ألم في الصدر',
    'نوبة قلبية', 'سكتة دماغية', 'نزيف حاد', 'صعوبة في التنفس'
  ];
  return emergencyKeywords.some(keyword =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

const medicalPatterns = {
  english: [
    /(pain|ache|hurt|sore|discomfort|tender)/i,
    /(symptom|sign|problem|issue|condition|complaint)/i,
    /(fever|temperature|hot|cold|chill)/i,
    /(cough|sneeze|congestion|runny nose)/i,
    /(headache|migraine|head pain)/i,
    /(nausea|vomit|throw up|sick to stomach)/i,
    /(doctor|hospital|clinic|medical|healthcare)/i,
    /(treatment|medicine|drug|medication)/i,
    /(disease|illness|sickness|infection)/i,
    /(heart|chest|lung|breath|breathe)/i,
    /(stomach|abdominal|belly|digest)/i,
    /(I have|I feel|I'm feeling)/i
  ],
  arabic: [
    /(ألم|وجع|مؤلم|مؤلمة|آلام)/i,
    /(حمى|سخونة|حرارة)/i,
    /(صداع|رأس|مخ|دماغ)/i,
    /(سعال|كحة|بلغم)/i,
    /(غثيان|قيء|ترجيع)/i,
    /(طبيب|مستشفى|عيادة|مستوصف)/i,
    /(علاج|دواء|طب|دواء)/i,
    /(مرض|اعتلال|عدوى|مرضي)/i,
    /(أعاني من|أشعر|لدي|عندي)/i
  ]
};

const questionPatterns = [
  /\?/,
  /(what|how|when|where|why|should|can|could).*\?/i,
  /(ماذا|كيف|متى|أين|لماذا|هل).*\?/i
];

export const isMedicalQuestion = (text) => {
  if (!text || text.trim().length < 3) return false;

  const cleanedText = cleanText(text);
  if (cleanedText.length < 5) return false;

  const hasMedicalKeywords = [...medicalPatterns.english, ...medicalPatterns.arabic]
    .some(pattern => pattern.test(cleanedText));

  const isQuestion = questionPatterns.some(pattern => pattern.test(cleanedText));
  const hasSymptomDescription = checkSymptomDescription(cleanedText);

  return hasMedicalKeywords || hasSymptomDescription || (isQuestion && cleanedText.length > 10);
};

const cleanText = (text) => {
  const greetings = {
    english: /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/gi,
    arabic: /\b(مرحبا|السلام عليكم|اهلا|مساء الخير|صباح الخير)\b/gi
  };

  return text
    .replace(greetings.english, '')
    .replace(greetings.arabic, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const checkSymptomDescription = (text) => {
  const symptomIndicators = {
    english: ['have', 'feel', 'got'],
    arabic: ['أعاني', 'أشعر', 'لدي']
  };

  const symptomKeywords = {
    english: ['pain', 'ache', 'fever', 'headache'],
    arabic: ['ألم', 'حمى', 'صداع']
  };

  const hasIndicator = [...symptomIndicators.english, ...symptomIndicators.arabic]
    .some(indicator => text.includes(indicator));

  const hasSymptom = [...symptomKeywords.english, ...symptomKeywords.arabic]
    .some(keyword => text.includes(keyword));

  return hasIndicator && hasSymptom;
};