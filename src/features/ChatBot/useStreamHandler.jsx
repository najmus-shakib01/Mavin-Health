import { marked } from "marked";

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
                  } else {
                    return [
                      ...prev,
                      {
                        id: Date.now(),
                        text: marked.parse(fullResponse),
                        sender: "bot",
                        isStreaming: true,
                        timestamp: new Date().toLocaleTimeString()
                      }
                    ];
                  }
                });
              }
            } catch (e) {
              console.warn("JSON parsing error:", e, "Line:", line);
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
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              text: finalResponse,
              sender: "bot",
              isStreaming: false,
              timestamp: new Date().toLocaleTimeString()
            }
          ];
        }
      });

    } catch (error) {
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
    } finally {
      reader.releaseLock();
    }
  };

  return {
    processStream
  };
};