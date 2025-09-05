import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import ChatBotButton from "./ChatBotButton";
import ChatBotHeader from "./ChatBotHeader";
import ChatBotInput from "./ChatBotInput";
import ChatBotMessages from "./ChatBotMessages";
import { useChatBotLogic } from "./useChatBotLogic";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { language } = useLanguage();

    const {
        messages,
        inputText,
        setInputText,
        messagesEndRef,
        textareaRef,
        sendMessageMutation,
        handleSendMessage,
        handleKeyPress,
    } = useChatBotLogic();

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Full-screen error: ${err.message}`);
            });
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    if (isFullScreen) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
                <ChatBotHeader
                    language={language}
                    isFullScreen={isFullScreen}
                    onClose={() => {
                        if (document.exitFullscreen) document.exitFullscreen();
                        setIsFullScreen(false);
                    }}
                />

                <ChatBotMessages
                    messages={messages}
                    messagesEndRef={messagesEndRef}
                />

                <ChatBotInput
                    inputText={inputText}
                    setInputText={setInputText}
                    handleSendMessage={handleSendMessage}
                    handleKeyPress={handleKeyPress}
                    textareaRef={textareaRef}
                    language={language}
                    isPending={sendMessageMutation.isPending}
                />
            </div>
        );
    }

    return (
        <>
            {!isOpen && (
                <ChatBotButton onClick={() => setIsOpen(true)} />
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 lg:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                    <ChatBotHeader
                        language={language}
                        isFullScreen={isFullScreen}
                        onClose={() => setIsOpen(false)}
                        onFullScreen={toggleFullScreen}
                    />

                    <ChatBotMessages
                        messages={messages}
                        messagesEndRef={messagesEndRef}
                        isCompact={true}
                    />

                    <ChatBotInput
                        inputText={inputText}
                        setInputText={setInputText}
                        handleSendMessage={handleSendMessage}
                        handleKeyPress={handleKeyPress}
                        textareaRef={textareaRef}
                        language={language}
                        isPending={sendMessageMutation.isPending}
                        isCompact={true}
                    />
                </div>
            )}
        </>
    );
};

export default ChatBot;