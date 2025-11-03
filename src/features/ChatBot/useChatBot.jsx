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
  const [apiError, setApiError] = useState(null);
  const [lastCondition, setLastCondition] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const { isEnglish, changeLanguage, language, isArabic } = useLanguage();
  const { sessionLimitReached, incrementMessageCount, resetSession, userInfo, updateUserInfo } = useSession();

  const streamHandler = useStreamHandler(setMessages, isArabic);
  useApiMedicalValidation();

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

  const hasRequiredInfo = useCallback(() =>
    userInfo.age && userInfo.gender && userInfo.duration
    , [userInfo]);

  const getMissingInfo = useCallback(() => {
    const missing = [];
    if (!userInfo.age) missing.push(isEnglish ? 'age' : 'العمر');
    if (!userInfo.gender) missing.push(isEnglish ? 'gender' : 'الجنس');
    if (!userInfo.duration) missing.push(isEnglish ? 'how long you\'ve been having this problem' : 'المدة التي تعاني منها من هذه المشكلة');
    return missing;
  }, [userInfo, isEnglish]);

  const isCarePlanRequest = useCallback((message) => {
    const carePlanKeywords = [
      'care plan', 'guidelines', 'routine', 'rules', 'complete care', 'detailed guidelines',
      'خطة رعاية', 'إرشادات', 'روتين', 'قواعد', 'رعاية كاملة', 'إرشادات مفصلة'
    ];

    return carePlanKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  const extractMainCondition = (message) => {
    const conditions = {
      'diabetes': ['diabetes', 'diabetic', 'sugar', 'glucose', 'blood sugar', 'type 1', 'type 2', 'السكري', 'السكر', 'الجلوكوز'],
      'fever': ['fever', 'temperature', 'hot', 'feverish', 'حمى', 'حرارة', 'سخونة'],
      'cough': ['cough', 'coughing', 'سعال', 'كحة'],
      'headache': ['headache', 'head pain', 'migraine', 'صداع', 'ألم في الرأس'],
      'sore throat': ['sore throat', 'throat pain', 'التهاب الحلق', 'ألم في الحلق'],
      'stomach pain': ['stomach pain', 'abdominal pain', 'belly ache', 'stomachache', 'ألم في المعدة', 'ألم في البطن'],
      'chest pain': ['chest pain', 'chest tightness', 'ألم في الصدر', 'ضيق في الصدر'],
      'back pain': ['back pain', 'backache', 'ألم في الظهر'],
      'high blood pressure': ['high blood pressure', 'hypertension', 'ضغط الدم المرتفع', 'ارتفاع ضغط الدم'],
      'asthma': ['asthma', 'wheezing', 'breathing difficulty', 'ربو', 'صفير', 'صعوبة في التنفس']
    };

    const lowerMessage = message.toLowerCase();

    for (const [condition, keywords] of Object.entries(conditions)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return condition;
        }
      }
    }

    return '';
  };

  const generateSystemPrompt = useCallback((userMessage) => {
    const extractedInfo = extractUserInfoFromMessage(userMessage);
    const hasNewInfo = extractedInfo.age || extractedInfo.gender || extractedInfo.duration || extractedInfo.symptoms;

    const condition = extractMainCondition(userMessage);
    if (condition) setLastCondition(condition);

    if (hasNewInfo) {
      updateUserInfo(extractedInfo);
    }

    if (conversationStage === 1) {
      return isEnglish
        ? `The user has shared their initial symptoms related to ${condition || 'a medical condition'}. Ask for their age, gender, and problem duration. Create a dynamic response that acknowledges their specific condition. For example: "Thank you for sharing that you have ${condition || 'your health concern'} with me. <br><br> To help you better, please provide your **Age**, **Gender**, and **Duration of ${condition || 'your condition'}**."`
        : `المستخدم شارك أعراضه الأولية المتعلقة بـ ${condition || 'حالة طبية'}. اطلب منه العمر والجنس ومدة المشكلة. قم بإنشاء رد ديناميكي يعترف بحالته المحددة. على سبيل المثال: "شكراً لمشاركة أن لديك ${condition || 'حالتك الصحية'} معي. <br><br> لمساعدتك بشكل أفضل، يرجى تقديم **العمر**، **الجنس**، و**مدة ${condition || 'حالتك'}**."`;
    } else if (conversationStage === 2) {
      return isEnglish
        ? `The user has provided their basic information for ${condition || 'their medical condition'}. Now ask for detailed symptoms with examples that are relevant to their specific condition. Create a concise response with condition-specific examples. For example, if they mentioned diabetes: "Thank you for providing the necessary information. <br><br> Now please share your **symptoms in detail**. For example — if you're talking about diabetes, you can write: \n"I've had diabetes for 3 years, my blood sugar levels are often high in the morning, I feel thirsty frequently, and I've been experiencing blurred vision lately.\n" Keep your response concise and focused on asking for details about their specific condition: ${condition || 'their mentioned condition'}.`
        : `المستخدم قدم معلوماته الأساسية لـ ${condition || 'حالته الطبية'}. الآن اطلب منه أعراضه التفصيلية مع أمثلة ذات صلة بحالته المحددة. قم بإنشاء رد موجز مع أمثلة خاصة بالحالة. على سبيل المثال، إذا ذكروا السكري: "شكراً لتقديم المعلومات الضرورية. <br><br> الآن يرجى مشاركة **أعراضك بالتفصيل**. على سبيل المثال — إذا كنت تتحدث عن السكري، يمكنك كتابة: "لدي السكري منذ 3 سنوات، مستويات السكر في الدم غالباً ما تكون مرتفعة في الصباح، أشعر بالعطش كثيراً، وقد كنت أعاني من ضعف الرؤية مؤخراً." احتفظ ردك موجز وركز على طلب التفاصيل حول حالتهم المحددة: ${condition || 'حالتهم المذكورة'}.`;
    } else if (conversationStage === 3) {
      return generateMedicalPrompt(userInfo, isEnglish, condition);
    } else if (conversationStage === 4 || conversationStage === 5) {
      return generateCarePlanPrompt(userInfo, lastCondition, isEnglish);
    }

    return generateMedicalPrompt(userInfo, isEnglish, condition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, isEnglish, hasRequiredInfo, getMissingInfo, extractUserInfoFromMessage, updateUserInfo, conversationStage, lastCondition]);

  const generateCarePlanPrompt = (userInfo, condition, isEnglish) => {
    const context = `Age: ${userInfo?.age || 'not provided'}, Gender: ${userInfo?.gender || 'not provided'}, Duration: ${userInfo?.duration || 'not provided'}, Symptoms: ${userInfo?.symptoms || 'not provided'}, Condition: ${condition}`;

    if (conversationStage === 4) {
      return isEnglish
        ? `${cornerCases}\n\nPatient Context: ${context}. The user has requested a complete care plan and detailed guidelines for ${condition || 'their condition'}. Provide a comprehensive care plan with specific steps, home remedies, when to seek medical help, and preventive measures tailored to their specific condition. Include a final section with two buttons (non-clickable): "You can view our specialist list. Click the button to see the list. 🩺 Specialist List" and "You can book an appointment with a specialist. Click to book. 📅 Appointment Now". 
        <br>
        <b>These buttons should be displayed after the sources section. Also include a dynamic CTA at the end that encourages further interaction, similar to how ChatGPT provides varied call-to-actions.</b>`
        : `${cornerCases}\n\nسياق المريض: ${context}. طلب المستخدم خطة رعاية كاملة وإرشادات مفصلة لـ ${condition || 'حالتهم'}. قدم خطة رعاية شاملة مع خطوات محددة وعلاجات منزلية ومتى تطلب المساعدة الطبية والتدابير الوقائية المصممة خصيصاً لحالتهم. قم بتضمين قسم نهائي يحتوي على زرين (غير قابلين للنقر): "يمكنك عرض قائمة الأخصائيين لدينا. انقر على الزر لرؤية القائمة. 🩺 قائمة الأخصائيين" و "يمكنك حجز موعد مع أخصائي. انقر للحجز. 📅 حجز موعد الآن". يجب عرض هذه الأزرار بعد قسم المصادر. قم أيضًا بتضمين CTA ديناميكي في النهاية يشجع على التفاعل الإضافي، مشابهًا لكيفية تقديم ChatGPT لدعوات متنوعة لاتخاذ إجراء.`;
    } else {
      return isEnglish
        ? `${cornerCases}\n\nPatient Context: ${context}. Continue providing helpful medical information related to their specific condition: ${condition || 'their condition'}. Include a final section with two buttons (non-clickable): "You can view our specialist list. Click the button to see the list. 🩺 Specialist List" and "You can book an appointment with a specialist. Click to book. 📅 Appointment Now". 
        <br>
        <b>These buttons should be displayed after the sources section. Also include a dynamic CTA at the end that encourages further interaction, similar to how ChatGPT provides varied call-to-actions.</b>`
        : `${cornerCases}\n\nسياق المريض: ${context}. استمر في تقديم معلومات طبية مفيدة تتعلق بحالتهم المحددة: ${condition || 'حالتهم'}. قم بتضمين قسم نهائي يحتوي على زرين (غير قابلين للنقر): "يمكنك عرض قائمة الأخصائيين لدينا. انقر على الزر لرؤية القائمة. 🩺 قائمة الأخصائيين" و "يمكنك حجز موعد مع أخصائي. انقر للحجز. 📅 حجز موعد الآن". يجب عرض هذه الأزرار بعد قسم المصادر. قم أيضًا بتضمين CTA ديناميكي في النهاية يشجع على التفاعل الإضافي، مشابهًا لكيفية تقديم ChatGPT لدعوات متنوعة لاتخاذ إجراء.`;
    }
  };

  const generateMedicalPrompt = (userInfo, isEnglish, condition) => {
    const context = `Age: ${userInfo?.age || 'not provided'}, Gender: ${userInfo?.gender || 'not provided'}, Duration: ${userInfo?.duration || 'not provided'}, Symptoms: ${userInfo?.symptoms || 'not provided'}, Condition: ${condition || 'not specified'}`;

    return isEnglish
      ? `${cornerCases}\n\nPatient Context: ${context}. Respond in English with SPECIALIST_RECOMMENDATION. Include a final section with two buttons (non-clickable): "You can view our specialist list. Click the button to see the list. 🩺 Specialist List" and "You can book an appointment with a specialist. Click to book. 📅 Appointment Now". 
      <br>
      These buttons should be displayed after the sources section. Also include a dynamic CTA at the end that encourages further interaction, similar to how ChatGPT provides varied call-to-actions. The CTA should be creative and different each time, encouraging users to ask for more specific information about their condition: ${condition || 'their mentioned condition'}.`
      : `${cornerCases}\n\nسياق المريض: ${context}. الرد بالعربية مع SPECIALIST_RECOMMENDATION. قم بتضمين قسم نهائي يحتوي على زرين (غير قابلين للنقر): "يمكنك عرض قائمة الأخصائيين لدينا. انقر على الزر لرؤية القائمة. 🩺 قائمة الأخصائيين" و "يمكنك حجز موعد مع أخصائي. انقر للحجز. 📅 حجز موعد الآن". يجب عرض هذه الأزرار بعد قسم المصادر. قم أيضًا بتضمين CTA ديناميكي في النهاية يشجع على التفاعل الإضافي، مشابهًا لكيفية تقديم ChatGPT لدعوات متنوعة لاتخاذ إجراء. يجب أن يكون CTA إبداعيًا ومختلفًا في كل مرة، ويشجع المستخدمين على طلب معلومات أكثر تحديدًا حول حالتهم: ${condition || 'حالتهم المذكورة'}.`;
  };


  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      if (sessionLimitReached) {
        throw new Error("Session limit reached");
      }

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
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "mistralai/mistral-small-24b-instruct-2501:free",
              messages: [{ role: "system", content: systemPrompt }, { role: "user", content: inputText }],
              temperature: 0, stream: true,
            }),
          });

          if (!response.ok) {
            if (response.status === 429 && retryCount < maxRetries) {
              const retryAfter = response.headers.get('retry-after') || 2;
              await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
              retryCount++;
              continue;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          break;
        } catch (error) {
          if (retryCount >= maxRetries) throw error;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      return { stream: response.body, language: language };
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
      return error.message.includes('429') && failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleSendMessageError = (error, isEnglish, setMessages) => {
    if (error.message === "NON_MEDICAL_QUESTION") {
      const message = isEnglish
        ? "Sorry, I don't answer non-medical questions. You can only share medical-related questions with me."
        : "عذرًا، لا أجيب على التكاليف غير الطبية. يمكنك فقط مشاركة التكاليف الطبية معي.";

      setMessages(prev => [...prev, createBotMessage(message)]);
    } else if (error.message.includes('429')) {
      const message = isEnglish
        ? "I'm receiving too many requests right now. Please wait a moment before trying again."
        : "أستقبل الكثير من الطلبات الآن. يرجى الانتظار لحظة قبل المحاولة مرة أخرى.";

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
    id: Date.now(), text, sender: "user", timestamp: new Date().toLocaleTimeString(),
  });

  const createBotMessage = (text, isStreaming = false) => ({
    id: Date.now() + 1, text, sender: "bot", isStreaming, timestamp: new Date().toLocaleTimeString(),
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
    setMessages([]); setInputText(""); resetSession(); setConversationStage(1); setApiError(null); setLastCondition(""); setIsStreaming(false);
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
    autoResizeTextarea, toggleFullscreen, sendMessageMutation, startNewConversation, userInfo, apiError, isStreaming
  };
};