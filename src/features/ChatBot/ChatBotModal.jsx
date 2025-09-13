/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import VoiceInputModal from "../../components/VoiceInputModal";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useChatBot } from "./useChatBot";

const ChatBotModal = ({ isOpen, onClose }) => {
  const {
    messages,
    inputText,
    setInputText,
    copiedMessageId,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isFullscreen,
    language,
    changeLanguage,
    isEnglish,
    handleSendMessage,
    handleCopy,
    handleVoiceTextConverted,
    autoResizeTextarea,
    toggleFullscreen,
    sendMessageMutation
  } = useChatBot(onClose);

  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4 ${isFullscreen ? 'items-center justify-center' : ''}`}>
        <div ref={modalRef} className={`bg-white dark:bg-gray-800 rounded-xl w-full flex flex-col shadow-xl transition-all duration-300 ${isFullscreen ? 'max-w-4xl h-[90vh]' : 'max-w-md h-[70vh]'}`}>
          <ChatHeader 
            isEnglish={isEnglish}
            language={language}
            changeLanguage={changeLanguage}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            onClose={onClose}
          />
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <div className="w-12 h-12 text-gray-300 mb-3 dark:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-1">
                  {isEnglish ? "Medical Chat Assistant" : "مساعد الدردشة الطبية"}
                </h3>
                <p className="text-sm max-w-xs">
                  {isEnglish ? "Describe your symptoms and get AI-powered medical insights." : "صف أعراضك واحصل على رؤى طبية مدعومة بالذكاء الاصطناعي."}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isEnglish={isEnglish}
                  copiedMessageId={copiedMessageId}
                  handleCopy={handleCopy}
                />
              ))
            )}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-xs bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            isEnglish={isEnglish}
            autoResizeTextarea={autoResizeTextarea}
            handleSendMessage={handleSendMessage}
            setIsVoiceModalOpen={setIsVoiceModalOpen}
            sendMessageMutation={sendMessageMutation}
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

export default ChatBotModal;