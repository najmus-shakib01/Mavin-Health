import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatResponseWithSources } from "../../utils/sourceExtractor";

const useApiCommunication = (setMessages, setIsProcessing) => {
  const { language } = useLanguage();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ userMessage, systemPrompt, loadingMessageId }, { retry = 0 } = {}) => {
      try {
        const response = await fetch(`${baseUrl}/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "qwen/qwen2.5-vl-72b-instruct",
            // model: "mistralai/mistral-small-24b-instruct-2501",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
            temperature: 0,
            stream: true,
            max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          const errorMessage = response.status === 429
            ? "Too Many Requests - Rate limit exceeded"
            : `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        return {
          stream: response.body,
          language,
          userMessage,
          loadingMessageId
        };
      } catch (error) {
        if (error.message.includes('429') && retry < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (retry + 1)));
          return sendMessageMutation.mutateAsync({ userMessage, systemPrompt, loadingMessageId }, { retry: retry + 1 });
        }
        throw error;
      }
    },
    onSuccess: (data) => processStreamResponse(data, setMessages, setIsProcessing),
    onError: (error) => handleApiError(error, language, setMessages, setIsProcessing),
  });

  return { sendMessageMutation };
};

const processStreamResponse = async (data, setMessages, setIsProcessing) => {
  const { stream, language, loadingMessageId } = data;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";
  const isArabic = language === 'arabic';

  try {
    setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));

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
              updateStreamingMessage(setMessages, fullResponse, isArabic);
            }
          } catch (e) {
            console.warn("Non-JSON line:", line);
            console.error("error:", e);
          }
        }
      }
    }

    finalizeMessage(setMessages, fullResponse, isArabic);
  } catch (error) {
    handleStreamError(error, isArabic, setMessages);
  } finally {
    reader.releaseLock();
    setIsProcessing(false);
  }
};

const updateStreamingMessage = (setMessages, fullResponse, isArabic) => {
  setMessages(prev => {
    const lastMessage = prev[prev.length - 1];
    const formattedResponse = marked.parse(formatResponseWithSources(fullResponse, isArabic));

    if (lastMessage?.sender === "bot" && !lastMessage.isLoading) {
      return [
        ...prev.slice(0, -1),
        { ...lastMessage, text: formattedResponse }
      ];
    } else {
      return [
        ...prev,
        {
          id: Date.now(),
          text: formattedResponse,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString()
        }
      ];
    }
  });
};

const finalizeMessage = (setMessages, fullResponse, isArabic) => {
  let finalResponse = marked.parse(formatResponseWithSources(fullResponse, isArabic));
  finalResponse = finalResponse.replace(/SPECIALTY_RECOMMENDATION : \[.*?\]/, "");

  setMessages(prev => {
    const lastMessage = prev[prev.length - 1];

    if (lastMessage?.sender === "bot") {
      return [
        ...prev.slice(0, -1),
        {
          ...lastMessage,
          text: finalResponse,
          timestamp: new Date().toLocaleTimeString()
        }
      ];
    }

    return prev;
  });
};

const handleApiError = (error, language, setMessages, setIsProcessing) => {
  const isArabic = language === 'arabic';
  let errorMessage;

  if (error.message.includes('429')) {
    errorMessage = isArabic
      ? "<span style='color:orange'>⚠️ عدد الطلبات كبير. يرجى الانتظار.</span>"
      : "<span style='color:orange'>⚠️ Too many requests. Please wait.</span>";
  } else {
    errorMessage = isArabic
      ? `<span style="color:red">خطأ: ${error.message}</span>`
      : `<span style="color:red">Error: ${error.message}</span>`;
  }

  setMessages(prev => {
    const filtered = prev.filter(msg => !msg.isLoading);
    return [
      ...filtered,
      {
        id: Date.now(),
        text: errorMessage,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });

  setIsProcessing(false);
};

const handleStreamError = (error, isArabic, setMessages) => {
  const errorMessage = isArabic
    ? `<span style="color: red">خطأ في المعالجة: ${error.message}</span>`
    : `<span style="color: red">Processing error: ${error.message}</span>`;

  setMessages(prev => {
    const filtered = prev.filter(msg => !msg.isLoading);
    return [
      ...filtered,
      {
        id: Date.now(),
        text: errorMessage,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });
};

export default useApiCommunication;