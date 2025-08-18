// MedicalAssistant এর সমস্ত লজিক (Mutation, API কল, Stream হ্যান্ডেল)
import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { useRef, useState } from "react";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";

export const useMedicalAssistant = () => {
    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState("");
    const responseDivRef = useRef(null);

    // ভাষা ডিটেক্ট করা (শুধু ইংরেজি/আরবি)
    const detectLanguage = (text) => {
        return /[a-zA-Z]/.test(text) || /[\u0600-\u06FF]/.test(text);
    };

    // রিয়্যাক্ট কুয়েরির মিউটেশন হুক
    const sendMessageMutation = useMutation({
        mutationFn: async (inputText) => {
            setResponse("🔄 Analyzing Symptoms...");

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

            return response.body;
        },
        onSuccess: (readableStream) => {
            const reader = readableStream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split("\n");

                        for (const line of lines) {
                            if (line.startsWith("data:") && line !== "data: [DONE]") {
                                try {
                                    const data = JSON.parse(line.substring(5));
                                    const token = data.choices?.[0]?.delta?.content;

                                    if (token) {
                                        fullResponse += token;
                                        setResponse(marked.parse(fullResponse));
                                        if (responseDivRef.current) {
                                            responseDivRef.current.scrollTop =
                                                responseDivRef.current.scrollHeight;
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parsing JSON:", e);
                                }
                            }
                        }
                    }
                } catch (error) {
                    setResponse(
                        `<span style="color: red">Stream Error: ${error.message}</span>`
                    );
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

    // মেসেজ পাঠানো
    const handleSendMessage = () => {
        if (!userInput.trim()) {
            setResponse("Please enter a message.");
            return;
        }

        if (!detectLanguage(userInput)) {
            setResponse(
                `<span style="color:red">
                    I only accept questions in English or Arabic. Please ask in English or Arabic.
                </span>`
            );
            return;
        }

        sendMessageMutation.mutate(userInput);
    };

    return {
        userInput,
        setUserInput,
        response,
        responseDivRef,
        sendMessageMutation,
        handleSendMessage,
    };
};
