import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import { detectEmergency, verifyLanguage } from "./MessageUtils";
import useApiMedicalValidation from "./useApiMedicalValidation";
import { useStreamHandler } from "./useStreamHandler";

export const useChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

  const { isEnglish, changeLanguage, language, isArabic } = useLanguage();
  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo } = useSession();

  const streamHandler = useStreamHandler(setMessages, isArabic);
  const { validateMedicalQuestion } = useApiMedicalValidation();

  const extractUserInfoFromMessage = useCallback((message) => {
    const ageMatch = message.match(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/i);
    const genderMatch = message.match(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة|boy|girl)/i);
    const durationMatch = message.match(/(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/i);

    return {
      age: ageMatch ? ageMatch[1] : '',
      gender: genderMatch ? genderMatch[1].toLowerCase() : '',
      duration: durationMatch ? durationMatch[0] : '',
      symptoms: extractSymptoms(message)
    };
  }, []);

  const extractSymptoms = (message) => {
    if (message.length > 10) {
      return message
        .replace(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/gi, '')
        .replace(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة|boy|girl)/gi, '')
        .replace(/(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return '';
  };

  const hasRequiredInfo = useCallback(() =>
    userInfo.age && userInfo.gender && userInfo.duration
    , [userInfo]);

  const getMissingInfo = useCallback(() => {
    const missing = [];
    if (!userInfo.age) missing.push(isEnglish ? 'age' : 'العمر');
    if (!userInfo.gender) missing.push(isEnglish ? 'gender' : 'الجنس');
    if (!userInfo.duration) missing.push(isEnglish ? 'how long you\'ve been having this problem' : 'المدة التي تعاني منها من هذه المشكلة');
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
      return generateMissingInfoPrompt(missingInfo, isEnglish);
    }

    if (currentHasRequiredInfo && (!extractedInfo.symptoms || extractedInfo.symptoms.length < 10)) {
      return isEnglish
        ? "The user has provided age, gender, and duration. Now ask them to share their symptoms in detail. Respond with: 'Thank you brother, now please share your symptoms in detail.'"
        : "قدم المستخدم العمر والجنس والمدة. الآن اطلب منهم مشاركة أعراضهم بالتفصيل. رد بـ: 'شكراً لك أخي، الآن يرجى مشاركة أعراضك بالتفصيل.'";
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


  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      if (sessionLimitReached) {
        throw new Error("Session limit reached");
      }

      const isMedical = await validateMedicalQuestion(inputText);
      if (!isMedical) throw new Error("NON_MEDICAL_QUESTION");

      const systemPrompt = generateSystemPrompt(inputText);
      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistralai/mistral-small-24b-instruct-2501:free",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: inputText }],
          temperature: 0, stream: true,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      return { stream: response.body, language: language };
    },
    onSuccess: (data) => {
      streamHandler.processStream(data);
    },
    onError: (error) => handleSendMessageError(error, isEnglish, setMessages),
  });

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || sessionLimitReached) {
      return;
    }

    const languageVerification = verifyLanguage(inputText, isEnglish, isArabic);
    if (!languageVerification.valid) {
      addMessagePair(inputText, languageVerification.message, setMessages);
      setInputText("");
      return;
    }

    if (detectEmergency(inputText)) {
      handleEmergencySituation(inputText, isEnglish, setMessages, setShowEmergencyAlert);
      setInputText("");
      return;
    }

    await processUserMessage(inputText, setMessages, sendMessageMutation, setInputText);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, isEnglish, isArabic, sendMessageMutation, sessionLimitReached]);

  const handleSendMessageError = (error, isEnglish, setMessages) => {
    if (error.message === "NON_MEDICAL_QUESTION") {
      const message = isEnglish
        ? "Sorry, I don't answer non-medical questions. You can only share medical-related questions with me."
        : "عذرًا، لا أجيب على التكاليف غير الطبية. يمكنك فقط مشاركة التكاليف الطبية معي.";

      setMessages(prev => [...prev, createBotMessage(message)]);
    } else {
      const errorMessage = isArabic
        ? `<span style="color:red">خطأ : ${error.message}</span>`
        : `<span style="color:red">Error : ${error.message}</span>`;

      setMessages(prev => [...prev, createBotMessage(errorMessage)]);
    }
  };

  const addMessagePair = (userText, botText, setMessages) => {
    const newMessages = [
      createUserMessage(userText),
      createBotMessage(botText)
    ];
    setMessages(prev => [...prev, ...newMessages]);
  };

  const handleEmergencySituation = (inputText, isEnglish, setMessages, setShowEmergencyAlert) => {
    const emergencyResponse = isEnglish
      ? `<span style="color:red; font-weight:bold;">⚠️ EMERGENCY ALERT! You may be experiencing a serious medical condition. ➡️ Please go to the nearest hospital immediately or call emergency services. 📞 Call your local emergency number. 🏥 Use Google Maps to search for "nearest hospital" if needed.</span>`
      : `<span style="color:red; font-weight:bold;">⚠️ تنبيه طوارئ! قد تكون تعاني من حالة طبية خطيرة. ➡️ يرجى التوجه إلى أقرب مستشفى فورًا أو الاتصال بخدمات الطوارئ. 📞 اتصل برقم الطوارئ المحلي. 🏥 استخدم خرائط Google للبحث عن "أقرب مستشفى" إذا لزم الأمر.</span>`;

    addMessagePair(inputText, emergencyResponse, setMessages);
    setShowEmergencyAlert(true);
    setTimeout(() => setShowEmergencyAlert(false), 10000);
  };

  const processUserMessage = async (inputText, setMessages, sendMessageMutation, setInputText) => {
    const newUserMessage = createUserMessage(inputText);
    setMessages(prev => [...prev, newUserMessage]);

    incrementMessageCount();

    const loadingMessage = createBotMessage(
      isEnglish ? "🔄 Validating your question..." : "🔄 جاري التحقق من سؤالك...",
      true
    );
    setMessages(prev => [...prev, loadingMessage]);

    sendMessageMutation.mutate(inputText, {
      onSuccess: () => setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id)),
      onError: () => setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id))
    });

    setInputText("");
  };

  const createUserMessage = (text) => ({
    id: Date.now(),
    text,
    sender: "user",
    timestamp: new Date().toLocaleTimeString(),
  });

  const createBotMessage = (text, isStreaming = false) => ({
    id: Date.now() + 1,
    text,
    sender: "bot",
    isStreaming,
    timestamp: new Date().toLocaleTimeString(),
  });

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setInputText("");
    resetSession();
  }, [resetSession]);

  const handleVoiceTextConverted = useCallback((text) => {
    setInputText(prevInput => prevInput + (prevInput ? " " + text : text));
    setIsVoiceModalOpen(false);
  }, []);

  const autoResizeTextarea = useCallback((textareaRef) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const toggleFullscreen = useCallback(() => setIsFullscreen(prev => !prev), []);
  const closeEmergencyAlert = useCallback(() => setShowEmergencyAlert(false), []);

  return {
    messages, inputText, setInputText, isVoiceModalOpen, setIsVoiceModalOpen,
    isFullscreen, showEmergencyAlert, closeEmergencyAlert, language,
    changeLanguage, isEnglish, handleSendMessage, handleVoiceTextConverted,
    autoResizeTextarea, toggleFullscreen, sendMessageMutation, startNewConversation, userInfo
  };
};