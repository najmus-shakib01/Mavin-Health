import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { marked } from 'marked';
import { useEffect, useRef, useState } from 'react';
import { default as Error, default as Loader } from '../../components/Error';
import { apiKey, baseUrl } from '../../constants/env.constants';
import { cornerCases } from '../../constants/env.cornercase';
import PageTitle from "../../utils/PageTitle";

const MedicalAssistant = () => {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [, setIsEnglish] = useState(false);
  const [, setIsArabic] = useState(false);
  const textareaRef = useRef(null);
  const responseDivRef = useRef(null);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [userInput]);

  const detectLanguage = (text) => {
    const english = /[a-zA-Z]/.test(text);
    const arabic = /[\u0600-\u06FF]/.test(text);
    setIsEnglish(english);
    setIsArabic(arabic);
    return english || arabic;
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (inputText) => {
      setResponse('');
      
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "system",
              content: cornerCases
            },
            {
              role: "user",
              content: inputText
            }
          ],
          temperature: 0,
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          responseType: 'stream'
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      const readChunk = async () => {
        const { done, value } = await reader.read();
        if (done) return;

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
                  responseDivRef.current.scrollTop = responseDivRef.current.scrollHeight;
                }
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
        readChunk();
      };

      readChunk();
    },
    onError: (error) => {
      setResponse(`<span style="color: red">Error: ${error.message}</span>`);
    }
  });

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4">
    <PageTitle title="Medical Assistant" />
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Medical Assistant</h1>
              <p className="text-sm text-gray-500">Ask any health-related questions</p>
            </div>
          </div>

          <div
            ref={responseDivRef}
            id="response"
            className="mt-5 border border-gray-200 rounded-2xl p-4 min-h-[5rem] text-gray-800 bg-gray-50"
          >
            {sendMessageMutation.isPending && <Loader />}
            {sendMessageMutation.isError && (
              <Error 
                message={sendMessageMutation.error.message} 
                onRetry={handleSendMessage}
              />
            )}
            {response && (
              <div dangerouslySetInnerHTML={{ __html: response }} />
            )}
          </div>

          <div className="mt-4 flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                id="userInput"
                placeholder="Type your health question here..."
                rows={1}
                autoFocus
                className="w-full text-base border border-gray-300 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none leading-relaxed max-h-40 overflow-y-auto"
                aria-label="Type your health question"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onInput={autoResizeTextarea}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={handleSendMessage}
              id="sendButton"
              disabled={sendMessageMutation.isPending}
              className="px-5 py-3 rounded-xl text-white shadow-sm text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed h-[46px]"
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Ask!'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            This assistant only responds to medical questions. For
            emergencies, contact a doctor immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;