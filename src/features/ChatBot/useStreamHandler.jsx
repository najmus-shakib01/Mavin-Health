import { marked } from "marked";
import { formatResponseWithSources } from "../../utils/sourceExtractor";
import sanitizeHtml from "../../utils/sanitizeHtml";

export const useStreamHandler = (setMessages, isArabic, options = {}) => {
  const { onStreamStart, onStreamEnd } = options;

  const processStream = async (data) => {
    const { stream } = data;

    if (!stream) {
      throw new Error("No response stream received");
    }

    onStreamStart?.();

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
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          if (trimmed === "data: [DONE]") continue;

          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          try {
            const json = JSON.parse(payload);
            const token =
              json?.choices?.[0]?.delta?.content ??
              json?.choices?.[0]?.message?.content ??
              "";

            if (typeof token === "string" && token.length > 0) {
              fullResponse += token;
              updateStreamingMessage(setMessages, fullResponse, isArabic);
            }
          } catch {
            // ignore non-JSON keep-alives
          }
        }
      }

      finalizeMessage(setMessages, fullResponse, isArabic);
    } catch (error) {
      handleStreamError(setMessages, error, isArabic);
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }

      // Ensure last streaming bubble is marked completed
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.sender === "bot" && last.isStreaming) {
          return [...prev.slice(0, -1), { ...last, isStreaming: false }];
        }
        return prev;
      });

      onStreamEnd?.();
    }
  };

  return { processStream };
};

const buildSafeHtml = (rawText, isArabic) => {
  const html = marked.parse(formatResponseWithSources(rawText, isArabic));
  return sanitizeHtml(html);
};

const cryptoSafeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const updateStreamingMessage = (setMessages, fullResponse, isArabic) => {
  setMessages((prev) => {
    const last = prev[prev.length - 1];
    const safeHtml = buildSafeHtml(fullResponse, isArabic);

    if (last?.sender === "bot" && last.isStreaming) {
      return [...prev.slice(0, -1), { ...last, text: safeHtml, isStreaming: true }];
    }

    return [
      ...prev,
      {
        id: cryptoSafeId(),
        text: safeHtml,
        sender: "bot",
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ];
  });
};

const finalizeMessage = (setMessages, fullResponse, isArabic) => {
  let safeHtml = buildSafeHtml(fullResponse, isArabic);

  // Back-compat cleanup (typo variants)
  safeHtml = safeHtml.replace(/SPECIALTY_RECOMMENDATION\s*:\s*\[.*?\]/gi, "");
  safeHtml = safeHtml.replace(/SPECIALIST_RECOMMENDATION\s*:\s*[^\n<]+/gi, "");

  setMessages((prev) => {
    const last = prev[prev.length - 1];

    if (last?.sender === "bot" && last.isStreaming) {
      return [
        ...prev.slice(0, -1),
        {
          ...last,
          text: safeHtml,
          isStreaming: false,
          timestamp: new Date().toLocaleTimeString(),
        },
      ];
    }

    return prev;
  });
};

const handleStreamError = (setMessages, error, isArabic) => {
  console.error("Stream processing error:", error);

  const msg = isArabic
    ? `<span style="color: red">خطأ في معالجة الاستجابة: ${escapeHtml(error?.message || "Unknown error")}</span>`
    : `<span style="color: red">Stream Error: ${escapeHtml(error?.message || "Unknown error")}</span>`;

  setMessages((prev) => [
    ...prev.filter((m) => !m.isStreaming),
    {
      id: cryptoSafeId(),
      text: sanitizeHtml(msg),
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
};
