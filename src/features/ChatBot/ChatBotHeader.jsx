/* eslint-disable react/prop-types */
import { FaExpand, FaRobot, FaTimes } from "react-icons/fa";

const ChatBotHeader = ({ language, isFullScreen, onClose, onFullScreen }) => {
    return (
        <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white ${isFullScreen ? 'border-b' : 'rounded-t-lg'}`}>
            <div className="flex items-center gap-2">
                <FaRobot className="w-5 h-5" />
                <h3 className="font-semibold">
                    {language === "english" ? "AI Assistant" : "المساعد الذكي"}
                </h3>
            </div>
            <div className="flex items-center gap-2">
                {!isFullScreen && onFullScreen && (
                    <button
                        onClick={onFullScreen}
                        className="p-1 hover:bg-blue-700 dark:hover:bg-blue-800 rounded transition-colors"
                        title={
                            language === "english"
                                ? "Open in full screen"
                                : "فتح في وضع ملء الشاشة"
                        }
                    >
                        <FaExpand className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-blue-700 dark:hover:bg-blue-800 rounded transition-colors"
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
export default ChatBotHeader;