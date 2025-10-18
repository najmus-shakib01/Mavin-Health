import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import useApiCommunication from "./useApiCommunication";
import useEmergencyDetection from "./useEmergencyDetection";
import useMedicalValidation from "./useMedicalValidation";

const useMedicalAssistant = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [hasAskedForInfo, setHasAskedForInfo] = useState(false);
  const responseDivRef = useRef(null);
  const { isEnglish, isArabic } = useLanguage();

  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo, hasBasicInfo } = useSession();

  const { detectEmergency } = useEmergencyDetection();
  const { isMedicalQuestion } = useMedicalValidation();

  const { sendMessageMutation } = useApiCommunication(
    setResponse,
    responseDivRef,
    [],
    () => { }
  );

  const autoResizeTextarea = useCallback((textareaRef) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const verifyLanguage = useCallback((text) => {
    const hasEnglish = /[a-zA-Z]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);

    if (isEnglish && hasArabic) {
      return {
        valid: false,
        message: isEnglish
          ? "<span style='color:red'>Please ask your question in English. You selected English language.</span>"
          : "<span style='color:red'>يرجى طرح سؤالك باللغة العربية. لقد حددت اللغة العربية.</span>"
      };
    }

    if (isArabic && hasEnglish) {
      return {
        valid: false,
        message: isEnglish
          ? "<span style='color:red'>Please ask your question in Arabic. You selected Arabic language.</span>"
          : "<span style='color:red'>يرجى طرح سؤالك باللغة الإنجليزية. لقد حددت اللغة الإنجليزية.</span>"
      };
    }

    if (!hasEnglish && !hasArabic) {
      return {
        valid: false,
        message: isEnglish
          ? "<span style='color:red'>I only accept questions in English or Arabic. Please ask in one of these languages.</span>"
          : "<span style='color:red'>أقبل الأسئلة باللغة الإنجليزية أو العربية فقط. يرجى السؤال بإحدى هذه اللغات.</span>"
      };
    }

    return { valid: true };
  }, [isEnglish, isArabic]);

  const extractUserInfoFromMessage = useCallback((message) => {
    const lowerMessage = message.toLowerCase();

    const ageMatch = message.match(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/i);
    const age = ageMatch ? ageMatch[1] : '';

    let gender = '';
    if (lowerMessage.includes('male') || lowerMessage.includes('man') || lowerMessage.includes('رجل') || lowerMessage.includes('ذكر') || lowerMessage.includes('gentleman')) {
      gender = 'male';
    } else if (lowerMessage.includes('female') || lowerMessage.includes('woman') || lowerMessage.includes('أنثى') || lowerMessage.includes('فتاة') || lowerMessage.includes('lady')) {
      gender = 'female';
    }

    let symptoms = '';
    if (message.length > 10) {
      symptoms = message
        .replace(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/gi, '')
        .replace(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return { age, gender, symptoms };
  }, []);

  const handleSendMessage = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < 2000) {
      const waitMessage = isEnglish
        ? `<span style='color:orange'>⏳ Please wait ${Math.ceil((2000 - timeSinceLastRequest) / 1000)} seconds before sending another request.</span>`
        : `<span style='color:orange'>⏳ يرجى الانتظار ${Math.ceil((2000 - timeSinceLastRequest) / 1000)} ثوانٍ قبل إرسال طلب آخر.</span>`;

      setResponse(waitMessage);
      return;
    }

    if (!userInput.trim() || isProcessing || sessionLimitReached) return;

    setIsProcessing(true);
    setLastRequestTime(now);
    const userMessage = userInput.trim();
    setUserInput("");

    const extractedInfo = extractUserInfoFromMessage(userMessage);
    const hasNewInfo = extractedInfo.age || extractedInfo.gender || extractedInfo.symptoms;

    if (hasNewInfo) {
      updateUserInfo(extractedInfo);
    }

    const languageVerification = verifyLanguage(userMessage);
    if (!languageVerification.valid) {
      setResponse(languageVerification.message);
      setIsProcessing(false);
      return;
    }

    if (detectEmergency(userMessage)) {
      const emergencyResponse = isEnglish
        ? `<span style="color:red; font-weight:bold;">
            ⚠️ EMERGENCY ALERT! You may be experiencing a serious medical condition. 
            ➡️ Please go to the nearest hospital immediately or call emergency services.
            📞 Call your local emergency number (e.g., 999 in Bangladesh, 911 in USA, 112 in EU).  
            🏥 Use Google Maps to search for "nearest hospital" if needed.
          </span>`
        : `<span style="color:red; font-weight:bold;">
            ⚠️ تنبيه طوارئ! قد تكون تعاني من حالة طبية خطيرة.
            ➡️ يرجى التوجه إلى أقرب مستشفى فورًا أو الاتصال بخدمات الطوارئ.
            📞 اتصل برقم الطوارئ المحلي (مثل 999 في بنغلاديش، 911 في الولايات المتحدة، 112 في الاتحاد الأوروبي).
            🏥 استخدم خرائط Google للبحث عن "أقرب مستشفى" إذا لزم الأمر.
          </span>`;

      setResponse(emergencyResponse);
      setIsProcessing(false);
      return;
    }

    if (!isMedicalQuestion(userMessage)) {
      const errorResponse = isEnglish
        ? "I specialize only in medical diagnosis and disease detection queries. Please ask about health symptoms or medical conditions."
        : "أتخصص فقط في استفسارات التشخيص الطبي واكتشاف الأمراض. يرجى السؤال عن أعراض الصحية أو الحالات الطبية.";

      setResponse(errorResponse);
      setIsProcessing(false);
      return;
    }

    const currentHasBasicInfo = hasBasicInfo();

    if (!currentHasBasicInfo && !hasAskedForInfo) {
      const infoPrompt = isEnglish
        ? "To provide you with the most accurate medical analysis, could you please share your age, gender, and main symptoms? For example: 'I am 25 years old male with headache and fever for 2 days.'"
        : "لتقديم تحليل طبي دقيق، هل يمكنك مشاركة عمرك وجنسك والأعراض الرئيسية؟ على سبيل المثال: 'أنا رجل عمري 25 سنة أعاني من صداع وحمى لمدة يومين.'";

      setResponse(infoPrompt);
      setHasAskedForInfo(true);
      setIsProcessing(false);
      return;
    }

    if (!currentHasBasicInfo && hasAskedForInfo && hasNewInfo) {
      const missingInfoPrompt = isEnglish
        ? "Thank you for the information. I notice some details are still missing, but I'll analyze your symptoms based on what you've provided. For more accurate results, please include your age, gender, and specific symptoms."
        : "شكرًا لك على المعلومات. ألاحظ أن بعض التفاصيل لا تزال مفقودة، لكنني سأحلل أعراضك بناءً على ما قدمته. للحصول على نتائج أكثر دقة، يرجى تضمين عمرك وجنسك وأعراضك المحددة.";

      setResponse(missingInfoPrompt);
    }

    try {
      setResponse(isEnglish
        ? "🔄 Analyzing your symptoms..."
        : "🔄 جاري تحليل الأعراض..."
      );

      incrementMessageCount();

      await sendMessageMutation.mutateAsync(userMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = isEnglish
        ? `<span style="color:red">Error: ${error.message}</span>`
        : `<span style="color:red">خطأ: ${error.message}</span>`;
      setResponse(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    userInput, isProcessing, verifyLanguage, detectEmergency, isMedicalQuestion,
    sendMessageMutation, isEnglish, lastRequestTime, sessionLimitReached,
    hasBasicInfo, incrementMessageCount, extractUserInfoFromMessage,
    updateUserInfo, hasAskedForInfo
  ]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const startNewConversation = useCallback(() => {
    setResponse(""); setUserInput(""); setLastRequestTime(0); setHasAskedForInfo(false); resetSession();
  }, [resetSession]);

  return { userInput, setUserInput, response, responseDivRef, isProcessing, handleSendMessage, handleKeyDown, autoResizeTextarea, startNewConversation, userInfo };
};

export default useMedicalAssistant;