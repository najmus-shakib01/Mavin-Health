/* eslint-disable react/prop-types */
import { FaPaperPlane } from "react-icons/fa";

const ChatBotInput = ({
    inputText,
    setInputText,
    handleSendMessage,
    handleKeyPress,
    textareaRef,
    language,
    isPending,
    isCompact = false
}) => {
    return (
        <div className={`p-4 border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`}>
            <div className="flex gap-2">
                <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                        language === "english"
                            ? "Type your message..."
                            : "اكتب رسالتك..."
                    }
                    rows={1}
                    className={`flex-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${isCompact ? "px-3 py-2 text-sm" : "px-4 py-3"
                        }`}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isPending}
                    className={`bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isCompact ? "px-3 py-2" : "px-4 py-3"
                        }`}
                >
                    {isPending ? (
                        <div className={`border-2 border-white border-t-transparent rounded-full animate-spin ${isCompact ? "w-3 h-3" : "w-4 h-4"
                            }`} />
                    ) : (
                        <FaPaperPlane className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatBotInput;