import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import { detectMedicalIntent } from "../../services/intentDetection";
import { detectEmergency, verifyLanguage } from "./MessageUtils";
import { useStreamHandler } from "./useStreamHandler";
import {
  cleanAIResponse,
  formatResponseWithSources,
} from "../../utils/sourceExtractor";

const CONVERSATION_STAGES = {
  INITIAL: 1,
  SYMPTOM_CONFIRMATION: 2,
  AGE_GENDER_COLLECTION: 3,
  DEEP_DIVE: 4,
  DETAILED_NARRATIVE: 5,
  FINAL_DIAGNOSIS: 6,
};

const useChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [conversationStage, setConversationStage] = useState(
    CONVERSATION_STAGES.INITIAL
  );
  const [showAgeGenderForm, setShowAgeGenderForm] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userDemographics, setUserDemographics] = useState({
    age: "",
    gender: "",
    duration: "",
  });
  const [collectedSymptoms, setCollectedSymptoms] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [isValidatingIntent, setIsValidatingIntent] = useState(false);
  const [hasProvidedAgeGender, setHasProvidedAgeGender] = useState(false);
  const [hasProvidedDuration, setHasProvidedDuration] = useState(false);

  const { isEnglish, isArabic } = useLanguage();
  const {
    sessionLimitReached,
    incrementMessageCount,
    resetSession,
    userInfo,
    updateUserInfo,
  } = useSession();

  const streamHandler = useStreamHandler(setMessages, isArabic, {
    onStreamStart: () => setIsStreaming(true),
    onStreamEnd: () => setIsStreaming(false),
  });

  const createUserMessage = useCallback(
    (text) => ({
      id: Date.now() + Math.random(),
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    }),
    []
  );

  const createBotMessage = useCallback(
    (text, isStreaming = false) => ({
      id: Date.now() + Math.random() + 1,
      text,
      sender: "bot",
      isStreaming,
      timestamp: new Date().toLocaleTimeString(),
    }),
    []
  );

  const addUserMessage = useCallback(
    (userText) => {
      const userMsg = createUserMessage(userText);
      setMessages((prev) => [...prev, userMsg]);
      incrementMessageCount();
    },
    [createUserMessage, incrementMessageCount]
  );

  const addBotMessage = useCallback(
    (botText, isStreaming = false) => {
      const botMsg = createBotMessage(botText, isStreaming);
      setMessages((prev) => [...prev, botMsg]);
    },
    [createBotMessage]
  );

  const extractUserInfoFromMessage = useCallback(
    (message) => {
      const ageMatch = message.match(
        /(\d+)\s*(?:years? old|year|yo|y\.o|age|aged|عمري|سنة|عمر)/i
      );

      const genderMatch = message.match(
        /(male|female|man|woman|boy|girl|رجل|أنثى|ذكر|فتاة)/i
      );

      const durationMatch = message.match(
        /(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y|أيام|يوم|ساعات|ساعة|أسابيع|أسبوع|شهور|شهر|سنوات|سنة)/i
      );

      const info = {
        age: ageMatch ? ageMatch[1] : "",
        gender: genderMatch ? genderMatch[1].toLowerCase() : "",
        duration: durationMatch ? durationMatch[0] : "",
      };

      if (info.age || info.gender || info.duration) {
        const updates = {};

        if (info.age) {
          updates.age = info.age;
          setHasProvidedAgeGender((prev) =>
            !prev && info.gender ? true : prev
          );
        }

        if (info.gender) {
          const gender = info.gender.toLowerCase();
          let normalizedGender = gender;

          if (
            gender.includes("female") ||
            gender.includes("woman") ||
            gender.includes("girl") ||
            gender.includes("أنثى") ||
            gender.includes("فتاة")
          ) {
            normalizedGender = "female";
          } else if (
            gender.includes("male") ||
            gender.includes("man") ||
            gender.includes("boy") ||
            gender.includes("رجل") ||
            gender.includes("ذكر")
          ) {
            normalizedGender = "male";
          }

          updates.gender = normalizedGender;
          setHasProvidedAgeGender((prev) => (!prev && info.age ? true : prev));
        }

        if (info.duration) {
          updates.duration = info.duration;
          setHasProvidedDuration(true);
        }

        if (Object.keys(updates).length > 0) {
          setUserDemographics((prev) => ({ ...prev, ...updates }));
          updateUserInfo(updates);
        }
      }

      return info;
    },
    [updateUserInfo]
  );

  const generateDeepDiveQuestions = useCallback(() => {
    setIsStreaming(true);

    const { age, gender, duration } = userDemographics;

    let basePrompt;
    if (age && gender) {
      if (duration) {
        basePrompt = `The patient is a ${age} year old ${gender}. They have been experiencing symptoms for ${duration}. They have described their symptoms. Now ask specific follow-up questions about their medical condition to get more details. Make it conversational and caring. Return only the questions.`;
      } else {
        basePrompt = `The patient is a ${age} year old ${gender}. They have described their symptoms. Now ask specific follow-up questions about their medical condition to get more details. Make it conversational and caring. Return only the questions.`;
      }
    } else {
      basePrompt = `The patient has provided their information. Now ask specific follow-up questions about their medical condition to get more details. Make it conversational and caring. Return only the questions.`;
    }

    const prompt = isEnglish
      ? basePrompt
      : age && gender
        ? duration
          ? `المريض عمره ${age} سنة وجنسه ${gender === "male" ? "ذكر" : "أنثى"
          }. يعاني من الأعراض منذ ${duration}. لقد وصف أعراضه. الآن اسأل أسئلة متابعة محددة عن حالته الطبية للحصول على مزيد من التفاصيل. اجعلها محادثة ومهتمة. أعد الأسئلة فقط.`
          : `المريض عمره ${age} سنة وجنسه ${gender === "male" ? "ذكر" : "أنثى"
          }. لقد وصف أعراضه. الآن اسأل أسئلة متابعة محددة عن حالته الطبية للحصول على مزيد من التفاصيل. اجعلها محادثة ومهتمة. أعد الأسئلة فقط.`
        : `قدم المريض معلوماته. الآن اسأل أسئلة متابعة محددة عن حالته الطبية للحصول على مزيد من التفاصيل. اجعلها محادثة ومهتمة. أعد الأسئلة فقط.`;

    fetch(`${baseUrl}/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-72b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a thorough medical assistant. Ask specific, detailed questions about medical conditions. Return only the questions.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        let botResponse = data.choices[0].message.content;
        botResponse = cleanAIResponse(botResponse);
        const botMsg = createBotMessage(botResponse);
        setMessages((prev) => [...prev, botMsg]);
        setConversationStage(CONVERSATION_STAGES.DEEP_DIVE);
      })
      .catch((error) => {
        console.error("Deep dive questions error:", error);
        const fallbackResponse = isEnglish
          ? "Thank you for providing your information. Let's go through your medical concerns in more detail so I can better understand what's going on.\n\nPlease tell me:\n• What specific symptoms are you experiencing?\n• How long have you had these symptoms?\n• What makes the symptoms better or worse?"
          : "شكرًا لتقديم معلوماتك. دعنا نستعرض مخاوفك الطبية بمزيد من التفصيل حتى أتمكن من فهم ما يحدث بشكل أفضل.\n\nيرجى إخباري:\n• ما هي الأعراض المحددة التي تعاني منها؟\n• منذ متى تعاني من هذه الأعراض؟\n• ما الذي يجعل الأعراض أفضل أو أسوأ؟";
        const botMsg = createBotMessage(fallbackResponse);
        setMessages((prev) => [...prev, botMsg]);
        setConversationStage(CONVERSATION_STAGES.DEEP_DIVE);
      })
      .finally(() => {
        setIsStreaming(false);
      });
  }, [isEnglish, createBotMessage, userDemographics]);

  const generateInitialResponseMutation = useMutation({
    mutationFn: async (userText) => {
      const prompt = isEnglish
        ? `The user says: "${userText}". They are mentioning a medical concern. As a medical assistant, ask for more details about their symptoms and condition. Keep it conversational and helpful. Return only your response.`
        : `يقول المستخدم: "${userText}". يذكرون قلقًا طبيًا. كمساعد طبي، اطلب المزيد من التفاصيل عن أعراضهم وحالتهم. حافظ على المحادثة مساعدة ومفيدة. أعد ردك فقط.`;

      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-72b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful medical assistant. Ask follow-up questions about symptoms and medical concerns. Return only your response.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 150,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content;
    },
    onMutate: () => {
      setIsStreaming(true);
    },
    onSuccess: (botResponse, userText) => {
      const cleanResponse = cleanAIResponse(botResponse);
      addBotMessage(cleanResponse);
      setConversationStage(CONVERSATION_STAGES.SYMPTOM_CONFIRMATION);
      setCollectedSymptoms((prev) => [...prev, userText]);
    },
    onError: (error) => {
      console.error("Initial response error:", error);
      const fallbackResponse = isEnglish
        ? "Thank you for sharing that. To help you best, could you tell me more about your symptoms or medical concern?"
        : "شكرًا لمشاركتك ذلك. لمساعدتك بشكل أفضل، هل يمكنك إخباري بالمزيد عن أعراضك أو قلقك الطبي؟";
      addBotMessage(fallbackResponse);
      setConversationStage(CONVERSATION_STAGES.SYMPTOM_CONFIRMATION);
    },
    onSettled: () => {
      setIsStreaming(false);
    },
  });

  const generateSymptomConfirmationMutation = useMutation({
    mutationFn: async (userText) => {
      const extractedInfo = extractUserInfoFromMessage(userText);

      const hasAgeGender = extractedInfo.age && extractedInfo.gender;
      const hasDuration = extractedInfo.duration;

      let prompt;
      if (hasAgeGender && hasDuration) {
        prompt = isEnglish
          ? `The user has provided: "${userText}". They have already shared their age (${extractedInfo.age}), gender (${extractedInfo.gender}), and duration (${extractedInfo.duration}). Now ask detailed follow-up questions about their specific symptoms.`
          : `قدم المستخدم: "${userText}". لقد شارك بالفعل عمره (${extractedInfo.age}) وجنسه (${extractedInfo.gender}) ومدة الأعراض (${extractedInfo.duration}). الآن اسأل أسئلة متابعة مفصلة عن أعراضه المحددة.`;
      } else if (hasAgeGender) {
        prompt = isEnglish
          ? `The user has provided: "${userText}". They have already shared their age (${extractedInfo.age}) and gender (${extractedInfo.gender}). Now ask about how long they have been experiencing these symptoms.`
          : `قدم المستخدم: "${userText}". لقد شارك بالفعل عمره (${extractedInfo.age}) وجنسه (${extractedInfo.gender}). الآن اسأل عن المدة التي يعاني منها من هذه الأعراض.`;
      } else {
        prompt = isEnglish
          ? `The user has provided these details: "${userText}". As a medical assistant, politely ask for their age and biological sex to provide tailored advice. Explain why this information is important and assure them of privacy. Keep it warm and professional. Return only your response.`
          : `قدم المستخدم هذه التفاصيل: "${userText}". كمساعد طبي، اطلب بلطف عمرهم وجنسهم البيولوجي لتقديم نصائح مخصصة. اشرح سبب أهمية هذه المعلومات وطمئنهم بشأن الخصوصية. حافظ على الدفء والاحترافية. أعد ردك فقط.`;
      }

      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-72b-instruct",
          messages: [
            {
              role: "system",
              content:
                hasAgeGender && hasDuration
                  ? "You are a caring medical assistant. Ask detailed follow-up questions about symptoms. Return only your response."
                  : hasAgeGender
                    ? "You are a caring medical assistant. Ask about the duration of symptoms. Return only your response."
                    : "You are a caring medical assistant. Ask for demographic information sensitively. Return only your response.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return {
        response: data.choices[0].message.content,
        hasAgeGender,
        hasDuration,
      };
    },
    onMutate: () => {
      setIsStreaming(true);
    },
    onSuccess: (data, userText) => {
      const { response: botResponse, hasAgeGender, hasDuration } = data;
      const cleanResponse = cleanAIResponse(botResponse);
      addBotMessage(cleanResponse);

      if (hasAgeGender && hasDuration) {
        setConversationStage(CONVERSATION_STAGES.DEEP_DIVE);
        setTimeout(() => generateDeepDiveQuestions(), 100);
      } else if (hasAgeGender) {
        setConversationStage(CONVERSATION_STAGES.SYMPTOM_CONFIRMATION);
      } else {
        setConversationStage(CONVERSATION_STAGES.AGE_GENDER_COLLECTION);
        setShowAgeGenderForm(true);
      }

      setCollectedSymptoms((prev) => [...prev, userText]);
    },
    onError: (error) => {
      console.error("Symptom confirmation error:", error);
      const fallbackResponse = isEnglish
        ? "Thank you for letting me know about your symptoms. To provide advice that's truly tailored to you, could you please share your age and your biological sex? This information helps me consider the most relevant causes and recommendations for your situation. Please rest assured that anything you share will remain private and confidential. Your comfort and safety are my top priorities."
        : "شكرًا لإخباري عن أعراضك. لتقديم نصيحة مخصصة لك حقًا، هل يمكنك مشاركة عمرك وجنسك البيولوجي؟ تساعدني هذه المعلومات في النظر في الأسباب والتوصيات الأكثر صلة بوضعك. يرجى الاطمئنان إلى أن أي شيء تشاركه سيظل خاصًا وسريًا. راحتك وسلامتك هي أولوياتي القصوى.";
      addBotMessage(fallbackResponse);
      setConversationStage(CONVERSATION_STAGES.AGE_GENDER_COLLECTION);
      setShowAgeGenderForm(true);
    },
    onSettled: () => {
      setIsStreaming(false);
    },
  });

  const handleAgeGenderSubmit = useCallback(
    (age, gender) => {
      const genderText =
        gender === "male" ? "man" : gender === "female" ? "woman" : "";
      const userMessage = isEnglish
        ? `I am a ${age} year old ${genderText}.`
        : `أنا ${gender === "male" ? "رجل" : "امرأة"
        } أبلغ من العمر ${age} سنة.`;

      addUserMessage(userMessage);

      updateUserInfo({ age, gender });
      setUserDemographics((prev) => ({ ...prev, age, gender }));
      setHasProvidedAgeGender(true);
      setShowAgeGenderForm(false);

      const hasDuration =
        userDemographics.duration ||
        collectedSymptoms.some((msg) =>
          msg.match(
            /(\d+)\s*(?:days?|day|d|hours?|hour|hr|h|weeks?|week|wk|w|months?|month|m|years?|year|yr|y)/i
          )
        );

      if (hasDuration) {
        setConversationStage(CONVERSATION_STAGES.DEEP_DIVE);
        setTimeout(() => generateDeepDiveQuestions(), 100);
      } else {
        setConversationStage(CONVERSATION_STAGES.SYMPTOM_CONFIRMATION);
        const durationQuestion = isEnglish
          ? "Thank you. How long have you been experiencing these symptoms?"
          : "شكرًا لك. منذ متى وأنت تعاني من هذه الأعراض؟";
        addBotMessage(durationQuestion);
      }
    },
    [isEnglish, addUserMessage, updateUserInfo, userDemographics.duration, collectedSymptoms, generateDeepDiveQuestions, addBotMessage,
    ]
  );

  const generateFinalDiagnosisMutation = useMutation({
    mutationFn: async (userText) => {
      const { age, gender, duration } = userDemographics;
      const symptoms = collectedSymptoms.join(", ");

      if (!age || !gender) {
        throw new Error("Age and gender information missing");
      }

      const systemPrompt = `${cornerCases}\n\nPatient Context: Age: ${age}, Gender: ${gender}${duration ? `, Duration: ${duration}` : ""
        }, Symptoms/Concerns: ${symptoms}.\n\nIMPORTANT: At the end of your response, include a CTA (Call to Action) using this format: "CTA: [Your dynamic CTA message here]" based on the user's specific medical condition and symptoms. Make the CTA practical and actionable.`;

      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-72b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText },
          ],
          temperature: 0.3,
          stream: true,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        stream: response.body,
        language: isArabic ? "arabic" : "english",
      };
    },
    onMutate: () => {
      setIsStreaming(true);
    },
    onSuccess: (data) => {
      streamHandler.processStream(data);
      setConversationStage(CONVERSATION_STAGES.FINAL_DIAGNOSIS);
    },
    onError: (error) => {
      console.error("Final diagnosis error:", error);

      if (error.message === "Age and gender information missing") {
        const missingInfoResponse = isEnglish
          ? "To provide you with the best medical advice, I need to know your age and biological sex. Could you please share this information?"
          : "لتقديم أفضل نصيحة طبية لك، أحتاج إلى معرفة عمرك وجنسك البيولوجي. هل يمكنك مشاركة هذه المعلومات؟";

        addBotMessage(missingInfoResponse);
        setConversationStage(CONVERSATION_STAGES.AGE_GENDER_COLLECTION);
        setShowAgeGenderForm(true);
      } else {
        const { age, gender, duration } = userDemographics;
        const symptoms = collectedSymptoms.join(", ");

        const fallbackResponse = isEnglish
          ? `Based on your medical concerns (${symptoms}) and your information (${age} year old ${gender}${duration ? `, experiencing symptoms for ${duration}` : ""
          }), this appears to be a medical condition that should be evaluated by a healthcare professional.\n\n**Immediate Recommendations:**\n1. Monitor your symptoms closely\n2. Keep track of any changes in severity\n3. Note any new symptoms that develop\n4. Stay hydrated and rest if needed\n\n**When to Seek Emergency Care:**\n• Difficulty breathing\n• Chest pain or pressure\n• Severe pain\n• Confusion or dizziness\n\n**Recommended Specialist:** General Practitioner\n\n**CTA:** Based on your symptoms, I recommend scheduling a consultation with a healthcare provider for proper evaluation and diagnosis.\n\n**Medical References:**\n• Mayo Clinic\n• CDC\n• World Health Organization\n\n⚠️ **Disclaimer:** This AI system is not a licensed medical professional. This information is for educational purposes only. Please consult with a qualified healthcare provider for proper diagnosis and treatment.`
          : `بناءً على مخاوفك الطبية (${symptoms}) ومعلوماتك (${age} سنة، ${gender}${duration ? `، تعاني من الأعراض منذ ${duration}` : ""
          })، يبدو أن هذه حالة طبية يجب تقييمها من قبل مقدم رعاية صحية.\n\n**التوصيات الفورية:**\n1. راقب أعراضك عن كثب\n2. تتبع أي تغييرات في الشدة\n3. لاحظ أي أعراض جديدة تتطور\n4. حافظ على الترطيب واسترح إذا لزم الأمر\n\n**متى تطلب الرعاية الطارئة:**\n• صعوبة في التنفس\n• ألم أو ضغط في الصدر\n• ألم شديد\n• ارتباك أو دوخة\n\n**الأخصائي الموصى به:** طبيب عام\n\n**CTA:** بناءً على أعراضك، أوصي بحجز استشارة مع مقدم رعاية صحية للتقييم والتشخيص المناسب.\n\n**المراجع الطبية:**\n• عيادة مايو\n• مركز السيطرة على الأمراض\n• منظمة الصحة العالمية\n\n⚠️ **إخلاء المسؤولية:** هذا النظام الذكي ليس أخصائيًا طبيًا مرخصًا. هذه المعلومات لأغراض تعليمية فقط. يرجى استشارة مقدم رعاية صحية مؤهل للتشخيص والعلاج المناسبين.`;

        const formattedResponse = formatResponseWithSources(
          fallbackResponse,
          isArabic
        );
        addBotMessage(formattedResponse);
        setConversationStage(CONVERSATION_STAGES.FINAL_DIAGNOSIS);
      }
    },
    onSettled: () => {
      setIsStreaming(false);
    },
  });

  const validateMedicalQuestion = useCallback(async (userText) => {
    setIsValidatingIntent(true);
    try {
      const isMedical = await detectMedicalIntent(userText);
      return isMedical;
    } catch (error) {
      console.error("Medical validation error:", error);
      return true;
    } finally {
      setIsValidatingIntent(false);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (
      !inputText.trim() ||
      sessionLimitReached ||
      isStreaming ||
      isValidatingIntent
    )
      return;

    const languageVerification = verifyLanguage(inputText, isEnglish, isArabic);
    if (!languageVerification.valid) {
      addUserMessage(inputText);
      addBotMessage(languageVerification.message);
      setInputText("");
      return;
    }

    if (detectEmergency(inputText)) {
      addUserMessage(inputText);
      const emergencyResponse = isEnglish
        ? "⚠️ EMERGENCY ALERT! Based on your symptoms, please seek immediate medical attention or call emergency services."
        : "⚠️ تنبيه طوارئ! بناءً على أعراضك، يرجى طلب العناية الطبية الفورية أو الاتصال بخدمات الطوارئ.";

      addBotMessage(emergencyResponse);
      setInputText("");
      return;
    }

    addUserMessage(inputText);

    const extractedInfo = extractUserInfoFromMessage(inputText);

    setCollectedSymptoms((prev) => [...prev, inputText]);

    setIsStreaming(true);

    const validateMedical = async () => {
      try {
        const isMedical = await validateMedicalQuestion(inputText);

        if (!isMedical) {
          const nonMedicalResponse = isEnglish
            ? "I specialize in medical symptoms and health-related questions. Please ask me about medical concerns, symptoms, or health issues."
            : "أتخصص في الأعراض الطبية والأسئلة المتعلقة بالصحة. يرجى سؤالي عن المخاوف الطبية أو الأعراض أو المشاكل الصحية.";

          setMessages((prev) => [
            ...prev,
            createBotMessage(nonMedicalResponse),
          ]);
          return false;
        }
        return true;
      } catch (error) {
        console.error("Intent validation failed:", error);
        return true;
      }
    };

    validateMedical().then((isMedical) => {
      if (!isMedical) {
        setInputText("");
        setIsStreaming(false);
        return;
      }

      switch (conversationStage) {
        case CONVERSATION_STAGES.INITIAL:
          generateInitialResponseMutation.mutate(inputText);
          break;

        case CONVERSATION_STAGES.SYMPTOM_CONFIRMATION: {
          const hasAllRequiredInfo =
            (hasProvidedAgeGender ||
              (extractedInfo.age && extractedInfo.gender)) &&
            (hasProvidedDuration || extractedInfo.duration);

          if (hasAllRequiredInfo) {
            if (
              !hasProvidedAgeGender &&
              extractedInfo.age &&
              extractedInfo.gender
            ) {
              setHasProvidedAgeGender(true);
              setUserDemographics((prev) => ({
                ...prev,
                age: extractedInfo.age,
                gender: extractedInfo.gender,
              }));
              updateUserInfo({
                age: extractedInfo.age,
                gender: extractedInfo.gender,
              });
            }

            if (!hasProvidedDuration && extractedInfo.duration) {
              setHasProvidedDuration(true);
              setUserDemographics((prev) => ({
                ...prev,
                duration: extractedInfo.duration,
              }));
              updateUserInfo({ duration: extractedInfo.duration });
            }

            setConversationStage(CONVERSATION_STAGES.DEEP_DIVE);
            generateDeepDiveQuestions();
          } else {
            generateSymptomConfirmationMutation.mutate(inputText);
          }
          break;
        }

        case CONVERSATION_STAGES.AGE_GENDER_COLLECTION:
          if (showAgeGenderForm) {
            setIsStreaming(false);
            return;
          }
          if (hasProvidedAgeGender) {
            if (hasProvidedDuration) {
              setConversationStage(CONVERSATION_STAGES.DEEP_DIVE);
              generateDeepDiveQuestions();
            } else {
              const durationQuestion = isEnglish
                ? "Thank you. How long have you been experiencing these symptoms?"
                : "شكرًا لك. منذ متى وأنت تعاني من هذه الأعراض؟";
              addBotMessage(durationQuestion);
              setConversationStage(CONVERSATION_STAGES.SYMPTOM_CONFIRMATION);
              setIsStreaming(false);
            }
          } else {
            setShowAgeGenderForm(true);
            setIsStreaming(false);
          }
          break;

        case CONVERSATION_STAGES.DEEP_DIVE: {
          const hasAllInfo = userDemographics.age && userDemographics.gender;

          if (hasAllInfo) {
            generateFinalDiagnosisMutation.mutate(inputText);
          } else {
            const missingInfoResponse = isEnglish
              ? "To provide you with the best medical advice, I need to know your age and biological sex. Could you please share this information?"
              : "لتقديم أفضل نصيحة طبية لك، أحتاج إلى معرفة عمرك وجنسك البيولوجي. هل يمكنك مشاركة هذه المعلومات؟";

            addBotMessage(missingInfoResponse);
            setConversationStage(CONVERSATION_STAGES.AGE_GENDER_COLLECTION);
            setShowAgeGenderForm(true);
            setIsStreaming(false);
          }
          break;
        }

        case CONVERSATION_STAGES.FINAL_DIAGNOSIS:
          {
            const resetResponse = isEnglish
              ? "I've provided my assessment. Would you like to discuss another concern?"
              : "لقد قدمت تقييمي. هل ترغب في مناقشة قلق آخر؟";
            addBotMessage(resetResponse);
            setIsStreaming(false);
            setConversationStage(CONVERSATION_STAGES.INITIAL);
            setHasProvidedAgeGender(false);
            setHasProvidedDuration(false);
            setCollectedSymptoms([]);
          }
          break;

        default: {
          const prompt = isEnglish
            ? `The user says: "${inputText}". As a medical assistant, provide an appropriate medical response. Return only your response.`
            : `يقول المستخدم: "${inputText}". كمساعد طبي، قدم ردًا طبيًا مناسبًا. أعد ردك فقط.`;

          setIsStreaming(true);
          fetch(`${baseUrl}/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "qwen/qwen2.5-vl-72b-instruct",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful medical assistant. Return only your response.",
                },
                { role: "user", content: prompt },
              ],
              temperature: 0.3,
              max_tokens: 150,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              let botResponse = data.choices[0].message.content;
              botResponse = cleanAIResponse(botResponse);
              addBotMessage(botResponse);
              setIsStreaming(false);
            })
            .catch((error) => {
              console.error("Response error:", error);
              const fallbackResponse = isEnglish
                ? "Thank you for sharing. Could you provide more details about your medical concern?"
                : "شكرًا للمشاركة. هل يمكنك تقديم المزيد من التفاصيل حول قلقك الطبي؟";
              addBotMessage(fallbackResponse);
              setIsStreaming(false);
            });
        }
      }
    });

    setInputText("");
  }, [inputText, sessionLimitReached, isStreaming, isValidatingIntent, isEnglish, isArabic, conversationStage, addUserMessage, addBotMessage, validateMedicalQuestion, extractUserInfoFromMessage, generateInitialResponseMutation, generateSymptomConfirmationMutation, generateDeepDiveQuestions, generateFinalDiagnosisMutation, createBotMessage, hasProvidedAgeGender, hasProvidedDuration, showAgeGenderForm, userDemographics, updateUserInfo,
  ]);

  const startNewConversation = useCallback(() => {
    setMessages([]); setInputText(""); resetSession(); setConversationStage(CONVERSATION_STAGES.INITIAL); setShowAgeGenderForm(false); setUserDemographics({ age: "", gender: "", duration: "" }); setHasProvidedAgeGender(false); setHasProvidedDuration(false); setCollectedSymptoms([]); setApiError(null); setIsStreaming(false); setIsValidatingIntent(false);
  }, [resetSession]);

  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !sessionLimitReached &&
        !isStreaming &&
        !isValidatingIntent
      ) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage, sessionLimitReached, isStreaming, isValidatingIntent]
  );

  const autoResizeTextarea = useCallback((textareaRef) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleVoiceTextConverted = useCallback((text) => {
    setInputText((prev) => (prev ? prev + " " + text : text));
  }, []);

  return {
    messages, inputText, setInputText, isStreaming: isStreaming || isValidatingIntent, handleSendMessage, handleKeyDown, autoResizeTextarea, startNewConversation, userInfo, apiError, conversationStage, showAgeGenderForm, handleAgeGenderSubmit, userDemographics, handleVoiceTextConverted,
  };
};

export { CONVERSATION_STAGES, useChatBot };
