/* eslint-disable react/prop-types */
import { FaCompress, FaExpand, FaRobot, FaTimes } from "react-icons/fa";

const ChatHeader = ({ isEnglish, language, changeLanguage, isFullscreen, toggleFullscreen, onClose }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          <FaRobot className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
            {isEnglish ? "Medical Assistant" : "المساعد الطبي"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isEnglish ? "AI-powered medical consultation" : "استشارة طبية مدعومة بالذكاء الاصطناعي"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 sm:p-1">
          <button onClick={() => changeLanguage("english")} className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium transition ${language === "english" ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm" : "text-gray-600 dark:text-gray-300"}`}>
            EN
          </button>
          <button onClick={() => changeLanguage("arabic")} className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium transition ${language === "arabic" ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm" : "text-gray-600 dark:text-gray-300"}`}>
            AR
          </button>
        </div>

        <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title={isEnglish ? "Toggle fullscreen" : "تبديل ملء الشاشة"}>
          {isFullscreen ? (
            <FaCompress className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <FaExpand className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </button>

        <button onClick={onClose} className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;