import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";
import { detectEmergency, isMedicalQuestion, verifyLanguage } from "./MessageUtils";
import { useStreamHandler } from "./useStreamHandler";

export const useChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [userInfo, setUserInfo] = useState({
    age: "",
    gender: "",
    symptoms: ""
  });
  const { isEnglish, changeLanguage, language, isArabic } = useLanguage();

  const userMessageCount = messages.filter(msg => msg.sender === "user").length;
  const sessionLimitReached = userMessageCount >= 15;

  const streamHandler = useStreamHandler(setMessages, isArabic, userInfo);

  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      const languageSpecificPrompt = language === 'english'
        ? `${cornerCases}\n\nIMPORTANT: Include this disclaimer in every response: "⚠️ This AI system may not always be accurate. Do not take its responses as professional medical advice."\n\nPatient Information: Age: ${userInfo.age || 'Not provided'}, Gender: ${userInfo.gender || 'Not provided'}, Symptoms: ${userInfo.symptoms || 'Not provided'}\n\nPlease respond in English only and include SPECIALTY_RECOMMENDATION : [specialty name] in your response.`
        : `${cornerCases}\n\nمهم: قم بتضمين هذا التحذير في كل رد: "⚠️ هذا النظام الذكي قد لا يكون دقيقًا دائمًا. لا تعتمد على ردوده كاستشارة طبية مهنية."\n\nمعلومات المريض: العمر: ${userInfo.age || 'غير مقدم'}, الجنس: ${userInfo.gender || 'غير مقدم'}, الأعراض: ${userInfo.symptoms || 'غير مقدم'}\n\nيرجى الرد باللغة العربية فقط وتضمين SPECIALTY_RECOMMENDATION : [specialty name] في ردك.`;

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

  const checkUserInfoProvided = useCallback(() => {
    return userInfo.age && userInfo.gender;
  }, [userInfo]);

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim() || sessionLimitReached) return;

    if (!checkUserInfoProvided()) {
      const infoMessage = isEnglish
        ? "⚠️ To provide accurate medical advice, please update your patient information (age and gender) first. Click the user icon to update."
        : "⚠️ لتقديم نصائح طبية دقيقة، يرجى تحديث معلومات المريض (العمر والجنس) أولاً. انقر على أيقونة المستخدم للتحديث.";

      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: inputText, sender: "user", timestamp: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, text: infoMessage, sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ]);
      setInputText("");
      return;
    }

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
  }, [inputText, isEnglish, isArabic, sendMessageMutation, sessionLimitReached, checkUserInfoProvided]);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setInputText("");
  }, []);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text.replace(/<[^>]+>/g, " ")).then(() => {});
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

  const updateUserInfo = useCallback((newUserInfo) => {
    setUserInfo(newUserInfo);
  }, []);

  return { messages, inputText, setInputText, isVoiceModalOpen, setIsVoiceModalOpen, isFullscreen, setIsFullscreen, showEmergencyAlert, setShowEmergencyAlert, closeEmergencyAlert, language, changeLanguage, isEnglish, startNewConversation, handleSendMessage, handleCopy, handleVoiceTextConverted, autoResizeTextarea, toggleFullscreen, sendMessageMutation, sessionLimitReached, userInfo, updateUserInfo, userMessageCount
  };
};