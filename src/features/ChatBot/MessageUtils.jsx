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

export const isMedicalQuestion = (text) => {
  const medicalKeywords = [
    'pain', 'symptom', 'fever', 'headache', 'cough', 'disease',
    'diagnos', 'treatment', 'medicine', 'doctor', 'hospital',
    'ألم', 'حمى', 'صداع', 'سعال', 'مرض', 'علاج', 'دواء'
  ];

  return medicalKeywords.some(keyword =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};