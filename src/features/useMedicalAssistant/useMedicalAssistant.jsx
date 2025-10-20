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

  const { sendMessageMutation } = useApiCommunication(
    setResponse,
    responseDivRef,
    [],
    () => { }
  );

  const autoResizeTextarea = useCallback((textareaRef) => {
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const extractUserInfoFromMessage = useCallback((message) => {
    const lowerMessage = message.toLowerCase();

    const ageMatch = message.match(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/i);
    const age = ageMatch ? ageMatch[1] : '';

    let gender = '';
    if (lowerMessage.includes('male') || lowerMessage.includes('man') || lowerMessage.includes('رجل') || lowerMessage.includes('ذكر') || lowerMessage.includes('gentleman') || lowerMessage.includes('boy')) {
      gender = 'male';
    } else if (lowerMessage.includes('female') || lowerMessage.includes('woman') || lowerMessage.includes('أنثى') || lowerMessage.includes('فتاة') || lowerMessage.includes('lady') || lowerMessage.includes('girl')) {
      gender = 'female';
    }

    let duration = '';
    const durationMatch = message.match(/(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/i);
    if (durationMatch) {
      duration = durationMatch[0];
    }

    let symptoms = '';
    if (message.length > 10) {
      symptoms = message
        .replace(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/gi, '')
        .replace(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة|boy|girl)/gi, '')
        .replace(/(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return { age, gender, duration, symptoms };
  }, []);

  const hasRequiredInfo = useCallback(() => {
    return userInfo?.age && userInfo?.gender && userInfo?.duration;
  }, [userInfo]);

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

    if (hasNewInfo) {
      updateUserInfo(extractedInfo);
    }

    const currentHasRequiredInfo = hasRequiredInfo();
    const missingInfo = getMissingInfo();

    if (!currentHasRequiredInfo) {
      if (missingInfo.length === 3) {
        return isEnglish
          ? "The user is asking a medical question but hasn't provided required information. Respond with: 'Please Brother, if you mention these three things — your age, gender, and how long you've been having this problem — then I can help you properly.'"
          : "يطرح المستخدم سؤالاً طبياً لكنه لم يقدم المعلومات المطلوبة. رد بـ: 'من فضلك أخي، إذا ذكرت هذه الأشياء الثلاثة - عمرك، جنسك، والمدة التي تعاني منها من هذه المشكلة - فسأتمكن من مساعدتك بشكل صحيح.'";
      }
      else if (missingInfo.length > 0) {
        const missingText = missingInfo.join(isEnglish ? ' and ' : ' و ');
        return isEnglish
          ? `The user provided some information but is missing: ${missingText}. Respond by asking specifically for: ${missingText}.`
          : `قدم المستخدم بعض المعلومات لكنه يفتقد: ${missingText}. رد بطلب: ${missingText} بشكل محدد.`;
      }
    } else if (currentHasRequiredInfo && (!extractedInfo.symptoms || extractedInfo.symptoms.length < 10)) {
      return isEnglish
        ? "The user has provided age, gender, and duration. Now ask them to share their symptoms in detail. Respond with: 'Thank you brother, now please share your symptoms in detail.'"
        : "قدم المستخدم العمر والجنس والمدة. الآن اطلب منهم مشاركة أعراضهم بالتفصيل. رد بـ: 'شكراً لك أخي، الآن يرجى مشاركة أعراضك بالتفصيل.'";
    }

    const languageSpecificPrompt = isEnglish
      ? `${cornerCases}\n\nPatient Context: Age: ${userInfo?.age || 'not provided'}, Gender: ${userInfo?.gender || 'not provided'}, Duration: ${userInfo?.duration || 'not provided'}, Symptoms: ${userInfo?.symptoms || 'not provided'}. Please respond in English only and include SPECIALIST_RECOMMENDATION: [specialist name] in your response.`
      : `${cornerCases}\n\nسياق المريض: العمر: ${userInfo?.age || 'غير مقدم'}, الجنس: ${userInfo?.gender || 'غير مقدم'}, المدة: ${userInfo?.duration || 'غير مقدم'}, الأعراض: ${userInfo?.symptoms || 'غير مقدم'}. يرجى الرد باللغة العربية فقط وتضمين SPECIALIST_RECOMMENDATION : [specialist name] في ردك.`;

    return languageSpecificPrompt;
  }, [userInfo, isEnglish, hasRequiredInfo, getMissingInfo, extractUserInfoFromMessage, updateUserInfo]);

  const verifyLanguage = useCallback((text) => {
    if (!text) {
      return {
        valid: false,
        message: isEnglish
          ? "<span style='color:red'>Please enter a question.</span>"
          : "<span style='color:red'>يرجى إدخال سؤال.</span>"
      };
    }

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

    try {
      const isMedical = await validateMedicalQuestion(userMessage);

      if (!isMedical) {
        const nonMedicalMessage = isEnglish
          ? "Sorry, I don't answer non-medical questions. You can only share medical-related questions with me."
          : "عذرًا، لا أجيب على الأسئلة غير الطبية. يمكنك فقط مشاركة الأسئلة المتعلقة بالطب معي.";

        setResponse(nonMedicalMessage);
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error("Medical validation error:", error);
    }

    try {
      setResponse(isEnglish
        ? "🔄 Processing your request..."
        : "🔄 جاري معالجة طلبك..."
      );

      incrementMessageCount();

      const systemPrompt = generateSystemPrompt(userMessage);

      await sendMessageMutation.mutateAsync({
        userMessage,
        systemPrompt
      });
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
    userInput, isProcessing, verifyLanguage, detectEmergency,
    sendMessageMutation, isEnglish, lastRequestTime, sessionLimitReached,
    incrementMessageCount, generateSystemPrompt, validateMedicalQuestion
  ]);

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
    userInput: userInput || "", setUserInput, response: response || "", responseDivRef, isProcessing, handleSendMessage, handleKeyDown, autoResizeTextarea, startNewConversation, userInfo: userInfo || {}
  };
};

export default useMedicalAssistant;