/* eslint-disable react/prop-types */
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";

const ChatInput = ({
  inputText,
  setInputText,
  isEnglish,
  autoResizeTextarea,
  handleSendMessage,
  setIsVoiceModalOpen,
  sendMessageMutation,
  textareaRef
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            placeholder={isEnglish ? "Describe your health issue in detail to get a proper answer..." : "صف مشكلتك الصحية بالتفصيل للحصول على إجابة مناسبة..."}
            rows={1}
            className="w-full text-sm border border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onInput={() => autoResizeTextarea(textareaRef)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={() => setIsVoiceModalOpen(true)} className="absolute right-3 bottom-3 p-1 text-gray-500 hover:text-blue-600 transition" title={isEnglish ? "Voice Input" : "الإدخال الصوتي"}>
            <FaMicrophone className="h-4 w-4" />
          </button>
        </div>
        <button onClick={handleSendMessage} disabled={sendMessageMutation.isPending || !inputText.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition">
          <FaPaperPlane className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        {isEnglish ? "This assistant only responds to medical questions" : "هذا المساعد يجيب على الأسئلة الطبية فقط"}
      </p>
    </div>
  );
};

export default ChatInput;