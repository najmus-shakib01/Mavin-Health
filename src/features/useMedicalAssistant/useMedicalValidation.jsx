import { useCallback } from "react";

const useMedicalValidation = () => {
    const isMedicalQuestion = useCallback((text) => {
        const lowerText = text.toLowerCase();

        // Medical context patterns 
        const medicalPatterns = [
            /(pain|ache|hurt|discomfort)/i,
            /(symptom|sign|problem|issue)/i,
            /(fever|cough|headache|nausea)/i,
            /(doctor|hospital|clinic|medical)/i,
            /(treatment|medicine|drug|medication)/i,
            /(disease|illness|infection|condition)/i,
            /(toenail|nail|finger|foot|hand)/i,
            /(skin|rash|redness|swelling)/i,
            /(heart|chest|lung|breath)/i,
            /(stomach|abdominal|digest)/i,
            /(eye|vision|see|look)/i,
            /(ear|hear|sound|noise)/i,
            /(nose|smell|sneeze)/i,
            /(throat|swallow|voice)/i,
            /(bone|joint|muscle|back)/i,
            /(blood|bleed|vein|artery)/i,
            /(brain|nerve|mental|mind)/i,
            /(pregnant|baby|birth|period)/i,
            /(allergy|react|sensitive)/i,
            /(diabetes|sugar|blood glucose)/i,
            /(pressure|hypertension|bp)/i,
            /(cancer|tumor|growth)/i,

            // Arabic Patterns 
            /(ألم|وجع|مؤلم)/i,
            /(حمى|سخونة|حرارة)/i,
            /(صداع|رأس|مخ)/i,
            /(سعال|كحة|بلغم)/i,
            /(غثيان|قيء|ترجيع)/i,
            /(طبيب|مستشفى|عيادة)/i,
            /(علاج|دواء|طب)/i,
            /(مرض|اعتلال|عدوى)/i,
            /(جلد|طفح|احمرار)/i,
            /(قلب|صدر|تنفس)/i,
            /(معدة|بطن|هضم)/i,
            /(عين|نظر|رؤية)/i,
            /(أذن|سمع|طنين)/i,
            /(أنف|شم|عطس)/i,
            /(حلق|بلع|صوت)/i,
            /(عظم|مفصل|ظهر)/i,
            /(دم|نزيف|وريد)/i,
            /(دماغ|عصب|نفسي)/i,
            /(حمل|طفل|ولادة)/i,
            /(حساسية|تأثير|تحسس)/i,
            /(سكري|سكر|جلوكوز)/i,
            /(ضغط|دم|ارتفاع)/i,
            /(سرطان|ورم|نمو)/i,
            /(إصبع|قدم|يد|ظفر)/i,
            /(التهاب|انتان|جرثومة)/i,
            /(دوخة|دوار|إغماء)/i,
            /(إسهال|إمساك|بطن)/i,
            /(تعب|إرهاق|ضعف)/i
        ];

        return medicalPatterns.some(pattern => pattern.test(lowerText)) ||
            /[؟?]/.test(text);
    }, []);

    return { isMedicalQuestion };
};

export default useMedicalValidation;