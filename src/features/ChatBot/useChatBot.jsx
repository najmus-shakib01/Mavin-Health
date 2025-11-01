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
  const [conversationStage, setConversationStage] = useState(1);

  const { isEnglish, changeLanguage, language, isArabic } = useLanguage();
  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo } = useSession();

  const streamHandler = useStreamHandler(setMessages, isArabic);
  const { validateMedicalQuestion } = useApiMedicalValidation();

  const extractUserInfoFromMessage = useCallback((message) => {
    const ageMatch = message.match(/(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/i);
    const genderMatch = message.match(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة)/i);
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
        .replace(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة)/gi, '')
        .replace(/(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return '';
  };

  const generateSystemPrompt = useCallback((userMessage) => {
    const extractedInfo = extractUserInfoFromMessage(userMessage);
    const hasNewInfo = extractedInfo.age || extractedInfo.gender || extractedInfo.duration || extractedInfo.symptoms;

    if (hasNewInfo) {
      updateUserInfo(extractedInfo);
    }

    if (conversationStage === 1) {
      return isEnglish
        ? "The user has shared their initial symptoms. Ask for their age, gender, and problem duration. Respond with: 'Thank you for sharing your symptoms with me. <br><hr><br> To get proper treatment, please provide your **Age**, **Gender**, and **Problem Duration**.'"
        : "المستخدم شارك أعراضه الأولية. اطلب منه العمر والجنس ومدة المشكلة. رد بـ: 'شكراً لمشاركة أعراضك معي. <br><hr><br> للحصول على العلاج المناسب، يرجى تقديم **العمر**، **الجنس**، و**مدة المشكلة**.'";
    } else if (conversationStage === 2) {
      return isEnglish
        ? "The user has provided their basic information. Now ask for detailed symptoms with examples. Respond with: 'Thank you for providing the necessary information. <br><hr><br> Now please share your **symptoms in detail**. For example — if you're talking about fever, you can write: \"I've had a fever for 3 days, initially had a sore throat, now I have body aches. I took paracetamol but it didn't help much.\"'"
        : "المستخدم قدم معلوماته الأساسية. الآن اطلب منه أعراضه التفصيلية مع أمثلة. رد بـ: 'شكراً لتقديم المعلومات الضرورية. <br><hr><br> الآن يرجى مشاركة **أعراضك بالتفصيل**. على سبيل المثال — إذا كنت تتحدث عن الحمى، يمكنك كتابة: \"لدي حمى منذ 3 أيام، في البداية كان لدي التهاب في الحلق، الآن لدي آلام في الجسم. تناولت باراسيتامول لكنه لم يساعد كثيراً.\"'";
    } else if (conversationStage === 3) {
      return generateMedicalPrompt(userInfo, isEnglish);
    }

    return generateMedicalPrompt(userInfo, isEnglish);
  }, [userInfo, isEnglish, extractUserInfoFromMessage, updateUserInfo, conversationStage]);


  const generateMedicalPrompt = (userInfo, isEnglish) => {
    const context = `Age: ${userInfo?.age || 'not provided'}, Gender: ${userInfo?.gender || 'not provided'}, Duration: ${userInfo?.duration || 'not provided'}, Symptoms: ${userInfo?.symptoms || 'not provided'}`;
    return isEnglish
      ? `${cornerCases}\n\nPatient Context: ${context}. Respond in English with SPECIALIST_RECOMMENDATION. Include a final section with two buttons (non-clickable): "You can view our specialist list. Click the button to see the list. 🩺 Specialist List" and "You can book an appointment with a specialist. Click to book. 📅 Appointment Now". These buttons should be displayed after the sources section.`
      : `${cornerCases}\n\nسياق المريض: ${context}. الرد بالعربية مع SPECIALIST_RECOMMENDATION. قم بتضمين قسم نهائي يحتوي على زرين (غير قابلين للنقر): "يمكنك عرض قائمة الأخصائيين لدينا. انقر على الزر لرؤية القائمة. 🩺 قائمة الأخصائيين" و "يمكنك حجز موعد مع أخصائي. انقر للحجز. 📅 حجز موعد الآن". يجب عرض هذه الأزرار بعد قسم المصادر.`;
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
      if (conversationStage === 1) {
        setConversationStage(2);
      } else if (conversationStage === 2) {
        setConversationStage(3);
      }
    },
    onError: (error) => handleSendMessageError(error, isEnglish, setMessages),
  });

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
  }, [inputText, isEnglish, isArabic, sendMessageMutation, sessionLimitReached, conversationStage]);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setInputText("");
    resetSession();
    setConversationStage(1);
  }, [resetSession]);

  const handleVoiceTextConverted = useCallback((text) => {
    setInputText(prevInput => prevInput + (prevInput ? " " : "") + text);
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