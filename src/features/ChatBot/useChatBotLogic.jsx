import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";
import { sampleProducts } from "./sampleProducts";

export const useChatBotLogic = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your medical assistant. How can I help you today?",
            sender: "bot",
            timestamp: new Date(),
            type: "text",
        },
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputText]);

    const sendMessageMutation = useMutation({
        mutationFn: async (messageText) => {
            const language = localStorage.getItem("language") || "english";
            const languageSpecificPrompt =
                language === "english"
                    ? `${cornerCases}\n\nPlease respond in English only.`
                    : `${cornerCases}\n\nيرجى الرد باللغة العربية فقط.`;

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
                        { role: "user", content: messageText },
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
        onSuccess: (stream, variables) => {
            const language = localStorage.getItem("language") || "english";
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            const isProductQuery =
                variables.toLowerCase().includes("glass") ||
                variables.toLowerCase().includes("uv") ||
                variables.toLowerCase().includes("sunglass");

            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split("\n");

                        for (const line of lines) {
                            if (line.startsWith("data:") && line !== "data: [DONE]") {
                                try {
                                    const data = JSON.parse(line.substring(5));
                                    const token = data.choices?.[0]?.delta?.content;

                                    if (token) {
                                        fullResponse += token;

                                        setMessages((prev) =>
                                            prev.map((msg, index) =>
                                                index === prev.length - 1
                                                    ? { ...msg, text: marked.parse(fullResponse) }
                                                    : msg
                                            )
                                        );
                                    }
                                } catch (e) {
                                    console.error("Error parsing JSON:", e);
                                }
                            }
                        }
                    }

                    if (isProductQuery) {
                        setTimeout(() => {
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: Date.now() + 2,
                                    text: language === "english"
                                        ? "Here are some products that match your needs:"
                                        : "إليك بعض المنتجات التي تناسب احتياجاتك:",
                                    sender: "bot",
                                    timestamp: new Date(),
                                    type: "text",
                                },
                                ...sampleProducts.map((product, index) => ({
                                    id: Date.now() + 3 + index,
                                    product: product,
                                    sender: "bot",
                                    timestamp: new Date(),
                                    type: "product",
                                })),
                            ]);
                        }, 1000);
                    }
                } catch (error) {
                    console.error("Stream error:", error);
                } finally {
                    reader.releaseLock();
                }
            };

            processStream();
        },
        onError: (error) => {
            const language = localStorage.getItem("language") || "english";
            const errorMessage =
                language === "english"
                    ? `Error: ${error.message}`
                    : `خطأ: ${error.message}`;

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    text: errorMessage,
                    sender: "bot",
                    timestamp: new Date(),
                    type: "text",
                },
            ]);
        },
    });

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        const language = localStorage.getItem("language") || "english";

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: "user",
            timestamp: new Date(),
            type: "text",
        };

        setMessages((prev) => [...prev, userMessage]);

        const loadingMessage = {
            id: Date.now() + 1,
            text:
                language === "english"
                    ? "Analyzing your query..."
                    : "جاري تحليل استفسارك...",
            sender: "bot",
            timestamp: new Date(),
            type: "text",
            isLoading: true,
        };

        setMessages((prev) => [...prev, loadingMessage]);
        setInputText("");

        sendMessageMutation.mutate(inputText);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return {
        messages,
        inputText,
        setInputText,
        messagesEndRef,
        textareaRef,
        sendMessageMutation,
        handleSendMessage,
        handleKeyPress,
        scrollToBottom
    };
};