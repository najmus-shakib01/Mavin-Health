/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
  FaAmbulance,
  FaCompress,
  FaExpand,
  FaLanguage,
  FaMicrophone,
  FaPaperPlane,
  FaRobot,
  FaStethoscope,
} from "react-icons/fa";
import VoiceInputModal from "../../components/VoiceInputModal";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import MessageBubble from "../ChatBot/MessageBubble";
import AgeGenderForm from "./AgeGenderForm";

const AssistantTab = ({
  messages = [],
  inputText = "",
  setInputText,
  isProcessing = false,
  handleSendMessage,
  handleKeyDown,
  textareaRef,
  autoResizeTextarea,
  startNewConversation,
  userInfo = {},
  messageCount = 0,
  isStreaming,
  showAgeGenderForm = false,
  handleAgeGenderSubmit,
  conversationStage,
}) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { language, isEnglish } = useLanguage();
  const { sessionLimit, sessionLimitReached } = useSession();

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const lastMessageCountRef = useRef(0);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      if (!isAtBottom) {
        setShouldScrollToBottom(false);
      } else {
        setShouldScrollToBottom(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!shouldScrollToBottom || !messagesEndRef.current) return;

    if (messages.length > lastMessageCountRef.current) {
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToBottom);
      });

      lastMessageCountRef.current = messages.length;
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) {
      setShouldScrollToBottom(true);
      lastMessageCountRef.current = 0;
    }
  }, [messages.length]);

  const handleVoiceTextConverted = (text) => {
    setInputText((prev) => (prev ? prev + " " + text : text));
    setIsVoiceModalOpen(false);
    setTimeout(() => textareaRef?.current?.focus(), 100);
  };

  return (
    <div className="h-full flex flex-col">
      <ChatInterface
        messages={messages}
        isEnglish={isEnglish}
        messageCount={messageCount}
        sessionLimit={sessionLimit}
        sessionLimitReached={sessionLimitReached}
        startNewConversation={startNewConversation}
        userInfo={userInfo}
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
        isStreaming={isStreaming}
        showAgeGenderForm={showAgeGenderForm}
        handleAgeGenderSubmit={handleAgeGenderSubmit}
        conversationStage={conversationStage}
        isFullscreen={isFullscreen}
        toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      <div className="mt-4 flex-shrink-0">
        <InputSection
          inputText={inputText}
          setInputText={setInputText}
          isEnglish={isEnglish}
          language={language}
          isButtonDisabled={
            isProcessing ||
            !inputText.trim() ||
            sessionLimitReached ||
            showAgeGenderForm
          }
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          autoResizeTextarea={autoResizeTextarea}
          textareaRef={textareaRef}
          setIsVoiceModalOpen={setIsVoiceModalOpen}
          sessionLimitReached={sessionLimitReached}
          showAgeGenderForm={showAgeGenderForm}
        />
      </div>

      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTextConverted={handleVoiceTextConverted}
      />
    </div>
  );
};

