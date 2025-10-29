import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import { detectEmergency, verifyLanguage } from "../ChatBot/MessageUtils";
import useApiMedicalValidation from "../ChatBot/useApiMedicalValidation";
import { useStreamHandler } from "../ChatBot/useStreamHandler";

const useMedicalAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { isEnglish, isArabic } = useLanguage();
  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo } = useSession();

  const { validateMedicalQuestion } = useApiMedicalValidation();
  const streamHandler = useStreamHandler(setMessages, isArabic);

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

  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      if (sessionLimitReached) throw new Error("Session limit reached");

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

      return { stream: response.body, language: isArabic ? 'arabic' : 'english' };
    },
    onSuccess: (data) => {
      streamHandler.processStream(data);
    },
    onError: (error) => handleSendMessageError(error, isEnglish),
  });

  const handleSendMessageError = (error, isEnglish) => {
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

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || sessionLimitReached || isProcessing) return;

    const languageVerification = verifyLanguage(inputText, isEnglish, isArabic);
    if (!languageVerification.valid) {
      addMessagePair(inputText, languageVerification.message);
      setInputText("");
      return;
    }

    if (detectEmergency(inputText)) {
      handleEmergencySituation(inputText, isEnglish);
      setInputText("");
      return;
    }

    await processUserMessage(inputText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, isEnglish, isArabic, sessionLimitReached, isProcessing]);

  const addMessagePair = (userText, botText) => {
    const newMessages = [
      createUserMessage(userText),
      createBotMessage(botText)
    ];
    setMessages(prev => [...prev, ...newMessages]);
  };

  const handleEmergencySituation = (inputText, isEnglish) => {
    const emergencyResponse = isEnglish
      ? `<span style="color:red; font-weight:bold;">⚠️ EMERGENCY ALERT! You may be experiencing a serious medical condition. ➡️ Please go to the nearest hospital immediately or call emergency services.</span>`
      : `<span style="color:red; font-weight:bold;">⚠️ تنبيه طوارئ! قد تكون تعاني من حالة طبية خطيرة. ➡️ يرجى التوجه إلى أقرب مستشفى فورًا أو الاتصال بخدمات الطوارئ.</span>`;

    addMessagePair(inputText, emergencyResponse);
  };

  const processUserMessage = async (inputText) => {
    const newUserMessage = createUserMessage(inputText);
    setMessages(prev => [...prev, newUserMessage]);

    // Increment message count when user sends a message
    incrementMessageCount();

    setIsProcessing(true);

    const loadingMessage = createBotMessage(
      isEnglish ? "🔄 Processing your request..." : "🔄 جاري معالجة طلبك...",
      true
    );
    setMessages(prev => [...prev, loadingMessage]);

    sendMessageMutation.mutate(inputText, {
      onSettled: () => {
        setIsProcessing(false);
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      }
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

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey && !sessionLimitReached) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage, sessionLimitReached]);

  const autoResizeTextarea = useCallback((textareaRef) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setInputText("");
    resetSession();
  }, [resetSession]);

  return {
    messages,
    inputText,
    setInputText,
    isProcessing,
    handleSendMessage,
    handleKeyDown,
    autoResizeTextarea,
    startNewConversation,
    userInfo: userInfo || {}
  };
};

export { useMedicalAssistant };