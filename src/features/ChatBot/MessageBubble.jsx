/* eslint-disable react/prop-types */
import { FaCopy } from "react-icons/fa";

const MessageBubble = ({ message, isEnglish, copiedMessageId, handleCopy }) => {
  return (
    <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs lg:max-w-md rounded-2xl p-4 relative group ${message.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"}`}>
        {message.sender === "bot" && !message.isStreaming && (
          <button onClick={() => handleCopy(message.text, message.id)} className="flex ml-auto opacity-0 group-hover:opacity-70 transition-opacity" title={isEnglish ? "Copy response" : "نسخ الرد"}>
            <FaCopy className="h-3 w-3" />
          </button>
        )}
        {message.sender === "user" ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.text }} />
        )}

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs opacity-70">
            {message.timestamp}
          </span>
        </div>

        {copiedMessageId === message.id && (
          <span className="absolute -top-6 right-0 bg-green-200 text-green-900 text-xs px-2 py-1 rounded shadow-md">
            {isEnglish ? "Copied!" : "تم النسخ!"}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;