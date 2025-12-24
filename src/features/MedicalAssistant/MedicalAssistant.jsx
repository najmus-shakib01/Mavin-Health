import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "../../contexts/SessionContext";
import PageTitle from "../../utils/PageTitle";
import { useMedicalAssistant } from "../useMedicalAssistant/useMedicalAssistant";
import AssistantTab from "./AssistantTab";
import Header from "./Header";

const MedicalAssistant = () => (
  <SessionProvider>
    <MedicalAssistantContent />
  </SessionProvider>
);

const MedicalAssistantContent = () => {
  const {
    messages,
    inputText,
    setInputText,
    isProcessing,
    handleSendMessage,
    handleKeyDown,
    autoResizeTextarea,
    startNewConversation,
    userInfo,
    isStreaming,
  } = useMedicalAssistant();

  const { messageCount } = useSession();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) autoResizeTextarea(textareaRef);
  }, [inputText, autoResizeTextarea]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <PageTitle title="MedAI Agent Medical" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden dark:bg-gray-900">
            <Header />
            <div className="p-6 dark:bg-gray-800">
              <AssistantTab
                messages={messages}
                inputText={inputText}
                setInputText={setInputText}
                isProcessing={isProcessing}
                handleSendMessage={handleSendMessage}
                handleKeyDown={handleKeyDown}
                textareaRef={textareaRef}
                autoResizeTextarea={autoResizeTextarea}
                startNewConversation={startNewConversation}
                userInfo={userInfo}
                messageCount={messageCount}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;
