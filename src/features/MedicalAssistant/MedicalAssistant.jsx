import { useEffect, useRef } from "react";
import PageTitle from "../../utils/PageTitle";
import useMedicalAssistant from '../useMedicalAssistant/useMedicalAssistant';
import AssistantTab from "./AssistantTab";
import Header from "./Header";

const MedicalAssistant = () => {
  const {
    userInput, setUserInput,
    response, responseDivRef,
    isProcessing, handleSendMessage,
    messageCount, startNewConversation,
    sessionLimitReached,
    userInfo
  } = useMedicalAssistant();

  const textareaRef = useRef(null);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [userInput]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-8 px-4 dark:bg-gray-900">
      <PageTitle title="MedAI Agent Medical" />

      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden dark:bg-gray-900">
          <Header />
          <div className="p-6 dark:bg-gray-800">
            <AssistantTab userInput={userInput} setUserInput={setUserInput} response={response} responseDivRef={responseDivRef} isProcessing={isProcessing} handleSendMessage={handleSendMessage} handleKeyDown={handleKeyDown} textareaRef={textareaRef} autoResizeTextarea={autoResizeTextarea} messageCount={messageCount} startNewConversation={startNewConversation} sessionLimitReached={sessionLimitReached} userInfo={userInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;