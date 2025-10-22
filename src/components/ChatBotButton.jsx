import { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatBotModal from "../features/ChatBot/ChatBotModal";

const ChatBotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300" aria-label="Open ChatBot">
        <FaComments className="text-xl" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-xs text-white items-center justify-center">AI</span>
        </span>
      </button>
      <ChatBotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatBotButton;