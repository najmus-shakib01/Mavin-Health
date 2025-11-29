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
  const [apiError, setApiError] = useState(null);
  const [, setLastCondition] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const { isEnglish, isArabic } = useLanguage();
  const {
    sessionLimitReached,
    incrementMessageCount,
    resetSession,
    userInfo,
    updateUserInfo,
  } = useSession();

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

    return {
      age: ageMatch ? ageMatch[1] : "",
      gender: genderMatch ? genderMatch[1].toLowerCase() : "",
      duration: durationMatch ? durationMatch[0] : "",
      symptoms: extractSymptoms(message),
    };
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
    const carePlanKeywords = [
      "care plan",
      "guidelines",
      "routine",
      "rules",
      "complete care",
      "detailed guidelines",
      "خطة رعاية",
      "إرشادات",
      "روتين",
      "قواعد",
      "رعاية كاملة",
      "إرشادات مفصلة",
    ];

    return carePlanKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  const extractMainCondition = (message) => {
    const conditions = {
      diabetes: [
        "diabetes",
        "diabetic",
        "sugar",
        "glucose",
        "blood sugar",
        "type 1",
        "type 2",
        "السكري",
        "السكر",
        "الجلوكوز",
      ],
      fever: [
        "fever",
        "temperature",
        "hot",
        "feverish",
        "حمى",
        "حرارة",
        "سخونة",
      ],
      cough: ["cough", "coughing", "سعال", "كحة"],
      headache: ["headache", "head pain", "migraine", "صداع", "ألم في الرأس"],
      "sore throat": [
        "sore throat",
        "throat pain",
        "التهاب الحلق",
        "ألم في الحلق",
      ],
      "stomach pain": [
        "stomach pain",
        "abdominal pain",
        "belly ache",
        "stomachache",
        "ألم في المعدة",
        "ألم في البطن",
      ],
      "chest pain": [
        "chest pain",
        "chest tightness",
        "ألم في الصدر",
        "ضيق في الصدر",
      ],
      "back pain": ["back pain", "backache", "ألم في الظهر"],
      "high blood pressure": [
        "high blood pressure",
        "hypertension",
        "ضغط الدم المرتفع",
        "ارتفاع ضغط الدم",
      ],
      asthma: [
        "asthma",
        "wheezing",
        "breathing difficulty",
        "ربو",
        "صفير",
        "صعوبة في التنفس",
      ],
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

  const generateMedicalPrompt = useCallback((userInfoParam, isEnglishParam, conditionParam) => {
    const context = `Age: ${userInfoParam?.age || 'not provided'}, Gender: ${userInfoParam?.gender || 'not provided'}, Duration: ${userInfoParam?.duration || 'not provided'}, Symptoms: ${userInfoParam?.symptoms || 'not provided'}, Condition: ${conditionParam || 'not specified'}`;

    const langInstruction = isEnglishParam
      ? "Respond in clear, concise English. Follow ALL safety rules above. Do NOT give a diagnosis or prescribe any medication."
      : "أجب باللغة العربية الفصحى الواضحة. اتبع جميع قواعد السلامة أعلاه. لا تقدّم تشخيصًا ولا توصف أي دواء.";

    return `
        ${cornerCases}

        ${langInstruction}

        Patient Context: ${context}

        You are now in the FINAL_RESPONSE stage:
        - You ALREADY have age, gender, duration AND detailed symptoms.
        - Follow the "Final Medical Response" structure strictly.
        - Talk about possible causes, risk factors, red flags, self-care, when to see a doctor, references, and disclaimer.
        - Never state a confirmed diagnosis.
  `.trim();
  }, []);

  const generateSystemPrompt = useCallback((userMessage) => {
    const extractedInfo = extractUserInfoFromMessage(userMessage);
    const mergedUserInfo = {
      ...userInfo,
      ...Object.fromEntries(
        Object.entries(extractedInfo).filter(([, v]) => v && v !== "")
      ),
    };

    const hasNewInfo =
      extractedInfo.age || extractedInfo.gender || extractedInfo.duration || extractedInfo.symptoms;
    if (hasNewInfo) {
      updateUserInfo(mergedUserInfo);
    }

    const condition = extractMainCondition(userMessage);
    if (condition) setLastCondition(condition);

    const hasRequiredInfo =
      !!mergedUserInfo.age && !!mergedUserInfo.gender && !!mergedUserInfo.duration;
    const hasSymptoms = !!mergedUserInfo.symptoms && mergedUserInfo.symptoms.length > 0;

    if (!hasRequiredInfo) {
      if (isEnglish) {
        return `
            You are a medical symptom assistant. You ONLY collect REQUIRED basic information at this stage.

            User has not yet provided all of: Age, Gender, Duration.

            Your ONLY job now:
            - Politely ask for:
              • Age
              • Gender
              • How long they have had this problem (Duration)
            - Do NOT ask for detailed symptoms yet.
            - If the user talks about other things, gently remind them that you cannot continue without age, gender and duration.

            Reply in English and keep it short, friendly and clear.
      `.trim();
      }

      return `
          أنت مساعد للأعراض الطبية. في هذه المرحلة مهمتك الوحيدة هي جمع المعلومات الأساسية المطلوبة.

          المستخدم لم يقدّم بعد جميع هذه المعلومات: العمر، الجنس، مدة المشكلة.

          مهمتك الآن:
          - اطلب بلطف:
            • العمر
            • الجنس
            • منذ متى بدأت المشكلة (المدة)
          - لا تطلب وصف الأعراض بالتفصيل بعد.
          - إذا تحدث المستخدم عن أشياء أخرى، ذكّره بلطف أنك لا تستطيع المتابعة بدون العمر والجنس والمدة.

          أجب بالعربية وبأسلوب قصير ولطيف وواضح.
    `.trim();
    }

    if (hasRequiredInfo && !hasSymptoms) {
      if (isEnglish) {
        return `
            You are a medical symptom assistant. You HAVE the basic required info (Age, Gender, Duration).

            Your ONLY goal in this turn:
            - Ask the user to describe their symptoms in detail.
            - DO NOT provide any medical analysis yet.
            - Keep it focused and short.

            For example:
            "Thank you for sharing your basic information. Now please describe your symptoms in detail — what you feel, where in the body, since when, what makes it better or worse."
      `.trim();
      }

      return `
        أنت مساعد للأعراض الطبية. لديك الآن المعلومات الأساسية المطلوبة (العمر، الجنس، المدة).

        مهمتك الوحيدة في هذه الرسالة:
        - أن تطلب من المستخدم وصف الأعراض بالتفصيل.
        - لا تقدم أي تحليل طبي الآن.
        - اجعل الرد مركزًا وقصيرًا.

        مثال:
        "شكرًا لتزويدي بالمعلومات الأساسية. الآن يرجى وصف الأعراض بالتفصيل — ماذا تشعر بالضبط، وأين في الجسم، ومنذ متى، وما الذي يحسّن أو يزيد الأعراض."
    `.trim();
    }

    return generateMedicalPrompt(mergedUserInfo, isEnglish, condition);
  }, [extractUserInfoFromMessage, userInfo, generateMedicalPrompt, isEnglish, updateUserInfo]);


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
      if (conversationStage === 1) {
        setConversationStage(2);
      } else if (conversationStage === 2) {
        setConversationStage(3);
      }
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

  const createBotMessage = (text, isStreaming = false) => ({ id: Date.now() + 1, text, sender: "bot", isStreaming, timestamp: new Date().toLocaleTimeString(), });

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

