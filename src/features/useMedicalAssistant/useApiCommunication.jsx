import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";

const useApiCommunication = (setResponse, responseDivRef, conversationHistory, setConversationHistory) => {
    const { language } = useLanguage();

    const sendMessageMutation = useMutation({
        mutationFn: async (userMessage, { retry = 0 } = {}) => {
            try {
                const languageSpecificPrompt = language === 'english'
                    ? `${cornerCases}\n\nPlease respond in English only and include SPECIALTY_RECOMMENDATION : [specialty name] in your response.`
                    : `${cornerCases}\n\nيرجى الرد باللغة العربية فقط وتضمين SPECIALTY_RECOMMENDATION : [specialty name] في ردك.`;

                const messages = [
                    { role: "system", content: languageSpecificPrompt },
                    ...conversationHistory.map(msg => ({
                        role: msg.sender === "user" ? "user" : "assistant",
                        content: msg.text
                    })),
                    { role: "user", content: userMessage }
                ];

                const response = await fetch(`${baseUrl}/completions`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        // model: "deepseek/deepseek-r1:free",
                        model: "mistralai/mistral-small-24b-instruct-2501:free",
                        messages: messages,
                        temperature: 0,
                        stream: true,
                        max_tokens: 1000,
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
                                            setResponse(marked.parse(fullResponse));
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

                    let finalResponse = marked.parse(fullResponse);
                    finalResponse = finalResponse.replace(/SPECIALTY_RECOMMENDATION : \[.*?\]/, "");

                    setResponse(finalResponse);

                    const newAiMessage = {
                        sender: "assistant",
                        text: finalResponse,
                        timestamp: new Date().toLocaleTimeString()
                    };

                    setConversationHistory(prev => [...prev, newAiMessage]);

                } catch (error) {
                    const errorMessage = isArabic
                        ? `<span style="color: red">خطأ في معالجة الاستجابة: ${error.message}</span>`
                        : `<span style="color: red">Response processing error: ${error.message}</span>`;

                    setResponse(errorMessage);

                    const newErrorMessage = {
                        sender: "assistant",
                        text: errorMessage,
                        timestamp: new Date().toLocaleTimeString()
                    };

                    setConversationHistory(prev => [...prev, newErrorMessage]);
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

            const newErrorMessage = {
                sender: "assistant",
                text: errorMessage,
                timestamp: new Date().toLocaleTimeString()
            };

            setConversationHistory(prev => [...prev, newErrorMessage]);
        }
    });

    return { sendMessageMutation };
};

export default useApiCommunication;