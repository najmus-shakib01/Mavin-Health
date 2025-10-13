/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaAmbulance, FaLanguage, FaMicrophone, FaPaperPlane, FaStethoscope, FaUser, FaUserMd } from "react-icons/fa";
import VoiceInputModal from "../../components/VoiceInputModal";
import { useLanguage } from "../../contexts/LanguageContext";
import UserInfoModal from "./UserInfoModal";

const AssistantTab = ({
    userInput, setUserInput, response, responseDivRef, isProcessing,
    handleSendMessage, handleKeyDown, textareaRef, autoResizeTextarea,
    messageCount, startNewConversation, sessionLimitReached, userInfo
}) => {

    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false); const { language, isEnglish } = useLanguage();

    const isButtonDisabled = isProcessing || !userInput.trim() || sessionLimitReached;

    const handleVoiceTextConverted = (text) => {
        setUserInput(prevInput => prevInput + (prevInput ? " " + text : text));
        setIsVoiceModalOpen(false);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.selectionStart = textareaRef.current.value.length;
                textareaRef.current.selectionEnd = textareaRef.current.value.length;
            }
        }, 100);
    };

    const getButtonText = () => {
        if (isProcessing) {
            return isEnglish ? "Processing..." : "جاري المعالجة...";
        }
        if (sessionLimitReached) {
            return isEnglish ? "Session Limit Reached" : "تم الوصول إلى الحد الأقصى";
        }
        return isEnglish ? "Analyze" : "تحليل";
    };

    const hasSpecialistRecommendation = response && response.includes("Specialist Recommendation");
    const isRateLimited = response && (response.includes("Too many requests") || response.includes("عدد الطلبات كبير"));

    return (
        <div>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                        <FaUser className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                            {isEnglish ? "Patient Information" : "معلومات المريض"}
                        </h4>
                        <p className="text-blue-600 dark:text-blue-400 text-xs">
                            {userInfo.age && userInfo.gender ? `${userInfo.age} years, ${userInfo.gender}${userInfo.symptoms ? ', ' + userInfo.symptoms : ''}` : isEnglish ? "Not provided" : "غير مقدم"}
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsUserInfoModalOpen(true)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition flex items-center gap-2">
                    <FaUserMd className="h-3 w-3" />
                    {isEnglish ? "Update Info" : "تحديث المعلومات"}
                </button>
            </div>

            <div ref={responseDivRef} id="response" className="border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl p-5 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        {isEnglish ? "Medical Consultation" : "استشارة طبية"}
                    </h3>
                    {messageCount > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {messageCount}/15 {isEnglish ? "messages" : "رسائل"}
                            </span>
                            <button onClick={startNewConversation} className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                                {isEnglish ? "New Session" : "جلسة جديدة"}
                            </button>
                        </div>
                    )}
                </div>

                {sessionLimitReached && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-yellow-700 font-medium">
                            {isEnglish ? "You've reached the chat limit for this session. Please start a new one to continue." : "لقد وصلت إلى الحد الأقصى للمحادثة في هذه الجلسة. يرجى بدء جلسة جديدة للمتابعة."}
                        </p>
                    </div>
                )}

                {!response && !isProcessing && messageCount === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                        <FaStethoscope className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="font-medium text-lg mb-1">
                            {isEnglish ? "Medical Symptom Checker" : "مدقق الأعراض الطبية"}
                        </h3>
                        <p className="text-sm max-w-md mb-6">
                            {isEnglish ? "Describe your symptoms in English or Arabic. I'll help you understand possible conditions and recommend next steps." : "صف أعراضك باللغة الإنجليزية أو العربية. سأساعدك في فهم الحالات المحتملة والتوصية بالخطوات التالية."}
                        </p>

                        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                            <div className="bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-full inline-flex mb-2">
                                    <FaLanguage className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-medium">
                                    {isEnglish ? "English & Arabic" : "الإنجليزية والعربية"}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full inline-flex mb-2">
                                    <FaAmbulance className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-medium">
                                    {isEnglish ? "Emergency Detection" : "كشف الطوارئ"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isProcessing && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-full">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <span className="text-blue-700 dark:text-blue-300 text-sm">
                                    {isEnglish ? "Analyzing with medical database..." : "جاري التحليل مع قاعدة البيانات الطبية..."}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {response && (
                    <div className="relative">
                        <div className="prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: response }} />
                        </div>

                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-xs font-medium">
                                ⚠️ {isEnglish ? "This AI system may not always be accurate. Do not take its responses as professional medical advice." : "هذا النظام الذكي قد لا يكون دقيقًا دائمًا. لا تعتمد على ردوده كاستشارة طبية مهنية."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {response && response.includes("EMERGENCY") && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <FaAmbulance className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800">
                            {isEnglish ? "Emergency Situation Detected" : "تم اكتشاف حالة طوارئ"}
                        </h4>
                        <p className="text-red-700 text-sm">
                            {isEnglish ? "Please seek immediate medical attention. This is a potentially life-threatening condition." : "يرجى طلب الرعاية الطبية الفورية. هذه حالة قد تهدد الحياة."}
                        </p>
                    </div>
                </div>
            )}

            {hasSpecialistRecommendation && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="font-bold text-blue-800 mb-2">
                        {isEnglish ? "Ready to Book an Appointment?" : "مستعد لحجز موعد؟"}
                    </h4>
                    <p className="text-blue-700 text-sm mb-3">
                        {isEnglish ? "Based on your symptoms, we recommend consulting with a specialist." : "بناءً على الأعراض الخاصة بك، نوصي باستشارة أخصائي."}
                    </p>
                </div>
            )}

            {isRateLimited && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-700 text-sm text-center">
                        {isEnglish ? "⏳ Please wait a moment before sending another request" : "⏳ يرجى الانتظار لحظة قبل إرسال طلب آخر"}
                    </p>
                </div>
            )}

            <div className="mt-5 flex flex-col md:flex-row gap-2 items-stretch md:items-end">
                <div className="flex-1 relative">
                    <textarea ref={textareaRef} id="userInput" placeholder={isEnglish ? "Describe your health issue in detail to get a proper answer..." : "صف مشكلتك الصحية بالتفصيل للحصول على إجابة مناسبة..."} rows={1} autoFocus className={`w-full text-base border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed max-h-40 overflow-y-auto pr-12 ${isEnglish ? "text-left" : "text-right"}`} dir={isEnglish ? "ltr" : "rtl"} value={userInput} onChange={(e) => setUserInput(e.target.value)} onInput={autoResizeTextarea} onKeyDown={handleKeyDown} disabled={sessionLimitReached} />

                    <button onClick={() => setIsVoiceModalOpen(true)} className="absolute right-3 bottom-3 p-2 bg-gray-300 rounded-full text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed" title={isEnglish ? "Voice Input" : "الإدخال الصوتي"}>
                        <FaMicrophone className="h-5 w-5" />
                    </button>
                </div>

                <button onClick={handleSendMessage} id="sendButton" disabled={isButtonDisabled} className="w-full md:w-auto px-5 py-3 rounded-xl text-white shadow-sm text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {isEnglish ? "Processing..." : "جاري المعالجة..."}
                        </div>
                    ) : (
                        <>
                            <FaPaperPlane className="h-4 w-4" />
                            {getButtonText()}
                        </>
                    )}
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    {isEnglish ? "This assistant only responds to medical questions. For emergencies, contact a doctor immediately." : "هذا المساعد يجيب على الأسئلة الطبية فقط. للحالات الطارئة، اتصل بالطبيب فورًا."}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-flex items-center">
                        <FaLanguage className="h-3 w-3 mr-1" />
                        {language === 'english' ? 'EN' : 'AR'}
                    </span>
                </div>
            </div>

            <VoiceInputModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onTextConverted={handleVoiceTextConverted} />

            <UserInfoModal isOpen={isUserInfoModalOpen} onClose={() => setIsUserInfoModalOpen(false)} userInfo={userInfo} />
        </div>
    );
};

export default AssistantTab;