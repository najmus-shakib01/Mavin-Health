/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { FaAmbulance, FaTimes } from "react-icons/fa";
import VoiceInputModal from "../../components/VoiceInputModal";
import { SessionProvider, useSession } from "../../contexts/SessionContext";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useChatBot } from "./useChatBot";

const ChatBotModal = ({ isOpen, onClose }) => {
    return (
        <SessionProvider>
            <ChatBotModalContent isOpen={isOpen} onClose={onClose} />
        </SessionProvider>
    );
};

const ChatBotModalContent = ({ isOpen, onClose }) => {
    const {
        messages, inputText, setInputText, copiedMessageId, isVoiceModalOpen,
        setIsVoiceModalOpen, isFullscreen, language, changeLanguage, isEnglish,
        handleSendMessage, handleCopy, handleVoiceTextConverted, autoResizeTextarea,
        toggleFullscreen, sendMessageMutation, showEmergencyAlert, closeEmergencyAlert,
        startNewConversation
    } = useChatBot(onClose);

    const { sessionLimitReached, userInfo, updateUserInfo } = useSession();
    const messagesEndRef = useRef(null);
    const modalRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (!isOpen) return null;

    return (
        <div>
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4 ${isFullscreen ? 'items-center justify-center' : ''}`}>

                {showEmergencyAlert && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-lg animate-pulse">
                            <FaAmbulance className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-bold text-red-800">
                                    {isEnglish ? "Emergency Situation Detected" : "تم اكتشاف حالة طوارئ"}
                                </h4>
                                <p className="text-red-700 text-sm">
                                    {isEnglish
                                        ? "Please seek immediate medical attention. This is a potentially life-threatening condition."
                                        : "يرجى طلب الرعاية الطبية الفورية. هذه حالة قد تهدد الحياة."}
                                </p>
                            </div>
                            <button onClick={closeEmergencyAlert} className="text-red-600 hover:text-red-800">
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div ref={modalRef} className={`bg-white dark:bg-gray-800 rounded-xl w-full flex flex-col shadow-xl transition-all duration-300 ${isFullscreen ? 'max-w-4xl h-[90vh]' : 'max-w-md h-[70vh]'}`}>
                    <ChatHeader isEnglish={isEnglish} language={language} changeLanguage={changeLanguage} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} onClose={onClose} startNewConversation={startNewConversation} messageCount={messages.length} userInfo={userInfo} updateUserInfo={updateUserInfo} sessionLimitReached={sessionLimitReached} />

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                                <div className="w-12 h-12 text-gray-300 mb-3 dark:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                        <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-lg mb-1">
                                    {isEnglish ? "Medical Chat Assistant" : "مساعد الدردشة الطبية"}
                                </h3>
                                <p className="text-sm max-w-xs mb-4">
                                    {isEnglish ? "Describe your symptoms and get AI-powered medical insights." : "صف أعراضك واحصل على رؤى طبية مدعومة بالذكاء الاصطناعي."}
                                </p>

                                {!userInfo.age && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                        <p className="text-blue-700">
                                            {isEnglish ?
                                                `💡 For better analysis, please provide your age, gender and main symptoms in your first message. For Example : I am 25 years old male with headache and fever for 2 days.` :
                                                `للحصول على تحليل أفضل، يُرجى ذكر عمرك وجنسك والأعراض الرئيسية في رسالتك الأولى. على سبيل المثال: أنا رجل عمري 25 سنة أعاني من صداع وحُمّى منذ يومين.`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <MessageBubble key={message.id} message={message} isEnglish={isEnglish} copiedMessageId={copiedMessageId} handleCopy={handleCopy} />
                                ))}

                                {messages.length > 1 && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-xs font-medium">
                                            ⚠️ {isEnglish ?
                                                "This AI system may not always be accurate. Do not take its responses as professional medical advice." :
                                                "هذا النظام الذكي قد لا يكون دقيقًا دائمًا. لا تعتمد على ردوده كاستشارة طبية مهنية."
                                            }
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {sessionLimitReached && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                <p className="text-yellow-700 text-sm">
                                    {isEnglish ?
                                        "You've reached the chat limit for this session. Please start a new one to continue." :
                                        "لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."
                                    }
                                </p>
                            </div>
                        )}

                        {sendMessageMutation.isPending && (
                            <div className="flex justify-start">
                                <div className="max-w-xs bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 rounded-bl-none">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <ChatInput inputText={inputText} setInputText={setInputText} isEnglish={isEnglish} autoResizeTextarea={autoResizeTextarea} handleSendMessage={handleSendMessage} setIsVoiceModalOpen={setIsVoiceModalOpen} sendMessageMutation={sendMessageMutation} textareaRef={textareaRef} sessionLimitReached={sessionLimitReached}/>
                </div>
            </div>

            <VoiceInputModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onTextConverted={handleVoiceTextConverted} />
        </div>
    );
};

export default ChatBotModal;