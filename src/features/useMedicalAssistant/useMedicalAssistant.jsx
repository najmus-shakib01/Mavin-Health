import { useCallback, useRef, useState } from "react";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import useApiCommunication from "./useApiCommunication";
import useApiMedicalValidation from "./useApiMedicalValidation";
import useEmergencyDetection from "./useEmergencyDetection";

const useMedicalAssistant = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const responseDivRef = useRef(null);
  const { isEnglish, isArabic } = useLanguage();

  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo } = useSession();
  const { detectEmergency } = useEmergencyDetection();
  const { validateMedicalQuestion } = useApiMedicalValidation();
  const { sendMessageMutation } = useApiCommunication(setResponse, responseDivRef);

  const autoResizeTextarea = useCallback((textareaRef) => {
    textareaRef?.current && (textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`);
  }, []);

  const extractUserInfoFromMessage = useCallback((message) => {
    const ageMatch = message.match(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/i);
    const genderMatch = message.match(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة)/i);
    const durationMatch = message.match(/(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/i);

    return {
      age: ageMatch?.[1] || '',
      gender: genderMatch?.[1]?.toLowerCase() || '',
      duration: durationMatch?.[0] || '',
      symptoms: extractSymptoms(message)
    };
  }, []);

  const extractSymptoms = (message) => {
    if (message.length > 10) {
      return message
        .replace(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/gi, '')
        .replace(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة)/gi, '')
        .replace(/(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return '';
  };

  const hasRequiredInfo = useCallback(() =>
    userInfo?.age && userInfo?.gender && userInfo?.duration
    , [userInfo]);

  const getMissingInfo = useCallback(() => {
    const missing = [];
    if (!userInfo?.age) missing.push(isEnglish ? 'age' : 'العمر');
    if (!userInfo?.gender) missing.push(isEnglish ? 'gender' : 'الجنس');
    if (!userInfo?.duration) missing.push(isEnglish ? 'how long you\'ve been having this problem' : 'المدة التي تعاني منها من هذه المشكلة');
    return missing;
  }, [userInfo, isEnglish]);

  const generateSystemPrompt = useCallback((userMessage) => {
    const extractedInfo = extractUserInfoFromMessage(userMessage);
    const hasNewInfo = extractedInfo.age || extractedInfo.gender || extractedInfo.duration || extractedInfo.symptoms;

    if (hasNewInfo) updateUserInfo(extractedInfo);

    const currentHasRequiredInfo = hasRequiredInfo();
    const missingInfo = getMissingInfo();

    if (!currentHasRequiredInfo) return generateMissingInfoPrompt(missingInfo, isEnglish);
    if (currentHasRequiredInfo && (!extractedInfo.symptoms || extractedInfo.symptoms.length < 10)) {
      return isEnglish
        ? "The user has provided age, gender, and duration. Now ask them to share their symptoms in detail."
        : "قدم المستخدم العمر والجنس والمدة. الآن اطلب منهم مشاركة أعراضهم بالتفصيل.";
    }

    return generateMedicalPrompt(userInfo, isEnglish);
  }, [userInfo, isEnglish, hasRequiredInfo, getMissingInfo, extractUserInfoFromMessage, updateUserInfo]);

  const generateMissingInfoPrompt = (missingInfo, isEnglish) => {
    if (missingInfo.length === 3) {
      return isEnglish
        ? "Ask for age, gender, and duration before providing medical advice."
        : "اطلب العمر والجنس والمدة قبل تقديم النصيحة الطبية.";
    }
    const missingText = missingInfo.join(isEnglish ? ' and ' : ' و ');
    return isEnglish
      ? `Ask specifically for: ${missingText}`
      : `اطلب بشكل محدد: ${missingText}`;
  };

  const generateMedicalPrompt = (userInfo, isEnglish) => {
    const context = `Age: ${userInfo?.age || 'not provided'}, Gender: ${userInfo?.gender || 'not provided'}, Duration: ${userInfo?.duration || 'not provided'}, Symptoms: ${userInfo?.symptoms || 'not provided'}`;
    return isEnglish
      ? `${cornerCases}\n\nPatient Context: ${context}. Respond in English with SPECIALIST_RECOMMENDATION.`
      : `${cornerCases}\n\nسياق المريض: ${context}. الرد بالعربية مع SPECIALIST_RECOMMENDATION.`;
  };

  const verifyLanguage = useCallback((text) => {
    if (!text) return { valid: false, message: isEnglish ? "<span style='color:red'>Please enter a question.</span>" : "<span style='color:red'>يرجى إدخال سؤال.</span>" };

    const hasEnglish = /[a-zA-Z]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);

    if (isEnglish && hasArabic) return { valid: false, message: "<span style='color:red'>Please ask in English.</span>" };
    if (isArabic && hasEnglish) return { valid: false, message: "<span style='color:red'>يرجى السؤال بالعربية.</span>" };
    if (!hasEnglish && !hasArabic) return { valid: false, message: isEnglish ? "<span style='color:red'>I only accept questions in English or Arabic.</span>" : "<span style='color:red'>أقبل الأسئلة بالإنجليزية أو العربية فقط.</span>" };

    return { valid: true };
  }, [isEnglish, isArabic]);

  const handleSendMessage = useCallback(async () => {
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      setResponse(isEnglish ? "<span style='color:orange'>⏳ Please wait a moment...</span>" : "<span style='color:orange'>⏳ يرجى الانتظار لحظة...</span>");
      return;
    }

    if (!userInput?.trim() || isProcessing || sessionLimitReached) return;

    setIsProcessing(true);
    setLastRequestTime(now);
    const userMessage = userInput.trim();
    setUserInput("");

    const languageVerification = verifyLanguage(userMessage);
    if (!languageVerification.valid) {
      setResponse(languageVerification.message);
      setIsProcessing(false);
      return;
    }

    if (detectEmergency(userMessage)) {
      setResponse(generateEmergencyResponse(isEnglish));
      setIsProcessing(false);
      return;
    }

    try {
      const isMedical = await validateMedicalQuestion(userMessage);
      if (!isMedical) {
        setResponse(isEnglish ? "Sorry, I don't answer non-medical questions. You can only share medical-related questions with me." : "عذرًا، لا أجيب على التكاليف غير الطبية. يمكنك فقط مشاركة التكاليف الطبية معي.");
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error("Medical validation error:", error);
    }

    try {
      setResponse(isEnglish ? "🔄 Processing your request..." : "🔄 جاري معالجة طلبك...");
      incrementMessageCount();

      const systemPrompt = generateSystemPrompt(userMessage);
      await sendMessageMutation.mutateAsync({ userMessage, systemPrompt });
    } catch (error) {
      setResponse(generateErrorMessage(error, isEnglish));
    } finally {
      setIsProcessing(false);
    }
  }, [userInput, isProcessing, verifyLanguage, detectEmergency, sendMessageMutation, isEnglish, lastRequestTime, sessionLimitReached, incrementMessageCount, generateSystemPrompt, validateMedicalQuestion]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const startNewConversation = useCallback(() => {
    setResponse("");
    setUserInput("");
    setLastRequestTime(0);
    resetSession();
  }, [resetSession]);

  return {
    userInput: userInput || "", setUserInput, response: response || "", responseDivRef, isProcessing,
    handleSendMessage, handleKeyDown, autoResizeTextarea, startNewConversation, userInfo: userInfo || {}
  };
};

const generateEmergencyResponse = (isEnglish) => isEnglish
  ? `<span style="color:red; font-weight:bold;">⚠️ EMERGENCY ALERT! Please go to the nearest hospital immediately.</span>`
  : `<span style="color:red; font-weight:bold;">⚠️ تنبيه طوارئ! يرجى التوجه إلى أقرب مستشفى فورًا.</span>`;

const generateErrorMessage = (error, isEnglish) => {
  if (error.message.includes('429')) return isEnglish
    ? "<span style='color:orange'>⚠️ Too many requests. Please wait and try again.</span>"
    : "<span style='color:orange'>⚠️ عدد الطلبات كبير. يرجى الانتظار والمحاولة مرة أخرى.</span>";

  return isEnglish
    ? `<span style="color:red">Error: ${error.message}</span>`
    : `<span style="color:red">خطأ: ${error.message}</span>`;
};

export default useMedicalAssistant;