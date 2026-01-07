import { marked } from "marked";
import sanitizeHtml from "../../utils/sanitizeHtml";
import { extractCTAFromResponse, extractSourcesFromResponse, extractSpecialistFromResponse, formatResponseWithSources } from "../../utils/sourceExtractor";

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
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
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
      return [
        ...prev.slice(0, -1),
        { ...last, text: safeHtml, isStreaming: true },
      ];
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
  const sources = extractSourcesFromResponse(fullResponse);
  const specialist = extractSpecialistFromResponse(fullResponse);
  const cta = extractCTAFromResponse(fullResponse);
  
  let cleanText = fullResponse
    .replace(/MEDICAL_SOURCE:\s*[^\n]+/gi, "")
    .replace(/SPECIALIST_RECOMMENDATION:\s*[^\n]+/i, "")
    .replace(/CTA:\s*[^\n]+/i, "")
    .trim();
  
  let html = marked.parse(cleanText);
  
  if (specialist) {
    const specialistHeader = isArabic ? "👨‍⚕️ الأخصائي الموصى به:" : "👨‍⚕️ Recommended Specialist:";
    html += `<div class="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
      <strong class="text-green-800 dark:text-green-300 text-sm">${specialistHeader}</strong>
      <p class="text-green-700 dark:text-green-400 text-sm mt-1">${specialist}</p>
    </div>`;
  }
  
  if (cta) {
    const ctaHeader = isArabic ? "📋 الخطوات التالية الموصى بها:" : "📋 Recommended Next Steps:";
    html += `<div class="mt-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
      <strong class="text-purple-800 dark:text-purple-300 text-sm">${ctaHeader}</strong>
      <p class="text-purple-700 dark:text-purple-400 text-sm mt-1">${cta}</p>
    </div>`;
  }
  
  if (sources.length > 0) {
    const sourcesHeader = isArabic ? "📚 المراجع الطبية:" : "📚 Medical References:";
    const sourcesHtml = sources.map(source => 
      `<a href="${source.url}" target="_blank" rel="noopener noreferrer" 
         class="${source.isSearch ? 'text-orange-600' : 'text-blue-600'} hover:underline">
        • ${source.name}${source.isSearch ? ' (Search Medical Information)' : ''}
      </a>`
    ).join('<br>');
    
    html += `<div class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <strong class="text-blue-800 dark:text-blue-300 text-sm">${sourcesHeader}</strong>
      <div class="mt-2 space-y-1 text-sm">${sourcesHtml}</div>
    </div>`;
  }

  const safeHtml = sanitizeHtml(html);
  
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
    ? `<span style="color: red">خطأ في معالجة الاستجابة: ${escapeHtml(
        error?.message || "Unknown error"
      )}</span>`
    : `<span style="color: red">Stream Error: ${escapeHtml(
        error?.message || "Unknown error"
      )}</span>`;

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