const ChatHeader = ({
  isEnglish,
  messageCount,
  sessionLimit,
  startNewConversation,
  toggleFullscreen,
  isFullscreen,
}) => (
  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900 dark:text-blue-300">
        <FaRobot className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
          {isEnglish ? "Medical Consultation" : "استشارة طبية"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {messageCount > 0
            ? `${messageCount}/${sessionLimit} ${
                isEnglish ? "messages" : "رسائل"
              }`
            : isEnglish
            ? "private and personal AI symptom checker"
            : "مدقق أعراض طبية خاص وشخصي"}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {messageCount > 0 && (
        <button
          onClick={startNewConversation}
          className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {isEnglish ? "New Session" : "جلسة جديدة"}
        </button>
      )}

      <button
        onClick={toggleFullscreen}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        title={isEnglish ? "Toggle fullscreen" : "تبديل ملء الشاشة"}
      >
        {isFullscreen ? (
          <FaCompress className="h-4 w-4" />
        ) : (
          <FaExpand className="h-4 w-4" />
        )}
      </button>
    </div>
  </div>
);

const ChatInterface = ({
  messages,
  isEnglish,
  messageCount,
  sessionLimit,
  sessionLimitReached,
  startNewConversation,
  userInfo,
  messagesEndRef,
  messagesContainerRef,
  isStreaming,
  showAgeGenderForm,
  handleAgeGenderSubmit,
  conversationStage,
  isFullscreen,
  toggleFullscreen,
}) => (
  <div className="border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl bg-gray-50 flex flex-col overflow-hidden h-[350px] md:h-[400px] lg:h-[400px]">
    <ChatHeader
      isEnglish={isEnglish}
      messageCount={messageCount}
      sessionLimit={sessionLimit}
      startNewConversation={startNewConversation}
      toggleFullscreen={toggleFullscreen}
      isFullscreen={isFullscreen}
    />
    <ChatMessages
      messages={messages}
      isEnglish={isEnglish}
      userInfo={userInfo}
      sessionLimitReached={sessionLimitReached}
      messagesEndRef={messagesEndRef}
      messagesContainerRef={messagesContainerRef}
      isStreaming={isStreaming}
      showAgeGenderForm={showAgeGenderForm}
      handleAgeGenderSubmit={handleAgeGenderSubmit}
      conversationStage={conversationStage}
    />
  </div>
);

const ChatMessages = ({
  messages,
  isEnglish,
  userInfo,
  sessionLimitReached,
  messagesEndRef,
  messagesContainerRef,
  isStreaming,
  showAgeGenderForm,
  handleAgeGenderSubmit,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <EmptyState isEnglish={isEnglish} userInfo={userInfo} />
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      style={{
        overflowY: "auto",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isEnglish={isEnglish}
        />
      ))}

      {isStreaming && !showAgeGenderForm && (
        <div className="flex justify-start">
          <div className="max-w-xs bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 rounded-bl-none">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
              {isEnglish
                ? "🔄 Generating response..."
                : "🔄 جاري إنشاء الرد..."}
            </p>
          </div>
        </div>
      )}

      {showAgeGenderForm && (
        <div className="mt-4">
          <AgeGenderForm onSubmit={handleAgeGenderSubmit} onCancel={() => {}} />
        </div>
      )}

      {messages.length > 1 && <Disclaimer isEnglish={isEnglish} />}
      {sessionLimitReached && <SessionLimitAlert isEnglish={isEnglish} />}

      <div ref={messagesEndRef} className="h-px" aria-hidden="true" />
    </div>
  );
};

const EmptyState = ({ isEnglish }) => (
  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
    <FaStethoscope className="w-12 h-12 text-gray-300 mb-3" />
    <h3 className="font-medium text-lg mb-1">
      {isEnglish ? "Medical Symptom Checker" : "مدقق الأعراض الطبية"}
    </h3>
    <p className="text-sm max-w-md mb-6">
      {isEnglish
        ? "Describe your symptoms in English or Arabic. I'll help you understand possible conditions and recommend next steps."
        : "صف أعراضك باللغة الإنجليزية أو العربية. سأساعدك على فهم الحالات المحتملة وأقترح عليك الخطوات التالية."}
    </p>
    <FeatureGrid isEnglish={isEnglish} />
  </div>
);

const FeatureGrid = ({ isEnglish }) => (
  <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-6">
    <FeatureCard
      icon={FaLanguage}
      color="blue"
      text={isEnglish ? "English & Arabic" : "الإنجليزية والعربية"}
    />
    <FeatureCard
      icon={FaAmbulance}
      color="red"
      text={isEnglish ? "Emergency Detection" : "كشف الطوارئ"}
    />
  </div>
);

const COLOR_STYLES = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

const FeatureCard = ({ icon: Icon, color, text }) => {
  const styles = COLOR_STYLES[color] || COLOR_STYLES.blue;

  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center">
      <div
        className={`${styles.bg} ${styles.text} p-2 rounded-full inline-flex mb-2`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium">{text}</p>
    </div>
  );
};

const Disclaimer = ({ isEnglish }) => (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-700 text-xs font-medium">
      ⚠️{" "}
      {isEnglish
        ? "This AI system may not always be accurate. Do not take its responses as professional medical advice. Always consult a licensed healthcare professional."
        : "هذا النظام الذكي قد لا يكون دقيقًا دائمًا. لا تعتمد على ردوده كاستشارة طبية مهنية. استشر دائمًا أخصائي رعاية صحية مرخّصًا."}
    </p>
  </div>
);

const SessionLimitAlert = ({ isEnglish }) => (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
    <p className="text-yellow-700 text-sm font-medium">
      {isEnglish
        ? "🚫 You've reached the chat limit for this session. Please start a new one to continue."
        : "🚫 لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."}
    </p>
  </div>
);

