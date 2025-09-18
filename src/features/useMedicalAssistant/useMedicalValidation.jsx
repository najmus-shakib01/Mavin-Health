import { useCallback } from "react";

const useMedicalValidation = () => {
    const isMedicalQuestion = useCallback((text) => {
        const lowerText = text.toLowerCase().trim();
        
        // non medical key word
        const nonMedicalPatterns = [
            /hello|hi|hey|how are you|what's up/i,
            /thanks|thank you|appreciate/i,
            /weather|forecast|temperature/i,
            /sports|game|football|cricket|player/i,
            /movie|film|actor|actress|entertainment/i,
            /politics|government|election|minister/i,
            /joke|funny|humor|comedy/i,
            /food|recipe|cooking|restaurant|cuisine/i,
            /travel|tourist|vacation|holiday|destination/i,
            /music|song|singer|band|concert/i,
            /book|novel|author|literature|reading/i,
            /job|career|employment|interview|salary/i,
            /education|school|college|university|exam/i,
            /price|cost|money|financial|bank|investment/i,
            /news|headline|current affairs|update/i,
            /time|date|day|week|month|year/i,
            /age|old|young|birthday|anniversary/i,
            /hobby|interest|passion|leisure|activity/i,
            /family|friend|relationship|marriage|wedding/i,
            /computer|tech|technology|software|app|website/i,
            /animal|pet|dog|cat|bird|wildlife/i,
            /car|vehicle|bike|transportation|driving/i,
            /shopping|buy|purchase|product|item/i,
            /history|past|ancient|culture|heritage/i,
            /religion|god|prayer|spiritual|faith/i,
            /art|painting|drawing|design|creative/i,
            /fashion|clothing|dress|outfit|style/i,
            /business|company|enterprise|startup|market/i,
            
            // Arabic non-medical patterns
            /مرحبا|اهلا|السلام|كيف حالك/i,
            /شكرا|متشكر|مقدر/i,
            /طقس|جو|حرارة|مناخ/i,
            /رياضة|كرة|مباراة|لاعب/i,
            /فيلم|مسلسل|ممثل|ممثلة|ترفيه/i,
            /سياسة|حكومة|انتخابات|وزير/i,
            /نكتة|ضحك|فكاهة|كوميديا/i,
            /طعام|وصفة|طبخ|مطعم|مطبخ/i,
            /سفر|سياحة|عطلة|وجهة/i,
            /موسيقى|اغنية|مغني|فرقة|حفلة/i,
            /كتاب|رواية|كاتب|ادب|قراءة/i,
            /وظيفة|عمل|توظيف|مقابلة|راتب/i,
            /تعليم|مدرسة|جامعة|كلية|امتحان/i,
            /سعر|تكلفة|مال|مادي|بنك|استثمار/i,
            /اخبار|عنوان|شؤون|تحديث/i,
            /وقت|تاريخ|يوم|اسبوع|شهر|سنة/i,
            /عمر|كبير|صغير|عيد ميلاد|ذكرى/i,
            /هواية|اهتمام|شغف|ترفيه|نشاط/i,
            /عائلة|صديق|علاقة|زواج|عرس/i,
            /كمبيوتر|تكنولوجيا|برنامج|تطبيق|موقع/i,
            /حيوان|اليف|كلب|قطة|طير|حياة برية/i,
            /سيارة|مركبة|دراجة|مواصلات|قيادة/i,
            /تسوق|شراء|منتج|سلعة/i,
            /تاريخ|ماضي|قديم|ثقافة|تراث/i,
            /دين|الله|صلاة|روحاني|ايمان/i,
            /فن|رسم|تصميم|ابداع/i,
            /موضة|ملابس|فساتين|ستايل/i,
            /عمل|شركة|مشروع|سوق/i
        ];

        // non medical question false return
        if (nonMedicalPatterns.some(pattern => pattern.test(lowerText))) {
            return false;
        }

        // Medical context patterns
        const medicalPatterns = [
            /(pain|ache|hurt|discomfort|sore|tender)/i,
            /(symptom|sign|problem|issue|condition|disorder)/i,
            /(fever|cough|headache|nausea|vomit|dizziness)/i,
            /(doctor|hospital|clinic|medical|healthcare|physician)/i,
            /(treatment|medicine|drug|medication|pill|prescription)/i,
            /(disease|illness|infection|sickness|ailment|syndrome)/i,
            /(toenail|nail|finger|foot|hand|limb|joint)/i,
            /(skin|rash|redness|swelling|itch|burn|wound)/i,
            /(heart|chest|lung|breath|respiratory|cardiac)/i,
            /(stomach|abdominal|digest|bowel|intestine|gut)/i,
            /(eye|vision|see|look|retina|pupil|glaucoma)/i,
            /(ear|hear|sound|noise|hearing|tinnitus|earache)/i,
            /(nose|smell|sneeze|sinus|nasal|rhinitis)/i,
            /(throat|swallow|voice|larynx|tonsil|hoarse)/i,
            /(bone|joint|muscle|back|spine|skeletal|fracture)/i,
            /(blood|bleed|vein|artery|clot|anemia|hemoglobin)/i,
            /(brain|nerve|mental|mind|neurological|psychiatric)/i,
            /(pregnant|baby|birth|period|menstrual|ovulation)/i,
            /(allergy|react|sensitive|histamine|anaphylaxis)/i,
            /(diabetes|sugar|blood glucose|insulin|hypoglycemia)/i,
            /(pressure|hypertension|bp|blood pressure|cardiovascular)/i,
            /(cancer|tumor|growth|malignant|benign|oncology)/i,
            /(injury|trauma|accident|fracture|sprain|bruise)/i,
            /(sleep|insomnia|fatigue|tired|exhausted|energy)/i,
            /(weight|diet|nutrition|obese|overweight|bmi)/i,
            /(anxiety|stress|depression|mood|mental health)/i,
            /(vaccine|immunization|shot|injection|needle)/i,
            /(test|scan|x-ray|mri|ultrasound|diagnosis)/i,
            /(surgery|operation|procedure|anesthesia|stitches)/i,
            /(kidney|liver|organ|transplant|dialysis|hepatic)/i,
            /(thyroid|hormone|endocrine|gland|metabolism)/i,
            /(head|neck|shoulder|elbow|wrist|hip|knee|ankle)/i,

            // Arabic Patterns 
            /(ألم|وجع|مؤلم|آلام|يتألم)/i,
            /(عرض|أعراض|علامة|مشكلة|حالة|اضطراب)/i,
            /(حمى|سخونة|حرارة|سعال|كحة|صداع|غثيان|قيء|دوار)/i,
            /(طبيب|مستشفى|عيادة|طبي|صحة|ممرض|جراح)/i,
            /(علاج|دواء|دواء|حبة|وصفة|علاجي)/i,
            /(مرض|اعتلال|عدوى|مرضي|متلازمة|علة)/i,
            /(ظفر|إصبع|قدم|يد|طرف|مفصل)/i,
            /(جلد|طفح|احمرار|تورم|حكة|حرق|جرح)/i,
            /(قلب|صدر|تنفس|رئة|جهاز تنفسي|قلبي)/i,
            /(معدة|بطن|هضم|أمعاء|قولون|مغص)/i,
            /(عين|نظر|رؤية|شبكية|بؤبؤ|زرق)/i,
            /(أذن|سمع|صوت|طنين|ألم أذن|سماعي)/i,
            /(أنف|شم|عطس|جيوب|أنفي|التهاب أنف)/i,
            /(حلق|بلع|صوت|حنجرة|لوز|بحة)/i,
            /(عظم|مفصل|عضلة|ظهر|عمود فقري|هيكلي|كسر)/i,
            /(دم|نزيف|وريد|شريان|جلطة|فقر دم|هيموجلوبين)/i,
            /(دماغ|عصب|نفسي|عقلي| عصبي|طب نفسي)/i,
            /(حمل|طفل|ولادة|دورة|طمث|تبويض)/i,
            /(حساسية|تفاعل|حساس|هيستامين|صدمة تحسسية)/i,
            /(سكري|سكر|جلوكوز|أنسولين|هبوط سكر)/i,
            /(ضغط|ضغط دم|ضغط مرتفع|قلب وعائي)/i,
            /(سرطان|ورم|نمو|خبيث|حميد|أورام)/i,
            /(إصابة|رضح|حادث|كسر|التواء|كدمة)/i,
            /(نوم|أرق|تعب|إرهاق|طاقة|خمول)/i,
            /(وزن|حمية|تغذية|سمنة|زيادة وزن|مؤشر كتلة)/i,
            /(قلق|توتر|اكتئاب|مزاج|صحة نفسية)/i,
            /(لقاح|تطعيم|حقنة|إبرة|تحصين)/i,
            /(فحص|اشعة|أشعة|رنين|موجات|تشخيص)/i,
            /(جراحة|عملية| تخدير|غرز|عملية جراحية)/i,
            /(كلى|كبد|عضو|زرع|غسيل كلوي|كبدي)/i,
            /(غدة|هرمون|غدد صماء|ميتابوليزم)/i,
            /(رأس|رقبة|كتف|كوع|رسغ|ورك|ركبة|كاحل)/i
        ];

        return medicalPatterns.some(pattern => pattern.test(lowerText));
    }, []);

    return { isMedicalQuestion };
};

export default useMedicalValidation;