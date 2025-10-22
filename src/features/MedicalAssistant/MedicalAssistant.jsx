import { useEffect, useRef } from "react";
import { SessionProvider } from "../../contexts/SessionContext";
import PageTitle from "../../utils/PageTitle";
import useMedicalAssistant from '../useMedicalAssistant/useMedicalAssistant';
import AssistantTab from "./AssistantTab";
import Header from "./Header";

const MedicalAssistant = () => (
  <SessionProvider>
    <MedicalAssistantContent />
  </SessionProvider>
);

const MedicalAssistantContent = () => {
  const {
    userInput, setUserInput, response, responseDivRef, isProcessing,
    handleSendMessage, handleKeyDown, autoResizeTextarea,
    startNewConversation, userInfo
  } = useMedicalAssistant();

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) autoResizeTextarea(textareaRef);
  }, [userInput, autoResizeTextarea]);

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 dark:bg-gray-900">
      <PageTitle title="MedAI Agent Medical" />
      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden dark:bg-gray-900">
          <Header />
          <div className="p-6 dark:bg-gray-800">
            <AssistantTab userInput={userInput} setUserInput={setUserInput} response={response} responseDivRef={responseDivRef} isProcessing={isProcessing} handleSendMessage={handleSendMessage} handleKeyDown={handleKeyDown} textareaRef={textareaRef} autoResizeTextarea={autoResizeTextarea} startNewConversation={startNewConversation} userInfo={userInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;