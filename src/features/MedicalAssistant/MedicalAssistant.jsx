import { useEffect, useRef, useState } from "react";
import PageTitle from "../../utils/PageTitle";
import useMedicalAssistant from '../useMedicalAssistant/useMedicalAssistant';
import AssistantTab from "./AssistantTab";
import Header from "./Header";
import HistoryTab from "./HistoryTab";
import InfoTab from "./InfoTab";
import TabNavigation from "./TabNavigation";

const MedicalAssistant = () => {
  const { userInput, setUserInput, response, responseDivRef, sendMessageMutation, handleSendMessage, medicalHistory, clearHistory, } = useMedicalAssistant();

  const textareaRef = useRef(null);
  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedLanguage, setSelectedLanguage] = useState('english'); // ডিফল্ট ভাষা ইংরেজি

  // অটো-রিসাইজ টেক্সটএরিয়া
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [userInput]);

  // এন্টার চাপলে সেন্ড
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // ভাষা পরিবর্তন হ্যান্ডলার
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  return (
    <div className="min-h-full flex items-center justify-center py-8 px-4 dark:bg-gray-800">
      <PageTitle title="MedAI Agent Medical" />
      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden dark:bg-gray-900">
          <Header selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} />
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="p-6 dark:bg-gray-900">
            {activeTab === 'assistant' && (
              <AssistantTab userInput={userInput} setUserInput={setUserInput} response={response} responseDivRef={responseDivRef} sendMessageMutation={sendMessageMutation} handleSendMessage={handleSendMessage} handleKeyDown={handleKeyDown} textareaRef={textareaRef} autoResizeTextarea={autoResizeTextarea} selectedLanguage={selectedLanguage}
              />
            )}
          </div>

          {activeTab === 'history' && (
            <HistoryTab medicalHistory={medicalHistory} clearHistory={clearHistory} />
          )}

          {activeTab === 'info' && <InfoTab />}
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;