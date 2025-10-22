import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatResponseWithSources } from "../../utils/sourceExtractor";

const useApiCommunication = (setResponse, responseDivRef) => {
  const { language } = useLanguage();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ userMessage, systemPrompt }, { retry = 0 } = {}) => {
      try {
        const response = await fetch(`${baseUrl}/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "mistralai/mistral-small-24b-instruct-2501:free",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
            temperature: 0, stream: true, max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          const errorMessage = response.status === 429
            ? "Too Many Requests - Rate limit exceeded"
            : `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        return { stream: response.body, language, userMessage };
      } catch (error) {
        if (error.message.includes('429') && retry < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (retry + 1)));
          return sendMessageMutation.mutateAsync({ userMessage, systemPrompt }, { retry: retry + 1 });
        }
        throw error;
      }
    },
    onSuccess: (data) => processStreamResponse(data, setResponse, responseDivRef),
    onError: (error) => handleApiError(error, language, setResponse),
  });

  return { sendMessageMutation };
};

const processStreamResponse = async (data, setResponse, responseDivRef) => {
  const { stream, language } = data;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";
  const isArabic = language === 'arabic';

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
              if (fullResponse.length % 5 === 0) {
                setResponse(marked.parse(formatResponseWithSources(fullResponse, isArabic)));

                if (responseDivRef.current) {
                  const { scrollTop, scrollHeight, clientHeight } = responseDivRef.current;
                  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

                  if (isAtBottom) {
                    responseDivRef.current.scrollTop = scrollHeight;
                  }
                }
              }
            }
          } catch (e) {
            console.warn("Non-JSON line:", line);
            console.error("error:", e);
          }
        }
      }
    }

    const finalResponse = marked.parse(formatResponseWithSources(fullResponse, isArabic)).replace(/SPECIALTY_RECOMMENDATION : \[.*?\]/, "");
    setResponse(finalResponse);

    if (responseDivRef.current) {
      setTimeout(() => {
        responseDivRef.current.scrollTop = responseDivRef.current.scrollHeight;
      }, 100);
    }
  } catch (error) {
    handleStreamError(error, isArabic, setResponse);
  } finally {
    reader.releaseLock();
  }
};

const handleApiError = (error, language, setResponse) => {
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

  setResponse(errorMessage);
};

const handleStreamError = (error, isArabic, setResponse) => {
  const errorMessage = isArabic
    ? `<span style="color: red">خطأ في المعالجة: ${error.message}</span>`
    : `<span style="color: red">Processing error: ${error.message}</span>`;
  setResponse(errorMessage);
};

export default useApiCommunication;