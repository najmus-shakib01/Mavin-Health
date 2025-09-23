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
  if (!text || text.trim().length < 3) return false;

  const lowerText = text.toLowerCase().trim();

  const cleanedText = lowerText
    .replace(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/g, '')
    .replace(/\b(مرحبا|السلام عليكم|اهلا|مساء الخير|صباح الخير)\b/g, '')
    .trim();

  if (cleanedText.length < 5) return false;

  const medicalPatterns = [
    // English Medical Keywords 
    /(pain|ache|hurt|sore|discomfort|tender)/i,
    /(symptom|sign|problem|issue|condition|complaint)/i,
    /(fever|temperature|hot|cold|chill)/i,
    /(cough|sneeze|congestion|runny nose|stuffy nose)/i,
    /(headache|migraine|head pain)/i,
    /(nausea|vomit|throw up|sick to stomach)/i,
    /(doctor|hospital|clinic|medical|healthcare|physician)/i,
    /(treatment|medicine|drug|medication|pill|tablet)/i,
    /(disease|illness|sickness|infection|disorder|syndrome)/i,
    /(skin|rash|redness|itching|swelling|inflammation)/i,
    /(heart|chest|lung|breath|breathe|respiratory)/i,
    /(stomach|abdominal|belly|digest|indigestion)/i,
    /(eye|vision|see|look|blur|red eye)/i,
    /(ear|hear|sound|noise|ringing|earache)/i,
    /(nose|smell|sneeze|nasal|sinus)/i,
    /(throat|swallow|voice|hoarse|sore throat)/i,
    /(bone|joint|muscle|back|neck|shoulder|knee)/i,
    /(blood|bleed|vein|artery|anemia|clot)/i,
    /(brain|nerve|mental|mind|anxiety|depression)/i,
    /(pregnant|baby|birth|period|menstrual|pregnancy)/i,
    /(allergy|react|sensitive|sneezing|itching)/i,
    /(diabetes|sugar|blood glucose|insulin)/i,
    /(pressure|hypertension|bp|blood pressure)/i,
    /(cancer|tumor|growth|lump|malignant)/i,
    /(toenail|nail|finger|foot|hand|arm|leg)/i,
    /(inflammation|infection|bacterial|viral|germ)/i,
    /(dizziness|vertigo|faint|lightheaded)/i,
    /(diarrhea|constipation|bowel|stool|poop)/i,
    /(tired|fatigue|weak|exhausted|lethargic)/i,
    /(sleep|insomnia|awake|night|dream)/i,
    /(weight|loss|gain|obese|overweight|diet)/i,
    /(urine|bladder|kidney|pee|urinary)/i,
    /(allergy|sneezing|runny nose|itchy eyes)/i,
    /(vaccine|immunization|shot|injection)/i,
    /(test|scan|x-ray|mri|ultrasound|diagnosis)/i,
    /(prescription|dosage|mg|milligram)/i,
    /(emergency|urgent|911|ambulance|er)/i,

    // Arabic Medical Keywords
    /(ألم|وجع|مؤلم|مؤلمة|آلام)/i,
    /(حمى|سخونة|حرارة|ارتفاع حرارة)/i,
    /(صداع|رأس|مخ|دماغ|شقيقة)/i,
    /(سعال|كحة|بلغم|سعال جاف)/i,
    /(غثيان|قيء|ترجيع|استفراغ)/i,
    /(طبيب|مستشفى|عيادة|مستوصف|صيدلية)/i,
    /(علاج|دواء|طب|دواء|حبوب)/i,
    /(مرض|اعتلال|عدوى|مرضي|سقم)/i,
    /(جلد|طفح|احمرار|حكة|تورم)/i,
    /(قلب|صدر|تنفس|رئة|نفس)/i,
    /(معدة|بطن|هضم|قولون|مغص)/i,
    /(عين|نظر|رؤية|زغللة|احمرار)/i,
    /(أذن|سمع|طنين|ألم أذن|صمم)/i,
    /(أنف|شم|عطس|احتقان|زكام)/i,
    /(حلق|بلع|صوت|بحة|التهاب)/i,
    /(عظم|مفصل|ظهر|رقبة|ركبة)/i,
    /(دم|نزيف|وريد|شريان|فقر دم)/i,
    /(دماغ|عصب|نفسي|قلق|اكتئاب)/i,
    /(حمل|طفل|ولادة|دورة|حائض)/i,
    /(حساسية|تأثير|تحسس|عطاس|حكة)/i,
    /(سكري|سكر|جلوكوز|أنسولين)/i,
    /(ضغط|دم|ارتفاع|انخفاض|ضغط دم)/i,
    /(سرطان|ورم|نمو|كتلة|خبيث)/i,
    /(إصبع|قدم|يد|ظفر|كاحل)/i,
    /(التهاب|انتان|جرثومة|بكتيريا|فيروس)/i,
    /(دوخة|دوار|إغماء|عدم اتزان)/i,
    /(إسهال|إمساك|بطن|تبرز|براز)/i,
    /(تعب|إرهاق|ضعف|خمول|نعاس)/i,
    /(نوم|أرق|استيقاظ|ليلة|حلم)/i,
    /(وزن|خسارة|زيادة|سمنة|نحافة)/i,
    /(بول|مثانة|كلية|تبول|مسالك)/i,
    /(لقاح|تطعيم|إبرة|حقنة)/i,
    /(فحص|اشعة|رنين|سونار|تشخيص)/i,
    /(روشتة|جرعة|ملجم|مليجرام)/i,
    /(طوارئ|عاجل|اسعاف|مستعجل)/i,

    // Common symptom patterns
    /(I have|I feel|I'm feeling|I've got)/i,
    /(أعاني من|أشعر|لدي|عندي)/i,
    /(what should I do|what can I take|how to treat)/i,
    /(ماذا أفعل|ماذا آخذ|كيف أعالج)/i,
    /(is this serious|should I worry|when to see doctor)/i,
    /(هل هذا خطير|هل يجب أن أقلق|متى أرى الطبيب)/i
  ];

  // Question pattern detection
  const questionPatterns = [
    /\?/,
    /(what|how|when|where|why|should|can|could).*\?/i,
    /(ماذا|كيف|متى|أين|لماذا|هل).*\?/i
  ];

  const hasMedicalKeywords = medicalPatterns.some(pattern => pattern.test(cleanedText));
  const isQuestion = questionPatterns.some(pattern => pattern.test(cleanedText));

  const hasSymptomDescription = (
    cleanedText.includes('have') ||
    cleanedText.includes('feel') ||
    cleanedText.includes('أعاني') ||
    cleanedText.includes('أشعر') ||
    cleanedText.includes('لدي')
  ) && (
      cleanedText.includes('pain') ||
      cleanedText.includes('ache') ||
      cleanedText.includes('fever') ||
      cleanedText.includes('headache') ||
      cleanedText.includes('ألم') ||
      cleanedText.includes('حمى') ||
      cleanedText.includes('صداع')
    );

  // Body part mentions
  const bodyParts = [
    'head', 'stomach', 'chest', 'back', 'throat', 'ear', 'eye', 'nose',
    'رأس', 'بطن', 'صدر', 'ظهر', 'حلق', 'أذن', 'عين', 'أنف'
  ];
  const hasBodyPart = bodyParts.some(part => cleanedText.includes(part));

  return (
    hasMedicalKeywords ||
    hasSymptomDescription ||
    (isQuestion && hasBodyPart) ||
    (isQuestion && cleanedText.length > 10) ||
    hasBodyPart
  );
};