/* eslint-disable react/prop-types */
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";

const ChatInput = ({ inputText, setInputText, isEnglish, autoResizeTextarea, handleSendMessage, setIsVoiceModalOpen, sendMessageMutation, textareaRef, sessionLimitReached
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      {sessionLimitReached && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm text-center font-medium">
            {isEnglish ?
              "🚫 You've reached the chat limit for this session. Please start a new one to continue." :
              "🚫 لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."
            }
          </p>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea ref={textareaRef} placeholder={sessionLimitReached ? (isEnglish ? "Session limit reached. Start a new chat to continue." : "تم الوصول إلى الحد الأقصى للجلسة. ابدأ محادثة جديدة للمتابعة.") : (isEnglish ? "Describe your health issue in detail to get a proper answer..." : "صف مشكلتك الصحية بالتفصيل للحصول على إجابة مناسبة...")} rows={1} className="w-full text-sm border border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" value={inputText} onChange={(e) => setInputText(e.target.value)} onInput={() => autoResizeTextarea(textareaRef)} onKeyDown={handleKeyDown} disabled={sessionLimitReached} />

          <button onClick={() => setIsVoiceModalOpen(true)} className="absolute right-3 bottom-3 p-2 bg-gray-300 rounded-full text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed" title={isEnglish ? "Voice Input" : "الإدخال الصوتي"} disabled={sessionLimitReached}>
            <FaMicrophone className="h-5 w-5" />
          </button>
        </div>
        <button onClick={handleSendMessage} disabled={sendMessageMutation.isPending || !inputText.trim() || sessionLimitReached} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition">
          <FaPaperPlane className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;