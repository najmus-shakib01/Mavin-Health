import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import useApiCommunication from "./useApiCommunication";
import useEmergencyDetection from "./useEmergencyDetection";
import useMedicalValidation from "./useMedicalValidation";

const useMedicalAssistant = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const responseDivRef = useRef(null);
  const { isEnglish, isArabic } = useLanguage();
  const queryClient = useQueryClient();

  const { detectEmergency } = useEmergencyDetection();
  const { isMedicalQuestion } = useMedicalValidation();

  const { sendMessageMutation } = useApiCommunication(setResponse, responseDivRef);

  const verifyLanguage = useCallback((text) => {
    const hasEnglish = /[a-zA-Z]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);

    if (isEnglish && hasArabic) {
      return {
        valid: false,
        message: "<span style='color:red'>Please ask your question in English. You selected English language.</span>"
      };
    }

    if (isArabic && hasEnglish) {
      return {
        valid: false,
        message: "<span style='color:red'>يرجى طرح سؤالك باللغة العربية. لقد حددت اللغة العربية.</span>"
      };
    }

    if (!hasEnglish && !hasArabic) {
      return {
        valid: false,
        message: isEnglish
          ? "<span style='color:red'>I only accept questions in English. Please ask in English.</span>"
          : "<span style='color:red'>أقبل الأسئلة باللغة العربية فقط. يرجى السؤال باللغة العربية.</span>"
      };
    }

    return { valid: true };
  }, [isEnglish, isArabic]);

  const handleSendMessage = useCallback(() => {
    if (!userInput.trim()) {
      setResponse(isEnglish
        ? "Please describe your symptoms."
        : "يرجى وصف الأعراض الخاصة بك.");
      return;
    }

    const cachedResponse = queryClient.getQueryData(['medicalResponse', userInput]);
    if (cachedResponse) {
      setResponse(cachedResponse);
      setUserInput("");
      return;
    }

    const languageVerification = verifyLanguage(userInput);
    if (!languageVerification.valid) {
      setResponse(languageVerification.message);
      return;
    }

    if (detectEmergency(userInput)) {
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

      setResponse(emergencyResponse);
      setUserInput("");
      return;
    }

    if (!isMedicalQuestion(userInput)) {
      setResponse(isEnglish
        ? "I specialize only in medical diagnosis and disease detection queries. Please ask about health symptoms or medical conditions."
        : "أتخصص فقط في استفسارات التشخيص الطبي واكتشاف الأمراض. يرجى السؤال عن أعراض الصحية أو الحالات الطبية."
      );
      setUserInput("");
      return;
    }

    const inputToSend = userInput;
    setUserInput("");
    sendMessageMutation.mutate(inputToSend);
  }, [userInput, verifyLanguage, detectEmergency, isMedicalQuestion, sendMessageMutation, isEnglish, queryClient]);

  return { userInput, setUserInput, response, responseDivRef, sendMessageMutation, handleSendMessage };
};

export default useMedicalAssistant;