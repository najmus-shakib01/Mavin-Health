/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import { FaRobot, FaTimes } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const ChatHeader = ({ onClose, startNewConversation, messageCount }) => {
  const { isEnglish, language, changeLanguage } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
      <HeaderInfo messageCount={messageCount} isEnglish={isEnglish} />
      <HeaderActions
        messageCount={messageCount}
        startNewConversation={startNewConversation}
        onClose={onClose}
        language={language}
        changeLanguage={changeLanguage}
      />
    </div>
  );
};

const HeaderInfo = ({ messageCount, isEnglish }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900 dark:text-blue-300">
      <FaRobot className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base whitespace-nowrap">
        Medical Assistant
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {messageCount > 0
          ? `${messageCount}/15 ${isEnglish ? "messages" : "رسائل"}`
          : `private AI symptom checker`}
      </p>
    </div>
  </div>
);

const HeaderActions = ({
  messageCount,
  startNewConversation,
  onClose,
  language,
  changeLanguage,
}) => (
  <div className="flex items-center gap-1 sm:gap-2">
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 sm:p-1">
      {["english", "arabic"].map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium transition ${
            language === lang
              ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          }`}
        >
          {lang === "english" ? "EN" : "AR"}
        </button>
      ))}
    </div>

    {messageCount > 0 && (
      <button
        onClick={startNewConversation}
        className="px-2 sm:px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg whitespace-nowrap hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        title="Start new conversation"
      >
        {useLanguage().isEnglish ? "New Chat" : "جلسة جديدة"}
      </button>
    )}

    <IconButton onClick={onClose} icon={FaTimes} />
  </div>
);

const IconButton = ({ onClick, icon: Icon, title }) => (
  <button
    onClick={onClick}
    className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
    title={title}
  >
    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  </button>
);

export default ChatHeader;
