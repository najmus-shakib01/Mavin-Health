/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";

const ChatInput = ({
  inputText,
  setInputText,
  isEnglish,
  autoResizeTextarea,
  handleSendMessage,
  setIsVoiceModalOpen,
  sendMessageMutation,
  textareaRef,
  sessionLimitReached,
}) => {
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 1843;

  useEffect(() => {
    setCharCount(inputText ? inputText.length : 0);
  }, [inputText]);

  const isOverLimit = charCount > MAX_CHARS;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !sessionLimitReached && !isOverLimit) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) setInputText(text);
  };

  const placeholder = sessionLimitReached
    ? isEnglish
      ? "Session limit reached. Start a new chat to continue."
      : "تم الوصول إلى الحد الأقصى للجلسة. ابدأ محادثة جديدة للمتابعة."
    : isEnglish
    ? "Please enter your symptoms..."
    : "الرجاء إدخال الأعراض الخاصة بك...";

  const isDisabled = sendMessageMutation.isPending || !inputText.trim() || sessionLimitReached || isOverLimit;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      {sessionLimitReached && <SessionLimitWarning isEnglish={isEnglish} />}

      <div className="flex items-end gap-2">
        <TextAreaWithVoice
          inputText={inputText}
          setInputText={handleInputChange}
          placeholder={placeholder}
          autoResizeTextarea={autoResizeTextarea}
          handleKeyDown={handleKeyDown}
          setIsVoiceModalOpen={setIsVoiceModalOpen}
          textareaRef={textareaRef}
          disabled={sessionLimitReached || isOverLimit}
          charCount={charCount}
          maxChars={MAX_CHARS}
          isOverLimit={isOverLimit}
        />

        <SendButton
          onClick={handleSendMessage}
          disabled={isDisabled}
          isPending={sendMessageMutation.isPending}
          sessionLimitReached={sessionLimitReached}
          isOverLimit={isOverLimit}
        />
      </div>
    </div>
  );
};

const SessionLimitWarning = ({ isEnglish }) => (
  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-yellow-700 text-sm text-center font-medium">
      {isEnglish
        ? "🚫 You've reached the chat limit for this session. Please start a new one to continue."
        : "🚫 لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."}
    </p>
  </div>
);

const TextAreaWithVoice = ({
  inputText,
  setInputText,
  placeholder,
  autoResizeTextarea,
  handleKeyDown,
  setIsVoiceModalOpen,
  textareaRef,
  disabled,
  charCount,
  maxChars,
  isOverLimit,
}) => (
  <div className="flex-1 relative">
    <textarea
      ref={textareaRef}
      placeholder={placeholder}
      rows={1}
      className="w-full text-sm border border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      value={inputText}
      onChange={setInputText}
      onInput={() => autoResizeTextarea(textareaRef)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    />
    <VoiceInputButton onClick={() => setIsVoiceModalOpen(true)} disabled={disabled} />

    <WordCounter wordCount={charCount} maxWords={maxChars} isOverLimit={isOverLimit} />
  </div>
);

const WordCounter = ({ wordCount, maxWords, isOverLimit }) => (
  <div className={`text-xs font-medium transition-colors duration-200 ${isOverLimit ? "text-red-600" : "text-gray-500"}`}>
    {wordCount} / {maxWords} {isOverLimit && "⚠️"}
  </div>
);

const VoiceInputButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    className="absolute right-3 bottom-3 p-2 bg-gray-300 rounded-full text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
    title="Voice Input"
    disabled={disabled}
  >
    <FaMicrophone className="h-5 w-5" />
  </button>
);

const SendButton = ({ onClick, disabled, isPending, sessionLimitReached, isOverLimit }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition relative"
  >
    {isPending ? (
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    ) : sessionLimitReached ? (
      <span className="text-xs">🚫</span>
    ) : isOverLimit ? (
      <span className="text-xs">⚠️</span>
    ) : (
      <FaPaperPlane className="h-4 w-4" />
    )}
  </button>
);

export default ChatInput;
