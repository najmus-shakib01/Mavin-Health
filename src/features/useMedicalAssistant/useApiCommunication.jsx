import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatResponseWithSources } from "../../utils/sourceExtractor";
import sanitizeHtml from "../../utils/sanitizeHtml";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const useApiCommunication = (setMessages, setIsProcessing) => {
  const { language } = useLanguage();
  const isArabic = language === "arabic";

  const sendMessageMutation = useMutation({
    mutationFn: async ({ userMessage, systemPrompt, loadingMessageId }, { retry = 0 } = {}) => {
      setIsProcessing(true);

      try {
        const response = await fetch(`${baseUrl}/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen/qwen2.5-vl-72b-instruct",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0,
            stream: true,
            max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          const errorMessage =
            response.status === 429 ? "Too Many Requests - Rate limit exceeded" : `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        return { stream: response.body, isArabic, loadingMessageId };
      } catch (error) {
        if (String(error?.message || "").includes("429") && retry < 2) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * (retry + 1)));
          return sendMessageMutation.mutateAsync({ userMessage, systemPrompt, loadingMessageId }, { retry: retry + 1 });
        }
        throw error;
      }
    },

    onSuccess: async (data) => {
      const { stream, isArabic, loadingMessageId } = data;

      setMessages((prev) => prev.filter((m) => m.id !== loadingMessageId));

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let fullResponse = "";
      let buffer = "";

      const updateBot = (rawText) => {
        const html = sanitizeHtml(marked.parse(formatResponseWithSources(rawText, isArabic)));

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === "bot" && last.isStreaming) {
            return [...prev.slice(0, -1), { ...last, text: html }];
          }

          return [
            ...prev,
            {
              id: createId(),
              text: html,
              sender: "bot",
              isStreaming: true,
              timestamp: new Date().toLocaleTimeString(),
            },
          ];
        });
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:") || trimmed === "data: [DONE]") continue;

            const payload = trimmed.slice(5).trim();
            if (!payload) continue;

            try {
              const json = JSON.parse(payload);
              const token =
                json?.choices?.[0]?.delta?.content ??
                json?.choices?.[0]?.message?.content ??
                "";

              if (token) {
                fullResponse += token;
                updateBot(fullResponse);
              }
            } catch {
              // ignore
            }
          }
        }

        // finalize: mark last bot bubble isStreaming=false
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === "bot" && last.isStreaming) {
            return [...prev.slice(0, -1), { ...last, isStreaming: false, timestamp: new Date().toLocaleTimeString() }];
          }
          return prev;
        });
      } catch (error) {
        const msg = isArabic
          ? `<span style="color: red">خطأ في المعالجة: ${String(error?.message || "Unknown error")}</span>`
          : `<span style="color: red">Processing error: ${String(error?.message || "Unknown error")}</span>`;

        setMessages((prev) => [
          ...prev.filter((m) => !m.isLoading),
          { id: createId(), text: sanitizeHtml(msg), sender: "bot", timestamp: new Date().toLocaleTimeString() },
        ]);
      } finally {
        try {
          reader.releaseLock();
        } catch {
          // ignore
        }
        setIsProcessing(false);
      }
    },

    onError: (error) => {
      const errText = String(error?.message || "Unknown error");
      const msg = errText.includes("429")
        ? isArabic
          ? "<span style='color:orange'>⚠️ عدد الطلبات كبير. يرجى الانتظار.</span>"
          : "<span style='color:orange'>⚠️ Too many requests. Please wait.</span>"
        : isArabic
        ? `<span style="color:red">خطأ: ${errText}</span>`
        : `<span style="color:red">Error: ${errText}</span>`;

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        { id: createId(), text: sanitizeHtml(msg), sender: "bot", timestamp: new Date().toLocaleTimeString() },
      ]);

      setIsProcessing(false);
    },
  });

  return { sendMessageMutation };
};

export default useApiCommunication;
