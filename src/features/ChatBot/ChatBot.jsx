/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import ChatBotButton from "./ChatBotButton";
import ChatBotHeader from "./ChatBotHeader";
import ChatBotInput from "./ChatBotInput";
import ChatBotMessages from "./ChatBotMessages";
import { useChatBotLogic } from "./useChatBotLogic";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
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

    useEffect(() => {
        const checkIsMobile = () => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            );
            setIsMobile(isMobileDevice);

            if (isMobileDevice && isOpen && !isFullScreen) {
                toggleFullScreen();
            }
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, [isOpen, isFullScreen]);

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

                if (isMobile) {
                    setIsOpen(false);
                }
            }
        }
    };

    const handleOpenChat = () => {
        setIsOpen(true);

        if (isMobile) {
            setTimeout(() => {
                toggleFullScreen();
            }, 100);
        }
    };

    const handleCloseChat = () => {
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsFullScreen(false);
        setIsOpen(false);
    };

    if (isFullScreen) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
                <ChatBotHeader
                    language={language}
                    isFullScreen={isFullScreen}
                    onClose={handleCloseChat}
                    onFullScreen={isMobile ? null : toggleFullScreen}
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
                <ChatBotButton onClick={handleOpenChat} />
            )}

            {isOpen && !isMobile && (
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