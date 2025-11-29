/* eslint-disable react/prop-types */
import { FaCompress, FaExpand, FaRobot, FaTimes } from "react-icons/fa";
import { useLocation } from "../../contexts/LocationContext";

const ChatHeader = ({
  isEnglish, language, changeLanguage, isFullscreen, toggleFullscreen,
  onClose, startNewConversation, messageCount }) => {

  const { isUSA, isSaudiArabia, isLoading } = useLocation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
      <HeaderInfo messageCount={messageCount} isEnglish={isEnglish} />
      <HeaderActions messageCount={messageCount} isEnglish={isEnglish} language={language} changeLanguage={changeLanguage} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} startNewConversation={startNewConversation} onClose={onClose} isUSA={isUSA} isSaudiArabia={isSaudiArabia} isLoading={isLoading} />
    </div>
  );
};

const HeaderInfo = ({ messageCount, isEnglish }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900 dark:text-blue-300">
      <FaRobot className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base whitespace-nowrap">Medical Assistant</h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {messageCount > 0 ? `${messageCount}/15 ${isEnglish ? 'messages' : 'رسائل'}` : `${isEnglish ? 'AI-powered medical consultation' : 'استشارة طبية مدعومة بالذكاء الاصطناعي'}`}
      </p>
    </div>
  </div>
);

const HeaderActions = ({
  messageCount, isEnglish, language, changeLanguage, isFullscreen,
  toggleFullscreen, startNewConversation, onClose, isUSA, isSaudiArabia, isLoading }) => (
  <div className="flex items-center gap-1 sm:gap-2">
    {messageCount > 0 && (
      <button onClick={startNewConversation} className="px-2 sm:px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg whitespace-nowrap hover:bg-gray-300 dark:hover:bg-gray-600 transition" title={isEnglish ? "Start new conversation" : "بدء محادثة جديدة"}>
        {isEnglish ? "New Chat" : "جديد"}
      </button>
    )}

    <ChatLanguageToggle language={language} changeLanguage={changeLanguage} isUSA={isUSA} isSaudiArabia={isSaudiArabia} isLoading={isLoading} />

    <IconButton onClick={toggleFullscreen} icon={isFullscreen ? FaCompress : FaExpand} title={isEnglish ? "Toggle fullscreen" : "تبديل ملء الشاشة"} />
    <IconButton onClick={onClose} icon={FaTimes} />
  </div>
);

const ChatLanguageToggle = ({ language, changeLanguage, isUSA, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 sm:p-1">
        <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 animate-pulse">
          ...
        </div>
      </div>
    );
  }

  if (isUSA) {
    return (
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 sm:p-1">
        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300">
          EN
        </span>
      </div>
    );
  }

  const languages = [
    { key: 'english', label: 'EN' },
    { key: 'arabic', label: 'AR' }
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 sm:p-1">
      {languages.map((lang) => (
        <button key={lang.key} onClick={() => changeLanguage(lang.key)} className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium transition ${language === lang.key ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`}>
          {lang.label}
        </button>
      ))}
    </div>
  );
};

const IconButton = ({ onClick, icon: Icon, title }) => (
  <button onClick={onClick} className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title={title}>
    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  </button>
);

export default ChatHeader;