const InputSection = ({
  inputText,
  setInputText,
  isEnglish,
  language,
  isButtonDisabled,
  handleSendMessage,
  handleKeyDown,
  autoResizeTextarea,
  textareaRef,
  setIsVoiceModalOpen,
  sessionLimitReached,
  showAgeGenderForm,
}) => {
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 1843;

  useEffect(() => {
    setCharCount(inputText ? inputText.length : 0);
  }, [inputText]);

  const isOverLimit = charCount > MAX_CHARS;

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) setInputText(text);
  };

  const finalIsButtonDisabled =
    isButtonDisabled || isOverLimit || showAgeGenderForm;

  return (
    <div className="mt-4">
      {sessionLimitReached && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-700 font-medium">
            {isEnglish
              ? "You've reached the chat limit for this session. Please start a new one to continue."
              : "لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."}
          </p>
        </div>
      )}

      {isOverLimit && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-700 font-medium">
            {isEnglish
              ? `Word limit exceeded! Maximum ${MAX_CHARS} characters allowed.`
              : `تم تجاوز الحد المسموح! الحد الأقصى ${MAX_CHARS} حرفًا.`}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            placeholder={
              showAgeGenderForm
                ? isEnglish
                  ? "Please fill in the form above first"
                  : "يرجى ملء النموذج أعلاه أولاً"
                : sessionLimitReached
                ? isEnglish
                  ? "Session limit reached. Start a new chat to continue."
                  : "تم الوصول إلى الحد الأقصى للجلسة. ابدأ محادثة جديدة للمتابعة."
                : isEnglish
                ? "Please enter your symptoms..."
                : "الرجاء إدخال الأعراض الخاصة بك..."
            }
            rows={1}
            className={`w-full text-base border ${
              isOverLimit ? "border-red-300" : "border-gray-300"
            } dark:bg-gray-800 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${
              isOverLimit
                ? "focus:ring-red-500 focus:border-red-500"
                : "focus:ring-blue-500 focus:border-blue-500"
            } resize-none leading-relaxed max-h-40 overflow-y-auto pr-12 ${
              isEnglish ? "text-left" : "text-right"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            dir={isEnglish ? "ltr" : "rtl"}
            value={inputText}
            onChange={handleInputChange}
            onInput={() => autoResizeTextarea(textareaRef)}
            onKeyDown={handleKeyDown}
            disabled={sessionLimitReached || isOverLimit || showAgeGenderForm}
          />

          <VoiceInputButton
            onClick={() => setIsVoiceModalOpen(true)}
            disabled={sessionLimitReached || isOverLimit || showAgeGenderForm}
          />

          <div
            className={`text-xs font-medium transition-colors duration-200 ${
              isOverLimit ? "text-red-600" : "text-gray-500"
            }`}
          >
            {charCount} / {MAX_CHARS} {isOverLimit && "⚠️"}
          </div>
        </div>

        <SendButton
          onClick={handleSendMessage}
          disabled={finalIsButtonDisabled}
          sessionLimitReached={sessionLimitReached}
          isOverLimit={isOverLimit}
          showAgeGenderForm={showAgeGenderForm}
        />
      </div>

      <InputFooter isEnglish={isEnglish} language={language} />
    </div>
  );
};

const VoiceInputButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="absolute right-3 bottom-3 p-2 bg-gray-300 rounded-full text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
    title="Voice Input"
  >
    <FaMicrophone className="h-5 w-5" />
  </button>
);

const SendButton = ({
  onClick,
  disabled,
  sessionLimitReached,
  isOverLimit,
  showAgeGenderForm,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full md:w-auto px-5 py-3 rounded-xl text-white shadow-sm text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative"
  >
    {showAgeGenderForm ? (
      <span className="text-xs">Please fill form</span>
    ) : sessionLimitReached ? (
      <span>🚫</span>
    ) : isOverLimit ? (
      <span>⚠️</span>
    ) : (
      <>
        <FaPaperPlane className="h-4 w-4" />
        <span>Send</span>
      </>
    )}
  </button>
);

const InputFooter = ({ isEnglish, language }) => (
  <div className="mt-4 flex items-center justify-between">
    <p className="text-xs text-gray-500">
      {isEnglish
        ? "This assistant only responds to medical questions. For emergencies, contact a doctor immediately."
        : "هذا المساعد يجيب على الأسئلة الطبية فقط. للحالات الطارئة، اتصل بالطبيب فورًا."}
    </p>
    <div className="flex items-center text-xs text-gray-500">
      <span className="inline-flex items-center">
        <FaLanguage className="h-3 w-3 mr-1" />
        {language === "english" ? "EN" : "AR"}
      </span>
    </div>
  </div>
);

export default AssistantTab;
