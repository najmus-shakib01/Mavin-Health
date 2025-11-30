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
  const [isProcessing] = useState(false);
  const [conversationStage, setConversationStage] = useState(1);
  const [lastPromptStage, setLastPromptStage] = useState(1);
  const [apiError, setApiError] = useState(null);
  const [, setLastCondition] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const { isEnglish, isArabic } = useLanguage();
  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo, } = useSession();

  const streamHandler = useStreamHandler(setMessages, isArabic);
  useApiMedicalValidation();

  const extractUserInfoFromMessage = useCallback((message) => {
    const ageMatch = message.match(
      /(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/i
    );
    const genderMatch = message.match(
      /(male|female|man|woman|رجل|أنثى|ذكر|فتاة)/i
    );
    const durationMatch = message.match(
      /(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/i
    );

    return { age: ageMatch ? ageMatch[1] : "", gender: genderMatch ? genderMatch[1].toLowerCase() : "", duration: durationMatch ? durationMatch[0] : "", symptoms: extractSymptoms(message), };
  }, []);

  const extractSymptoms = (message) => {
    if (message.length > 10) {
      return message
        .replace(
          /(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/gi,
          ""
        )
        .replace(/(male|female|man|woman|رجل|أنثى|ذكر|فتاة)/gi, "")
        .replace(
          /(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/gi,
          ""
        )
        .replace(/\s+/g, " ")
        .trim();
    }
    return "";
  };

  const isCarePlanRequest = useCallback((message) => {
    const carePlanKeywords = ["care plan", "guidelines", "routine", "rules", "complete care", "detailed guidelines", "خطة رعاية", "إرشادات", "روتين", "قواعد", "رعاية كاملة", "إرشادات مفصلة",];

    return carePlanKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  const extractMainCondition = (message) => {
    const conditions = {
      diabetes: ["diabetes", "diabetic", "sugar", "glucose", "blood sugar", "type 1", "type 2", "السكري", "السكر", "الجلوكوز",],
      fever: ["fever", "temperature", "hot", "feverish", "حمى", "حرارة", "سخونة",],
      cough: ["cough", "coughing", "سعال", "كحة"],
      headache: ["headache", "head pain", "migraine", "صداع", "ألم في الرأس"],
      "sore throat": ["sore throat", "throat pain", "التهاب الحلق", "ألم في الحلق",],
      "stomach pain": ["stomach pain", "abdominal pain", "belly ache", "stomachache", "ألم في المعدة", "ألم في البطن",],
      "chest pain": ["chest pain", "chest tightness", "ألم في الصدر", "ضيق في الصدر",],
      "back pain": ["back pain", "backache", "ألم في الظهر"],
      "high blood pressure": ["high blood pressure", "hypertension", "ضغط الدم المرتفع", "ارتفاع ضغط الدم",],
      asthma: ["asthma", "wheezing", "breathing difficulty", "ربو", "صفير", "صعوبة في التنفس",],
    };

    const lowerMessage = message.toLowerCase();

    for (const [condition, keywords] of Object.entries(conditions)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return condition;
        }
      }
    }

    return "";
  };

  const generateSystemPrompt = useCallback(
    (userMessage) => {
      const extractedInfo = extractUserInfoFromMessage(userMessage);

      const safeUpdate = {};
      if (extractedInfo.age) safeUpdate.age = extractedInfo.age;
      if (extractedInfo.gender) safeUpdate.gender = extractedInfo.gender;
      if (extractedInfo.duration) safeUpdate.duration = extractedInfo.duration;
      if (extractedInfo.symptoms) safeUpdate.symptoms = extractedInfo.symptoms;

      const mergedUserInfo = {
        ...userInfo,
        ...safeUpdate,
      };

      if (Object.keys(safeUpdate).length > 0) {
        updateUserInfo(safeUpdate);
      }

      const condition = extractMainCondition(userMessage);
      if (condition) setLastCondition(condition);

      const hasAge = !!mergedUserInfo.age;
      const hasGender = !!mergedUserInfo.gender;
      const hasDuration = !!mergedUserInfo.duration;
      const hasAllRequired = hasAge && hasGender && hasDuration;

      let stageForPrompt;

      if (!hasAllRequired) {
        stageForPrompt = 1;
      } else if (conversationStage <= 1) {
        stageForPrompt = 2;
      } else if (conversationStage === 2) {
        stageForPrompt = 3;
      } else {
        stageForPrompt = conversationStage;
      }

      setLastPromptStage(stageForPrompt);

      const context = `Age: ${mergedUserInfo?.age || "not provided"}, Gender: ${mergedUserInfo?.gender || "not provided"
        }, Duration: ${mergedUserInfo?.duration || "not provided"}, Symptoms: ${mergedUserInfo?.symptoms || "not provided"
        }, Condition: ${condition || "not specified"}`;

      if (stageForPrompt === 1) {
        const missingEn = [];
        if (!hasAge) missingEn.push("age");
        if (!hasGender) missingEn.push("gender");
        if (!hasDuration)
          missingEn.push("how long you have had this problem (in days)");

        const missingAr = [];
        if (!hasAge) missingAr.push("العمر");
        if (!hasGender) missingAr.push("الجنس");
        if (!hasDuration)
          missingAr.push("مدة استمرار المشكلة (بعدد الأيام)");

        const joinWithAnd = (items, andWord, separator) => {
          if (items.length === 1) return items[0];
          if (items.length === 2) return `${items[0]} ${andWord} ${items[1]}`;
          return `${items.slice(0, -1).join(separator)} ${andWord} ${items[items.length - 1]
            }`;
        };

        if (isEnglish) {
          const missingText = joinWithAnd(missingEn, "and", ", ");
          return `The user has shared their initial symptoms related to ${condition || "a medical condition"}. Your ONLY goal in this reply is to collect their **${missingText}**.

          Rules:
          - Do NOT ask for detailed symptoms yet.
          - If they provide some of these but not all, politely ask ONLY for the missing ones.
          - Do not give any medical explanation or possible causes yet.

          Reply briefly and kindly. For example:
          "Thank you for sharing that you have ${condition || "this health concern"}. <br><br> To help you better, please tell me your ${missingText}."`;
        }

        const missingTextAr = joinWithAnd(missingAr, "و", "، ");
        return `المستخدم شارك أعراضه الأولية المتعلقة بـ ${condition || "حالة طبية"}. مهمتك الوحيدة في هذا الرد هي جمع **${missingTextAr}**.
        القواعد:
        - لا تطلب وصف الأعراض بالتفصيل بعد.
        - إذا قدّم المستخدم بعض هذه المعلومات فقط، فاطلب بلطف المعلومات الناقصة فقط.
        - لا تقدّم أي تفسير طبي أو تشخيص أو أسباب محتملة في هذه المرحلة.

        اجب بشكل مختصر وواضح، مثلاً:
        "شكرًا لمشاركتك هذه المشكلة الصحية معي. <br><br> لمساعدتك بشكل أفضل، من فضلك اذكر ${missingTextAr}."`;
      }

      if (stageForPrompt === 2) {
        return isEnglish
          ? `The user has already provided their basic information (age, gender, and duration) for ${condition || "their medical condition"
          }. Now your ONLY task is to ask them to describe their **symptoms in detail**.

        Keep the reply focused on collecting symptom details (what they feel, where, since when, what makes it better or worse) without giving medical explanations yet.` : `قدّم المستخدم بالفعل معلوماته الأساسية (العمر والجنس ومدة المشكلة) لـ ${condition || "حالته الطبية"}. مهمتك الآن هي طلب **وصف الأعراض بالتفصيل فقط** دون تقديم تشخيص أو تفسير طبي في هذه المرحلة.`;
      }

      if (stageForPrompt === 3) {
        return isEnglish
          ? `${cornerCases}\n\nPatient Context: ${context}. Respond in English with SPECIALIST_RECOMMENDATION. Include a final section with two buttons (non-clickable): "You can view our specialist list. Click the button to see the list. 🩺 Specialist List" and "You can book an appointment with a specialist. Click to book. 📅 Appointment Now". 
          These buttons should be displayed after the sources section. Also include a dynamic CTA at the end that encourages further interaction, similar to how ChatGPT provides varied call-to-actions. The CTA should be creative and different each time, encouraging users to ask for more specific information about their condition: ${condition || "their mentioned condition"}.` : `${cornerCases}\n\nسياق المريض: ${context}. الرد بالعربية مع SPECIALIST_RECOMMENDATION. قم بتضمين قسم نهائي يحتوي على زرين (غير قابلين للنقر): "يمكنك عرض قائمة الأخصائيين لدينا. انقر على الزر لرؤية القائمة. 🩺 قائمة الأخصائيين" و "يمكنك حجز موعد مع أخصائي. انقر للحجز. 📅 حجز موعد الآن". يجب عرض هذه الأزرار بعد قسم المصادر. قم أيضًا بتضمين CTA ديناميكي في النهاية يشجع على التفاعل الإضافي، مشابهًا لكيفية تقديم ChatGPT لدعوات متنوعة لاتخاذ إجراء. يجب أن يكون CTA إبداعيًا ومختلفًا في كل مرة، ويشجع المستخدمين على طلب معلومات أكثر تحديدًا حول حالتهم: ${condition || "حالتهم المذكورة"}.`;
      }

      if (stageForPrompt === 4 || stageForPrompt === 5) {
        return isEnglish
          ? `${cornerCases}\n\nPatient Context: ${context}. The user has requested a complete care plan and detailed guidelines for ${condition || "their condition"}. Provide a comprehensive care plan with specific steps, home remedies, when to seek medical help, and preventive measures tailored to their specific condition. Include a final section with two buttons (non-clickable): "You can view our specialist list. Click the button to see the list. 🩺 Specialist List" and "You can book an appointment with a specialist. Click to book. 📅 Appointment Now". 
          These buttons should be displayed after the sources section. Also include a dynamic CTA at the end that encourages further interaction, similar to how ChatGPT provides varied call-to-actions.` : `${cornerCases}\n\nسياق المريض: ${context}. طلب المستخدم خطة رعاية كاملة وإرشادات مفصلة لـ ${condition || "حالتهم"}. قدم خطة رعاية شاملة مع خطوات محددة وعلاجات منزلية ومتى تطلب المساعدة الطبية والتدابير الوقائية المصممة خصيصاً لحالتهم. قم بتضمين قسم نهائي يحتوي على زرين (غير قابلين للنقر): "يمكنك عرض قائمة الأخصائيين لدينا. انقر على الزر لرؤية القائمة. 🩺 قائمة الأخصائيين" و "يمكنك حجز موعد مع أخصائي. انقر للحجز. 📅 حجز موعد الآن". يجب عرض هذه الأزرار بعد قسم المصادر. قم أيضًا بتضمين CTA ديناميكي في النهاية يشجع على التفاعل الإضافي، مشابهًا لكيفية تقديم ChatGPT لدعوات متنوعة لاتخاذ إجراء.`;
      }

      return generateMedicalPrompt(mergedUserInfo, isEnglish, condition);
    },
    [userInfo, isEnglish, extractUserInfoFromMessage, updateUserInfo, conversationStage,]
  );

  const generateMedicalPrompt = (userInfo, isEnglish, condition) => {
    const context = `Age: ${userInfo?.age || "not provided"}, Gender: ${userInfo?.gender || "not provided"
      }, Duration: ${userInfo?.duration || "not provided"}, Symptoms: ${userInfo?.symptoms || "not provided"}, Condition: ${condition || "not specified"}`;

    return isEnglish
      ? `${cornerCases}\n\nPatient Context: ${context}. Respond in English with SPECIALIST_RECOMMENDATION. Include a final section with two buttons (non-clickable): "You can view our specialist list. Click the button to see the list. 🩺 Specialist List" and "You can book an appointment with a specialist. Click to book. 📅 Appointment Now". 
      These buttons should be displayed after the sources section. Also include a dynamic CTA at the end that encourages further interaction, similar to how ChatGPT provides varied call-to-actions. The CTA should be creative and different each time, encouraging users to ask for more specific information about their condition: ${condition || "their mentioned condition"}.`
      : `${cornerCases}\n\nسياق المريض: ${context}. الرد بالعربية مع SPECIALIST_RECOMMENDATION. قم بتضمين قسم نهائي يحتوي على زرين (غير قابلين للنقر): "يمكنك عرض قائمة الأخصائيين لدينا. انقر على الزر لرؤية القائمة. 🩺 قائمة الأخصائيين" و "يمكنك حجز موعد مع أخصائي. انقر للحجز. 📅 حجز موعد الآن". يجب عرض هذه الأزرار بعد قسم المصادر. قم أيضًا بتضمين CTA ديناميكي في النهاية يشجع على التفاعل الإضافي، مشابهًا لكيفية تقديم ChatGPT لدعوات متنوعة لاتخاذ إجراء. يجب أن يكون CTA إبداعيًا ومختلفًا في كل مرة، ويشجع المستخدمين على طلب معلومات أكثر تحديدًا حول حالتهم: ${condition || "حالتهم المذكورة"}.`;
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      if (sessionLimitReached) throw new Error("Session limit reached");

      if (conversationStage === 3 && isCarePlanRequest(inputText)) {
        setConversationStage(4);
      } else if (conversationStage >= 4) {
        setConversationStage(5);
      }

      const systemPrompt = generateSystemPrompt(inputText);

      setIsStreaming(true);

      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          response = await fetch(`${baseUrl}/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "qwen/qwen2.5-vl-72b-instruct",
              // model: "mistralai/mistral-small-24b-instruct-2501",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: inputText },
              ],
              temperature: 0,
              stream: true,
              max_tokens: 1500,
            }),
          });

          if (!response.ok) {
            if (response.status === 429 && retryCount < maxRetries) {
              const retryAfter = response.headers.get("retry-after") || 2;
              await new Promise((resolve) =>
                setTimeout(resolve, parseInt(retryAfter) * 1000)
              );
              retryCount++;
              continue;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          break;
        } catch (error) {
          if (retryCount >= maxRetries) throw error;
          retryCount++;
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      return {
        stream: response.body,
        language: isArabic ? "arabic" : "english",
      };
    },
    onSuccess: (data) => {
      streamHandler.processStream(data);
      setApiError(null);

      setConversationStage((prev) => {
        if (prev >= 4) return prev;

        if (lastPromptStage === 1) return 1;
        if (lastPromptStage === 2) return 2;
        if (lastPromptStage >= 3) return 3;
        return prev;
      });
    },

    onError: (error) => {
      handleSendMessageError(error, isEnglish, setMessages);
      setApiError(error.message);
      setIsStreaming(false);
    },
    retry: (failureCount, error) => {
      return error.message.includes("429") && failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleSendMessageError = (error, isEnglish) => {
    if (error.message === "NON_MEDICAL_QUESTION") {
      const message = isEnglish
        ? "Sorry, I don't answer non-medical questions. You can only share medical-related questions with me."
        : "عذرًا، لا أجيب على التكاليف غير الطبية. يمكنك فقط مشاركة التكاليف الطبية معي.";

      setMessages((prev) => [...prev, createBotMessage(message)]);
    } else if (error.message.includes("429")) {
      const message = isEnglish
        ? "I'm receiving too many requests right now. Please wait a moment before trying again."
        : "أستقبل الكثير من الطلبات الآن. يرجى الانتظار لحظة قبل المحاولة مرة أخرى.";

      setMessages((prev) => [...prev, createBotMessage(message)]);
    } else {
      const errorMessage = isArabic
        ? `<span style="color:red">خطأ : ${error.message}</span>`
        : `<span style="color:red">Error : ${error.message}</span>`;

      setMessages((prev) => [...prev, createBotMessage(errorMessage)]);
    }
  };

  const addMessagePair = (userText, botText) => {
    const newMessages = [
      createUserMessage(userText),
      createBotMessage(botText),
    ];
    setMessages((prev) => [...prev, ...newMessages]);
  };

  const handleEmergencySituation = (inputText, isEnglish) => {
    const emergencyResponse = isEnglish
      ? `<span style="color:red; font-weight:bold;">⚠️ EMERGENCY ALERT! You may be experiencing a serious medical condition. ➡️ Please go to the nearest hospital immediately or call emergency services.</span>`
      : `<span style="color:red; font-weight:bold;">⚠️ تنبيه طوارئ! قد تكون تعاني من حالة طبية خطيرة. ➡️ يرجى التوجه إلى أقرب مستشفى فورًا أو الاتصال بخدمات الطوارئ.</span>`;

    addMessagePair(inputText, emergencyResponse);
  };

  const processUserMessage = async (inputText) => {
    const newUserMessage = createUserMessage(inputText);
    setMessages((prev) => [...prev, newUserMessage]);

    incrementMessageCount();

    const loadingMessage = createBotMessage(
      isEnglish ? "🔄 Processing your request..." : "🔄 جاري معالجة طلبك...",
      true
    );
    setMessages((prev) => [...prev, loadingMessage]);

    sendMessageMutation.mutate(inputText, {
      onSuccess: () =>
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== loadingMessage.id)
        ),
      onError: () =>
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== loadingMessage.id)
        ),
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
  }, [inputText, isEnglish, isArabic, sessionLimitReached, isProcessing, conversationStage,]);

  const startNewConversation = useCallback(() => {
    setMessages([]); setInputText(""); resetSession(); setConversationStage(1); setApiError(null); setLastCondition(""); setIsStreaming(false);
  }, [resetSession]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey && !sessionLimitReached) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage, sessionLimitReached]
  );

  const autoResizeTextarea = useCallback((textareaRef) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  return {
    messages, inputText, setInputText, isProcessing, handleSendMessage, handleKeyDown, autoResizeTextarea, startNewConversation, userInfo: userInfo || {}, apiError, isStreaming,
  };
};

export { useMedicalAssistant };
