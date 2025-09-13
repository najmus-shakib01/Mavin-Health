import { marked } from "marked";

export const useStreamHandler = (setMessages) => {
  const processStream = async (data) => {
    const { stream, language } = data;
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";
    const isArabic = language === 'arabic';

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
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.sender === "bot" && lastMessage.isStreaming) {
                      return [
                        ...prev.slice(0, -1),
                        {
                          ...lastMessage,
                          text: marked.parse(fullResponse),
                          isStreaming: true
                        }
                      ];
                    }
                    return prev;
                  });
                }
              }
            } catch (e) {
              console.error("Error parsing JSON:", e, "Line:", line);
            }
          }
        }
      }

      let finalResponse = marked.parse(fullResponse);
      finalResponse = finalResponse.replace(/SPECIALTY_RECOMMENDATION : \[.*?\]/, "");

      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.sender === "bot" && lastMessage.isStreaming) {
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

    } catch (error) {
      const errorMessage = isArabic
        ? `<span style="color: red">خطأ في البث: ${error.message}</span>`
        : `<span style="color: red">Stream Error: ${error.message}</span>`;

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: errorMessage,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } finally {
      reader.releaseLock();
    }
  };

  return {
    processStream
  };
};