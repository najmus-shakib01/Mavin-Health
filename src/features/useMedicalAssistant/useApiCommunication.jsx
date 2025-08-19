import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";

export const useApiCommunication = (setResponse, setMedicalHistory, saveHistoryToStorage, responseDivRef) => {
    const sendMessageMutation = useMutation({
        mutationFn: async (inputText) => {
            setResponse("🔄 Analyzing symptoms with medical database...");

            // Detect language for response formatting
            const isArabic = /[\u0600-\u06FF]/.test(inputText);
            const detectedLanguage = isArabic ? 'Arabic' : 'English';

            const response = await fetch(`${baseUrl}/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [
                        { role: "system", content: cornerCases },
                        { role: "user", content: inputText },
                    ],
                    temperature: 0,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { stream: response.body, language: detectedLanguage, query: inputText };
        },
        onSuccess: (data) => {
            const { stream, language, query } = data;
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";
            let buffer = "";

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
                                        if (fullResponse.length % 10 === 0 || token.includes('\n')) {
                                            // নতুন রেসপন্স অবজেক্ট তৈরি করে স্টেট আপডেট করে
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

                    // সম্পূর্ণ রেসপন্স সেট
                    const parsedResponse = marked.parse(fullResponse);
                    setResponse(parsedResponse);

                    // নতুন হিস্টোরি আইটেম তৈরি
                    const newHistoryItem = {
                        query,
                        response: parsedResponse,
                        language,
                        time: new Date().toLocaleTimeString(),
                        id: Date.now() // ইউনিক আইডি
                    };

                    // হিস্টোরি আপডেট 
                    setMedicalHistory(prevHistory => {
                        const updatedHistory = [...prevHistory, newHistoryItem];
                        // লোকাল স্টোরেজে সেভ 
                        saveHistoryToStorage(updatedHistory);
                        return updatedHistory;
                    });

                } catch (error) {
                    setResponse(`<span style="color: red">Stream Error: ${error.message}</span>`);
                } finally {
                    reader.releaseLock();
                }
            };

            processStream();
        },
        onError: (error) => {
            setResponse(`<span style="color: red">Error: ${error.message}</span>`);
        },
    });

    return { sendMessageMutation };
};