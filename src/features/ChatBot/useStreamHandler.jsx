import { marked } from "marked";
import { formatResponseWithSources } from "../../utils/sourceExtractor";

export const useStreamHandler = (setMessages, isArabic) => {
  const processStream = async (data) => {
    const { stream } = data;
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

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
              console.warn("JSON parsing error:", e, "Line:", line);
            }
          }
        }
      }

      finalizeMessage(setMessages, fullResponse, isArabic);
    } catch (error) {
      handleStreamError(setMessages, error, isArabic);
    } finally {
      reader.releaseLock();
    }
  };

  return { processStream };
};

const updateStreamingMessage = (setMessages, fullResponse, isArabic) => {
  setMessages(prev => {
    const lastMessage = prev[prev.length - 1];
    const formattedResponse = marked.parse(formatResponseWithSources(fullResponse, isArabic));

    if (lastMessage?.sender === "bot" && lastMessage.isStreaming) {
      return [
        ...prev.slice(0, -1),
        { ...lastMessage, text: formattedResponse, isStreaming: true }
      ];
    } else {
      return [
        ...prev,
        {
          id: Date.now(),
          text: formattedResponse,
          sender: "bot",
          isStreaming: true,
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

    if (lastMessage?.sender === "bot" && lastMessage.isStreaming) {
      return [
        ...prev.slice(0, -1),
        {
          ...lastMessage,
          text: finalResponse,
          isStreaming: false,
          timestamp: new Date().toLocaleTimeString()
        }
      ];
    }

    return prev;
  });
};

const handleStreamError = (setMessages, error, isArabic) => {
  console.error("Stream processing error:", error);
  const errorMessage = isArabic
    ? `<span style="color: red">خطأ في معالجة الاستجابة: ${error.message}</span>`
    : `<span style="color: red">Stream Error: ${error.message}</span>`;

  setMessages(prev => [
    ...prev.filter(msg => !msg.isStreaming),
    {
      id: Date.now(),
      text: errorMessage,
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
};