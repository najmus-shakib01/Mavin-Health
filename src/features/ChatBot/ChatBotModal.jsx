/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { FaAmbulance, FaTimes } from "react-icons/fa";
import VoiceInputModal from "../../components/VoiceInputModal";
import { SessionProvider, useSession } from "../../contexts/SessionContext";
import AgeGenderForm from "../MedicalAssistant/AgeGenderForm";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useChatBot } from "./useChatBot";
import { useLanguage } from "../../contexts/LanguageContext";

const ChatBotModal = ({ isOpen, onClose }) => (
  <SessionProvider>
    <ChatBotModalContent isOpen={isOpen} onClose={onClose} />
  </SessionProvider>
);

const ChatBotModalContent = ({ isOpen, onClose }) => {
  const {
    messages,
    inputText,
    setInputText,
    isStreaming,
    handleSendMessage,
    handleKeyDown,
    autoResizeTextarea,
    startNewConversation,
    showAgeGenderForm,
    handleAgeGenderSubmit,
    handleVoiceTextConverted,
  } = useChatBot();

  const { sessionLimitReached, messageCount } = useSession();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const lastMessageCountRef = useRef(0);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      if (!isAtBottom) {
        setShouldScrollToBottom(false);
      } else {
        setShouldScrollToBottom(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !shouldScrollToBottom || !messagesEndRef.current) return;

    if (messages.length > lastMessageCountRef.current) {
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToBottom);
      });

      lastMessageCountRef.current = messages.length;
    }
  }, [messages, shouldScrollToBottom, isOpen]);

  useEffect(() => {
    if (messages.length === 0) {
      setShouldScrollToBottom(true);
      lastMessageCountRef.current = 0;
    }
  }, [messages.length]);

  useEffect(() => {
    if (!isOpen) return;

    setShouldScrollToBottom(true);
    lastMessageCountRef.current = messages.length;

    if (messages.length > 0 && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [isOpen, messages.length]);

  const closeEmergencyAlert = () => setShowEmergencyAlert(false);

  if (!isOpen) return null;

  return (
    <>
      {showEmergencyAlert && <EmergencyAlert onClose={closeEmergencyAlert} />}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md h-[70vh] flex flex-col shadow-xl transition-all duration-300">
          <ChatHeader
            onClose={onClose}
            startNewConversation={startNewConversation}
            messageCount={messageCount}
          />

          <MessageList
            messages={messages}
            sessionLimitReached={sessionLimitReached}
            isStreaming={isStreaming}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
            showAgeGenderForm={showAgeGenderForm}
            handleAgeGenderSubmit={handleAgeGenderSubmit}
          />

          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            autoResizeTextarea={autoResizeTextarea}
            handleSendMessage={handleSendMessage}
            handleKeyDown={handleKeyDown}
            setIsVoiceModalOpen={setIsVoiceModalOpen}
            textareaRef={textareaRef}
            sessionLimitReached={sessionLimitReached}
            isStreaming={isStreaming}
            showAgeGenderForm={showAgeGenderForm}
          />
        </div>
      </div>

      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTextConverted={handleVoiceTextConverted}
      />
    </>
  );
};

const EmergencyAlert = ({ onClose }) => (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-lg animate-pulse">
      <FaAmbulance className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-bold text-red-800">Emergency Situation Detected</h4>
        <p className="text-red-700 text-sm">
          Please seek immediate medical attention. This is a potentially
          life-threatening condition.
        </p>
      </div>
      <button onClick={onClose} className="text-red-600 hover:text-red-800">
        <FaTimes className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const MessageList = ({
  messages,
  sessionLimitReached,
  isStreaming,
  messagesContainerRef,
  messagesEndRef,
  showAgeGenderForm,
  handleAgeGenderSubmit,
}) => {
  const { isEnglish } = useLanguage();

  if (messages.length === 0) {
    return <EmptyState isEnglish={isEnglish} />;
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      style={{
        overflowY: "auto",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && !showAgeGenderForm && (
        <div className="flex justify-start">
          <div className="max-w-xs bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 rounded-bl-none">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
              {isEnglish ? "Generating response..." : "جاري إنشاء الرد..."}
            </p>
          </div>
        </div>
      )}

      {showAgeGenderForm && (
        <AgeGenderForm onSubmit={handleAgeGenderSubmit} onCancel={() => {}} />
      )}

      {messages.length > 1 && <Disclaimer isEnglish={isEnglish} />}
      {sessionLimitReached && <SessionLimitAlert isEnglish={isEnglish} />}

      <div ref={messagesEndRef} className="h-px" aria-hidden="true" />
    </div>
  );
};

const EmptyState = ({ isEnglish }) => (
  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-6">
    <div className="w-12 h-12 text-gray-300 mb-3 dark:text-gray-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    </div>
    <h3 className="font-medium text-lg mb-1">
      {isEnglish ? "Medical Chat Assistant" : "مساعد الدردشة الطبية"}
    </h3>
    <p className="text-sm max-w-xs mb-4">
      {isEnglish
        ? "Describe your symptoms. I'll help you understand possible conditions and recommend next steps."
        : "صف أعراضك. سأساعدك على فهم الحالات المحتملة وأقترح عليك الخطوات التالية."}
    </p>
  </div>
);

const Disclaimer = ({ isEnglish }) => (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-700 text-xs font-medium">
      ⚠️{" "}
      {isEnglish
        ? "This AI system may not always be accurate. Do not take its responses as professional medical advice."
        : "هذا النظام الذكي قد لا يكون دقيقًا دائمًا. لا تعتمد على ردوده كاستشارة طبية مهنية."}
    </p>
  </div>
);

const SessionLimitAlert = ({ isEnglish }) => (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
    <p className="text-yellow-700 text-sm font-medium">
      {isEnglish
        ? "🚫 You've reached the chat limit for this session. Please start a new one to continue."
        : "🚫 لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."}
    </p>
  </div>
);

export default ChatBotModal;
