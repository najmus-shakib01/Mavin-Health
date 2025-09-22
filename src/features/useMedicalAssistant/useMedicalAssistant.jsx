import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import useApiCommunication from "./useApiCommunication";
import useEmergencyDetection from "./useEmergencyDetection";
import useMedicalValidation from "./useMedicalValidation";

const useMedicalAssistant = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const responseDivRef = useRef(null);
  const { isEnglish, isArabic } = useLanguage();

  const { detectEmergency } = useEmergencyDetection();
  const { isMedicalQuestion } = useMedicalValidation();

  const { sendMessageMutation } = useApiCommunication(
    setResponse,
    responseDivRef,
    conversationHistory,
    setConversationHistory
  );

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

  const handleSendMessage = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    // Minimum 2 seconds between requests to prevent rate limiting
    if (timeSinceLastRequest < 2000) {
      const waitMessage = isEnglish
        ? `<span style='color:orange'>⏳ Please wait ${Math.ceil((2000 - timeSinceLastRequest) / 1000)} seconds before sending another request.</span>`
        : `<span style='color:orange'>⏳ يرجى الانتظار ${Math.ceil((2000 - timeSinceLastRequest) / 1000)} ثوانٍ قبل إرسال طلب آخر.</span>`;
      
      setResponse(waitMessage);
      return;
    }

    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastRequestTime(now);
    const userMessage = userInput.trim();
    setUserInput("");

    const newUserMessage = {
      sender: "user",
      text: userMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setConversationHistory(prev => [...prev, newUserMessage]);

    const languageVerification = verifyLanguage(userMessage);
    if (!languageVerification.valid) {
      setResponse(languageVerification.message);

      const errorMessage = {
        sender: "assistant",
        text: languageVerification.message,
        timestamp: new Date().toLocaleTimeString()
      };

      setConversationHistory(prev => [...prev, errorMessage]);
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

      const emergencyMessage = {
        sender: "assistant",
        text: emergencyResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setConversationHistory(prev => [...prev, emergencyMessage]);
      setIsProcessing(false);
      return;
    }

    if (!isMedicalQuestion(userMessage)) {
      const errorResponse = isEnglish
        ? "I specialize only in medical diagnosis and disease detection queries. Please ask about health symptoms or medical conditions."
        : "أتخصص فقط في استفسارات التشخيص الطبي واكتشاف الأمراض. يرجى السؤال عن أعراض الصحية أو الحالات الطبية.";

      setResponse(errorResponse);

      const errorMessage = {
        sender: "assistant",
        text: errorResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setConversationHistory(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      return;
    }

    try {
      setResponse(isEnglish
        ? "🔄 Analyzing your symptoms..."
        : "🔄 جاري تحليل الأعراض..."
      );

      await sendMessageMutation.mutateAsync(userMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [userInput, isProcessing, verifyLanguage, detectEmergency, isMedicalQuestion, sendMessageMutation, isEnglish, lastRequestTime]);

  const startNewConversation = useCallback(() => {
    setConversationHistory([]);
    setResponse("");
    setUserInput("");
    setLastRequestTime(0);
  }, []);

  return { userInput, setUserInput, response, responseDivRef, isProcessing, handleSendMessage, conversationHistory, startNewConversation, lastRequestTime };
};

export default useMedicalAssistant;