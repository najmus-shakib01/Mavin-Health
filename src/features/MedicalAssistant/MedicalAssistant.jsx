import { useEffect, useRef, useState } from "react";
import ProgressBar from "../../components/ProgressBar";
import PageTitle from "../../utils/PageTitle";
import useMedicalAssistant from '../useMedicalAssistant/useMedicalAssistant';
import AssistantTab from "./AssistantTab";
import Header from "./Header";

const MedicalAssistant = () => {
  const { userInput, setUserInput, response, responseDivRef, sendMessageMutation, handleSendMessage } = useMedicalAssistant();
  const [progress, setProgress] = useState(0);
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

  useEffect(() => {
    let interval;
    if (sendMessageMutation.isPending) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 500);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
    
    return () => clearInterval(interval);
  }, [sendMessageMutation.isPending]);

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
            {sendMessageMutation.isPending && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Processing your request</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
                </div>
                <ProgressBar progress={progress} />
              </div>
            )}
            <AssistantTab 
              userInput={userInput} 
              setUserInput={setUserInput} 
              response={response} 
              responseDivRef={responseDivRef} 
              sendMessageMutation={sendMessageMutation} 
              handleSendMessage={handleSendMessage} 
              handleKeyDown={handleKeyDown} 
              textareaRef={textareaRef} 
              autoResizeTextarea={autoResizeTextarea}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;