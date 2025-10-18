import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import { formatResponseWithSources } from "../../utils/sourceExtractor";

const useApiCommunication = (setResponse, responseDivRef) => {
    const { language } = useLanguage();
    const { userInfo } = useSession();

    const sendMessageMutation = useMutation({
        mutationFn: async (userMessage, { retry = 0 } = {}) => {
            try {
                const languageSpecificPrompt = language === 'english'
                    ? `${cornerCases}\n\nPatient Context: ${userInfo.age ? `Age: ${userInfo.age}` : 'Age not provided'}, ${userInfo.gender ? `Gender: ${userInfo.gender}` : 'Gender not provided'}, ${userInfo.symptoms ? `Symptoms: ${userInfo.symptoms}` : 'Symptoms not provided'}. Please respond in English only and include 2-3 credible medical sources in [Source: Organization - URL] format.`
                    : `${cornerCases}\n\nسياق المريض: ${userInfo.age ? `العمر: ${userInfo.age}` : 'العمر غير مقدم'}, ${userInfo.gender ? `الجنس: ${userInfo.gender}` : 'الجنس غير مقدم'}, ${userInfo.symptoms ? `الأعراض: ${userInfo.symptoms}` : 'الأعراض غير مقدم'}. يرجى الرد باللغة العربية فقط وتضمين 2-3 مصادر طبية موثوقة بتنسيق [Source: Organization - URL].`;

                console.log('Sending request with prompt:', languageSpecificPrompt); // Debug log

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
                            { role: "user", content: userMessage }
                        ],
                        temperature: 0,
                        stream: true,
                        max_tokens: 1500,
                    }),
                });

                if (!response.ok) {
                    let errorMessage = `HTTP error! status: ${response.status}`;

                    if (response.status === 429) {
                        errorMessage = "Too Many Requests - Rate limit exceeded";
                    } else {
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.error?.message || errorMessage;
                        } catch {
                            // Ignore JSON parsing errors
                        }
                    }

                    throw new Error(errorMessage);
                }

                return {
                    stream: response.body,
                    language: language,
                    userMessage: userMessage
                };
            } catch (error) {
                if (error.message.includes('429') && retry < 2) {
                    const waitTime = 2000 * (retry + 1);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return sendMessageMutation.mutateAsync(userMessage, { retry: retry + 1 });
                }
                throw error;
            }
        },
        onSuccess: (data) => {
            const { stream, language } = data;
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";
            let buffer = "";
            const isArabic = language === 'arabic';

            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        buffer += chunk;

                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (line.startsWith("data:") && line !== "data: [DONE]") {
                                try {
                                    const data = JSON.parse(line.substring(5));
                                    const token = data.choices?.[0]?.delta?.content;

                                    if (token) {
                                        fullResponse += token;
                                        if (fullResponse.length % 5 === 0 || token.includes("\n")) {
                                            setResponse(marked.parse(formatResponseWithSources(fullResponse, isArabic)));
                                        }
                                    }
                                } catch (e) {
                                    console.warn("Non-JSON line:", line);
                                    console.error(e);
                                }
                            }
                        }

                        if (responseDivRef.current) {
                            responseDivRef.current.scrollTop = responseDivRef.current.scrollHeight;
                        }
                    }

                    let finalResponse = marked.parse(formatResponseWithSources(fullResponse, isArabic));
                    finalResponse = finalResponse.replace(/SPECIALTY_RECOMMENDATION : \[.*?\]/, "");

                    setResponse(finalResponse);

                } catch (error) {
                    const errorMessage = isArabic
                        ? `<span style="color: red">خطأ في معالجة الاستجابة: ${error.message}</span>`
                        : `<span style="color: red">Response processing error: ${error.message}</span>`;

                    setResponse(errorMessage);
                } finally {
                    reader.releaseLock();
                }
            };

            processStream();
        },
        onError: (error) => {
            const isArabic = language === 'arabic';

            let errorMessage;
            if (error.message.includes('429') || error.message.includes('Too Many Requests') || error.message.includes('Rate limit')) {
                errorMessage = isArabic
                    ? "<span style='color:orange'>⚠️ عدد الطلبات كبير جدًا. يرجى الانتظار بضع ثوانٍ ثم المحاولة مرة أخرى.</span>"
                    : "<span style='color:orange'>⚠️ Too many requests. Please wait a few seconds and try again.</span>";
            } else if (error.message.includes('Provider returned error')) {
                errorMessage = isArabic
                    ? "<span style='color:red'>⚠️ مزود الخدمة عاد بخطأ. قد يكون الخادم مشغولاً.</span>"
                    : "<span style='color:red'>⚠️ Provider returned an error. The server may be busy.</span>";
            } else {
                errorMessage = isArabic
                    ? `<span style="color:red">خطأ: ${error.message}</span>`
                    : `<span style="color:red">Error: ${error.message}</span>`;
            }

            setResponse(errorMessage);
        }
    });

    return { sendMessageMutation };
};

export default useApiCommunication;