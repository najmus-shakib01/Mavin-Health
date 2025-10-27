/* eslint-disable react/prop-types */
import { FaAmbulance, FaLanguage, FaMicrophone, FaPaperPlane, FaStethoscope } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";
import MessageBubble from "../ChatBot/MessageBubble";

const AssistantTab = ({ messages = [], inputText = "", setInputText, isProcessing = false, handleSendMessage, handleKeyDown, textareaRef, autoResizeTextarea, startNewConversation, sessionLimitReached, messagesEndRef }) => {
  const { isEnglish } = useLanguage();
  const { sessionLimit } = useSession();

  const conversationCount = Math.ceil(messages.length / 2);

  return (
    <div>
      <ChatHeader isEnglish={isEnglish} messageCount={messages.length} sessionLimit={sessionLimit} conversationCount={conversationCount} startNewConversation={startNewConversation} />

      <MessageList messages={messages} isEnglish={isEnglish} messagesEndRef={messagesEndRef} />

      {sessionLimitReached && <SessionLimitWarning isEnglish={isEnglish} />}

      <ChatInput inputText={inputText} setInputText={setInputText} isEnglish={isEnglish} isProcessing={isProcessing} handleSendMessage={handleSendMessage} handleKeyDown={handleKeyDown} autoResizeTextarea={autoResizeTextarea} textareaRef={textareaRef} sessionLimitReached={sessionLimitReached} />
    </div>
  );
};

const ChatHeader = ({ isEnglish, messageCount, sessionLimit, conversationCount, startNewConversation }) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
      {isEnglish ? "Medical Consultation" : "استشارة طبية"}
    </h3>
    {messageCount > 0 && (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {conversationCount}/{sessionLimit} {isEnglish ? "conversations" : "محادثات"}
        </span>
        <button onClick={startNewConversation} className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          {isEnglish ? "New Session" : "جلسة جديدة"}
        </button>
      </div>
    )}
  </div>
);

const MessageList = ({ messages, isEnglish, messagesEndRef }) => {
  if (messages.length === 0) {
    return <EmptyState isEnglish={isEnglish} />;
  }

  return (
    <div className="border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl p-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50 mb-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isEnglish={isEnglish} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 1 && <Disclaimer isEnglish={isEnglish} />}
    </div>
  );
};

const EmptyState = ({ isEnglish }) => (
  <div className="border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl p-5 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50 mb-4 flex flex-col items-center justify-center text-center text-gray-500">
    <FaStethoscope className="w-12 h-12 text-gray-300 mb-3" />
    <h3 className="font-medium text-lg mb-1">{isEnglish ? "Medical Symptom Checker" : "مدقق الأعراض الطبية"}</h3>
    <p className="text-sm max-w-md mb-6">
      {isEnglish ? "Describe your symptoms in English or Arabic. I'll help you understand possible conditions and recommend next steps." : "صف أعراضك باللغة الإنجليزية أو العربية. سأساعدك على فهم الحالات المحتملة وأقترح عليك الخطوات التالية."}
    </p>
    <FeatureGrid isEnglish={isEnglish} />
  </div>
);

const FeatureGrid = ({ isEnglish }) => (
  <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
    <div className="bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center">
      <div className="bg-blue-100 text-blue-600 p-2 rounded-full inline-flex mb-2">
        <FaLanguage className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium">{isEnglish ? "English & Arabic" : "الإنجليزية والعربية"}</p>
    </div>
    <div className="bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center">
      <div className="bg-red-100 text-red-600 p-2 rounded-full inline-flex mb-2">
        <FaAmbulance className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium">{isEnglish ? "Emergency Detection" : "كشف الطوارئ"}</p>
    </div>
  </div>
);

const Disclaimer = ({ isEnglish }) => (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-700 text-xs font-medium">
      ⚠️ {isEnglish ? "This AI system may not always be accurate. Do not take its responses as professional medical advice." : "هذا النظام الذكي قد لا يكون دقيقًا دائمًا. لا تعتمد على ردوده كاستشارة طبية مهنية."}
    </p>
  </div>
);

const SessionLimitWarning = ({ isEnglish }) => (
  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
    <p className="text-yellow-700 font-medium">
      {isEnglish ? "You've reached the chat limit for this session. Please start a new one to continue." : "لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."}
    </p>
  </div>
);

const ChatInput = ({ inputText, setInputText, isEnglish, isProcessing, handleSendMessage, handleKeyDown, autoResizeTextarea, textareaRef, sessionLimitReached }) => {
  const placeholder = sessionLimitReached
    ? (isEnglish ? "Session limit reached. Start a new chat to continue." : "تم الوصول إلى الحد الأقصى للجلسة. ابدأ محادثة جديدة للمتابعة.")
    : (isEnglish ? "Describe your health issue in detail to get a proper answer..." : "صف مشكلتك الصحية بالتفصيل للحصول على إجابة مناسبة...");

  const isDisabled = isProcessing || !inputText.trim() || sessionLimitReached;

  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end">
        <div className="flex-1 relative">
          <textarea ref={textareaRef} placeholder={placeholder} rows={1} className="w-full text-base border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed ma overflow-y-auto pr-12 disabled:opacity-50 disabled:cursor-not-allowed" value={inputText} onChange={(e) => setInputText(e.target.value)} onInput={() => autoResizeTextarea(textareaRef)} onKeyDown={handleKeyDown} disabled={sessionLimitReached} />
          <button className="absolute right-3 bottom-3 p-2 bg-gray-300 rounded-full text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed" title="Voice Input" disabled={sessionLimitReached}>
            <FaMicrophone className="h-5 w-5" />
          </button>
        </div>

        <SendButton onClick={handleSendMessage} disabled={isDisabled} isProcessing={isProcessing} sessionLimitReached={sessionLimitReached} isEnglish={isEnglish} />
      </div>

      <InputFooter isEnglish={isEnglish} />
    </div>
  );
};

const SendButton = ({ onClick, disabled, isProcessing, sessionLimitReached, isEnglish }) => {
  const getButtonText = () => {
    if (sessionLimitReached) return isEnglish ? "Limit Reached" : "تم الوصول للحد";
    if (isProcessing) return isEnglish ? "Analyzing..." : "جاري التحليل";
    return isEnglish ? "Analyze" : "تحليل";
  };

  return (
    <button onClick={onClick} disabled={disabled} className="w-full md:w-auto px-5 py-3 rounded-xl text-white shadow-sm text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {getButtonText()}
        </div>
      ) : (
        <>
          <FaPaperPlane className="h-4 w-4" />
          {getButtonText()}
        </>
      )}
    </button>
  );
};

const InputFooter = ({ isEnglish }) => (
  <div className="mt-4 flex items-center justify-between">
    <p className="text-xs text-gray-500">
      {isEnglish ? "This assistant only responds to medical questions. For emergencies, contact a doctor immediately." : "هذا المساعد يجيب على الأسئلة الطبية فقط. للحالات الطارئة، اتصل بالطبيب فورًا."}
    </p>
  </div>
);

export default AssistantTab;