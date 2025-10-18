import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import { detectEmergency, isMedicalQuestion, verifyLanguage } from "./MessageUtils";
import { useStreamHandler } from "./useStreamHandler";

export const useChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [hasAskedForInfo, setHasAskedForInfo] = useState(false);

  const { isEnglish, changeLanguage, language, isArabic } = useLanguage();
  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo, hasBasicInfo } = useSession();

  const streamHandler = useStreamHandler(setMessages, isArabic);

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

  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      if (sessionLimitReached) {
        throw new Error("Session limit reached");
      }

      const languageSpecificPrompt = language === 'english'
        ? `${cornerCases}\n\nPatient Context: ${userInfo.age ? `Age: ${userInfo.age}` : 'Age not provided'}, ${userInfo.gender ? `Gender: ${userInfo.gender}` : 'Gender not provided'}, ${userInfo.symptoms ? `Symptoms: ${userInfo.symptoms}` : 'Symptoms not provided'}. Please respond in English only and include SPECIALTY_RECOMMENDATION : [specialty name] in your response.`
        : `${cornerCases}\n\nسياق المريض: ${userInfo.age ? `العمر: ${userInfo.age}` : 'العمر غير مقدم'}, ${userInfo.gender ? `الجنس: ${userInfo.gender}` : 'الجنس غير مقدم'}, ${userInfo.symptoms ? `الأعراض: ${userInfo.symptoms}` : 'الأعراض غير مقدم'}. يرجى الرد باللغة العربية فقط وتضمين SPECIALTY_RECOMMENDATION : [specialty name] في ردك.`;

      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-24b-instruct-2501:free",
          messages: [
            { role: "system", content: languageSpecificPrompt },
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
      const errorMessage = isArabic
        ? `<span style="color:red">خطأ : ${error.message}</span>`
        : `<span style="color:red">Error : ${error.message}</span>`;

      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: errorMessage, sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ]);
    },
  });

  const handleSendMessage = useCallback(() => {
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

    if (!isMedicalQuestion(inputText)) {
      const validationResponse = isEnglish
        ? "I specialize only in medical diagnosis and disease detection queries. Please ask about health symptoms or medical conditions."
        : "أتخصص فقط في استفسارات التشخيص الطبي واكتشاف الأمراض. يرجى السؤال عن أعراض الصحية أو الحالات الطبية.";

      const newMessages = [
        { id: Date.now(), text: inputText, sender: "user", timestamp: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, text: validationResponse, sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ];

      setMessages(prev => [...prev, ...newMessages]);
      setInputText("");
      return;
    }

    const extractedInfo = extractUserInfoFromMessage(inputText);
    const hasNewInfo = extractedInfo.age || extractedInfo.gender || extractedInfo.symptoms;

    if (hasNewInfo) {
      updateUserInfo(extractedInfo);
    }

    const currentHasBasicInfo = hasBasicInfo();

    if (!currentHasBasicInfo && !hasAskedForInfo) {
      const infoPrompt = isEnglish
        ? "To provide you with the most accurate medical analysis, could you please share your age, gender, and main symptoms? For example: 'I am 25 years old male with headache and fever for 2 days.'"
        : "لتقديم تحليل طبي دقيق، هل يمكنك مشاركة عمرك وجنسك والأعراض الرئيسية؟ على سبيل المثال: 'أنا رجل عمري 25 سنة أعاني من صداع وحمى لمدة يومين.'";

      const newMessages = [
        { id: Date.now(), text: inputText, sender: "user", timestamp: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, text: infoPrompt, sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ];

      setMessages(prev => [...prev, ...newMessages]);
      setHasAskedForInfo(true);
      setInputText("");
      return;
    }

    if (!currentHasBasicInfo && hasAskedForInfo && hasNewInfo) {
      const missingInfoPrompt = isEnglish
        ? "Thank you for the information. I notice some details are still missing, but I'll analyze your symptoms based on what you've provided. For more accurate results, please include your age, gender, and specific symptoms."
        : "شكرًا لك على المعلومات. ألاحظ أن بعض التفاصيل لا تزال مفقودة، لكنني سأحلل أعراضك بناءً على ما قدمته. للحصول على نتائج أكثر دقة، يرجى تضمين عمرك وجنسك وأعراضك المحددة.";

      const newMessages = [
        { id: Date.now(), text: inputText, sender: "user", timestamp: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, text: missingInfoPrompt, sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ];

      setMessages(prev => [...prev, ...newMessages]);
      setInputText("");

      sendMessageMutation.mutate(inputText);
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
        ? "🔄 Analyzing your symptoms..."
        : "🔄 جاري تحليل الأعراض...",
      sender: "bot",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, loadingMessage]);

    sendMessageMutation.mutate(inputText, {
      onSuccess: () => {
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      }
    });

    setInputText("");
  }, [inputText, isEnglish, isArabic, sendMessageMutation, sessionLimitReached, hasBasicInfo, hasAskedForInfo, extractUserInfoFromMessage, updateUserInfo]);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setInputText("");
    setHasAskedForInfo(false);
    resetSession();
  }, [resetSession]);

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text.replace(/<[^>]+>/g, " ")).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 1500);
    });
  }, []);

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
    messages, inputText, setInputText, copiedMessageId, isVoiceModalOpen, setIsVoiceModalOpen, isFullscreen, setIsFullscreen, showEmergencyAlert, setShowEmergencyAlert, closeEmergencyAlert, language, changeLanguage, isEnglish, startNewConversation, handleSendMessage, handleCopy, handleVoiceTextConverted, autoResizeTextarea, toggleFullscreen, sendMessageMutation
  };
};