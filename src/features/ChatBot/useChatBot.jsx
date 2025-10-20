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
  const [copiedMessageId] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

  const { isEnglish, changeLanguage, language, isArabic } = useLanguage();
  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo } = useSession();

  const streamHandler = useStreamHandler(setMessages, isArabic);
  const { validateMedicalQuestion } = useApiMedicalValidation();

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
    return userInfo.age && userInfo.gender && userInfo.duration;
  }, [userInfo]);

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

    const languageSpecificPrompt = language === 'english'
      ? `${cornerCases}\n\nPatient Context: Age: ${userInfo.age}, Gender: ${userInfo.gender}, Duration: ${userInfo.duration}, Symptoms: ${userInfo.symptoms}. Please respond in English only and include SPECIALIST_RECOMMENDATION: [specialist name] in your response.`
      : `${cornerCases}\n\nسياق المريض: العمر: ${userInfo.age}, الجنس: ${userInfo.gender}, المدة: ${userInfo.duration}, الأعراض: ${userInfo.symptoms}. يرجى الرد باللغة العربية فقط وتضمين SPECIALIST_RECOMMENDATION : [specialist name] في ردك.`;

    return languageSpecificPrompt;
  }, [userInfo, isEnglish, language, hasRequiredInfo, getMissingInfo, extractUserInfoFromMessage, updateUserInfo]);

  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      if (sessionLimitReached) {
        throw new Error("Session limit reached");
      }

      const isMedical = await validateMedicalQuestion(inputText);

      if (!isMedical) {
        throw new Error("NON_MEDICAL_QUESTION");
      }

      const systemPrompt = generateSystemPrompt(inputText);

      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-24b-instruct-2501:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: inputText },
          ],
          temperature: 0,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        stream: response.body,
        language: language
      };
    },
    onSuccess: (data) => {
      incrementMessageCount();
      streamHandler.processStream(data);
    },
    onError: (error) => {
      if (error.message === "NON_MEDICAL_QUESTION") {
        const nonMedicalMessage = isEnglish
          ? "Sorry, I don't answer non-medical questions. You can only share medical-related questions with me."
          : "عذرًا، لا أجيب على الأسئلة غير الطبية. يمكنك فقط مشاركة الأسئلة المتعلقة بالطب معي.";

        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: nonMedicalMessage, sender: "bot", timestamp: new Date().toLocaleTimeString() }
        ]);
      } else {
        const errorMessage = isArabic
          ? `<span style="color:red">خطأ : ${error.message}</span>`
          : `<span style="color:red">Error : ${error.message}</span>`;

        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: errorMessage, sender: "bot", timestamp: new Date().toLocaleTimeString() }
        ]);
      }
    },
  });

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || sessionLimitReached) return;

    const languageVerification = verifyLanguage(inputText, isEnglish, isArabic);
    if (!languageVerification.valid) {
      const newMessages = [
        { id: Date.now(), text: inputText, sender: "user", timestamp: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, text: languageVerification.message, sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ];

      setMessages(prev => [...prev, ...newMessages]);
      setInputText("");
      return;
    }

    if (detectEmergency(inputText)) {
      const emergencyResponse = isEnglish
        ? `
            <span style="color:red; font-weight:bold;">
              ⚠️ EMERGENCY ALERT! You may be experiencing a serious medical condition. 
              ➡️ Please go to the nearest hospital immediately or call emergency services.
              📞 Call your local emergency number (e.g., 999 in Bangladesh, 911 in USA, 112 in EU).  
              🏥 Use Google Maps to search for "nearest hospital" if needed.
            </span>
          `
        : `
            <span style="color:red; font-weight:bold;">
              ⚠️ تنبيه طوارئ! قد تكون تعاني من حالة طبية خطيرة.
              ➡️ يرجى التوجه إلى أقرب مستشفى فورًا أو الاتصال بخدمات الطوارئ.
              📞 اتصل برقم الطوارئ المحلي (مثل 999 في بنغلاديش، 911 في الولايات المتحدة، 112 في الاتحاد الأوروبي).
              🏥 استخدم خرائط Google للبحث عن "أقرب مستشفى" إذا لزم الأمر.
            </span>
          `;

      const newMessages = [
        { id: Date.now(), text: inputText, sender: "user", timestamp: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, text: emergencyResponse, sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ];

      setMessages(prev => [...prev, ...newMessages]);
      setShowEmergencyAlert(true);

      setTimeout(() => {
        setShowEmergencyAlert(false);
      }, 10000);

      setInputText("");
      return;
    }

    const newUserMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    const loadingMessage = {
      id: Date.now() + 1,
      text: isEnglish
        ? "🔄 Validating your question..."
        : "🔄 جاري التحقق من سؤالك...",
      sender: "bot",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, loadingMessage]);

    sendMessageMutation.mutate(inputText, {
      onSuccess: () => {
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      },
      onError: () => {
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      }
    });

    setInputText("");
  }, [inputText, isEnglish, isArabic, sendMessageMutation, sessionLimitReached]);

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

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const closeEmergencyAlert = useCallback(() => {
    setShowEmergencyAlert(false);
  }, []);

  return {
    messages, inputText, setInputText, copiedMessageId, isVoiceModalOpen, setIsVoiceModalOpen, isFullscreen, setIsFullscreen, showEmergencyAlert, setShowEmergencyAlert, closeEmergencyAlert, language, changeLanguage, isEnglish, startNewConversation, handleSendMessage, handleVoiceTextConverted, autoResizeTextarea, toggleFullscreen, sendMessageMutation, userInfo
  };
};