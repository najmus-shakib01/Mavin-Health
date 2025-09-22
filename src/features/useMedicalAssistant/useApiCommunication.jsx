import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { useLanguage } from "../../contexts/LanguageContext";

const useApiCommunication = (setResponse, responseDivRef) => {
    const { language } = useLanguage();

    const sendMessageMutation = useMutation({
        mutationFn: async (inputText) => {
            setResponse(language === 'english'
                ? "🔄 Analyzing Symptoms With Medical Database..."
                : "🔄 جاري تحليل الأعراض مع قاعدة البيانات الطبية...");

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
                                        if (fullResponse.length % 10 === 0 || token.includes("\n")) {
                                            setResponse(marked.parse(fullResponse));
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parsing JSON:", e, "Line:", line);
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

                } catch (error) {
                    setResponse(isArabic
                        ? `<span style="color: red">خطأ في البث: ${error.message}</span>`
                        : `<span style="color: red">Stream Error: ${error.message}</span>`
                    );
                } finally {
                    reader.releaseLock();
                }
            };

            processStream();
        },
        onError: (error) => {
            const isArabic = language === 'arabic';
            setResponse(isArabic
                ? `<span style="color:red">خطأ: ${error.message}</span>`
                : `<span style="color:red">Error: ${error.message}</span>`
            );
        }
    });

    return { sendMessageMutation };
};

export default useApiCommunication;