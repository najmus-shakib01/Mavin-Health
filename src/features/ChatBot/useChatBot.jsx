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
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isEnglish, changeLanguage, language, isArabic } = useLanguage();

  const streamHandler = useStreamHandler(setMessages, isArabic);

  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      const languageSpecificPrompt = language === 'english'
        ? `${cornerCases}\n\nPlease respond in English only and include SPECIALTY_RECOMMENDATION : [specialty name] in your response.`
        : `${cornerCases}\n\nيرجى الرد باللغة العربية فقط وتضمين SPECIALTY_RECOMMENDATION : [specialty name] في ردك.`;

      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
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
        ? `<span style="color:red">خطأ: ${error.message}</span>`
        : `<span style="color:red">Error: ${error.message}</span>`;

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: errorMessage,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    },
  });

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    const languageVerification = verifyLanguage(inputText, isEnglish, isArabic);
    if (!languageVerification.valid) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: inputText,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: Date.now() + 1,
          text: languageVerification.message,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
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

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: inputText,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: Date.now() + 1,
          text: emergencyResponse,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setInputText("");
      return;
    }

    if (!isMedicalQuestion(inputText)) {
      const validationResponse = isEnglish
        ? "I specialize only in medical diagnosis and disease detection queries. Please ask about health symptoms or medical conditions."
        : "أتخصص فقط في استفسارات التشخيص الطبي واكتشاف الأمراض. يرجى السؤال عن أعراض الصحية أو الحالات الطبية.";

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: inputText,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: Date.now() + 1,
          text: validationResponse,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setInputText("");
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, newMessage]);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        text: isEnglish
          ? "🔄 Analyzing Symptoms With Medical Database..."
          : "🔄 جاري تحليل الأعراض مع قاعدة البيانات الطبية...",
        sender: "bot",
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);

    sendMessageMutation.mutate(inputText);
    setInputText("");
  }, [inputText, isEnglish, isArabic, sendMessageMutation]);

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

  return {
    messages,
    inputText,
    setInputText,
    copiedMessageId,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isFullscreen,
    setIsFullscreen,
    language,
    changeLanguage,
    isEnglish,
    handleSendMessage,
    handleCopy,
    handleVoiceTextConverted,
    autoResizeTextarea,
    toggleFullscreen,
    sendMessageMutation
  };
};