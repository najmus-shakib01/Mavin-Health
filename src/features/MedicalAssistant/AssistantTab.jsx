/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaAmbulance, FaLanguage, FaMicrophone, FaPaperPlane, FaStethoscope } from "react-icons/fa";
import VoiceInputModal from "../../components/VoiceInputModal";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSession } from "../../contexts/SessionContext";

const AssistantTab = ({
    userInput = "", setUserInput, response = "", responseDivRef, isProcessing = false,
    handleSendMessage, handleKeyDown, textareaRef, autoResizeTextarea, startNewConversation, userInfo = {} }) => {
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const { language, isEnglish } = useLanguage();
    const { messageCount, sessionLimit, sessionLimitReached } = useSession();

    const handleVoiceTextConverted = (text) => {
        setUserInput(prev => (prev || "") + (prev ? " " + text : text));
        setIsVoiceModalOpen(false);
        setTimeout(() => textareaRef?.current?.focus(), 100);
    };

    const getButtonText = () => {
        if (isProcessing) return isEnglish ? "Processing..." : "جاري المعالجة...";
        if (sessionLimitReached) return isEnglish ? "Session Limit Reached" : "تم الوصول إلى الحد الأقصى";
        return isEnglish ? "Analyze" : "تحليل";
    };

    const isButtonDisabled = isProcessing || !userInput.trim() || sessionLimitReached;
    const hasSpecialistRecommendation = response?.includes("Specialist Recommendation");
    const isRateLimited = response?.includes("Too many requests") || response?.includes("عدد الطلبات كبير");
    const hasEmergency = response?.includes("EMERGENCY");

    return (
        <div>
            <ResponseSection response={response} responseDivRef={responseDivRef} isProcessing={isProcessing} messageCount={messageCount} sessionLimit={sessionLimit} sessionLimitReached={sessionLimitReached} isEnglish={isEnglish} userInfo={userInfo} startNewConversation={startNewConversation} />

            {hasEmergency && <EmergencyAlert isEnglish={isEnglish} />}
            {hasSpecialistRecommendation && <SpecialistRecommendation isEnglish={isEnglish} />}
            {isRateLimited && <RateLimitAlert isEnglish={isEnglish} />}

            <InputSection userInput={userInput} setUserInput={setUserInput} isEnglish={isEnglish} language={language} isButtonDisabled={isButtonDisabled} getButtonText={getButtonText} isProcessing={isProcessing} handleSendMessage={handleSendMessage} handleKeyDown={handleKeyDown} autoResizeTextarea={autoResizeTextarea} textareaRef={textareaRef} setIsVoiceModalOpen={setIsVoiceModalOpen} sessionLimitReached={sessionLimitReached} />

            <VoiceInputModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onTextConverted={handleVoiceTextConverted} />
        </div>
    );
};

const ResponseSection = ({ response, responseDivRef, isProcessing, messageCount, sessionLimit, sessionLimitReached, isEnglish, userInfo, startNewConversation }) => (
    <div ref={responseDivRef} className="border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl p-5 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50">
        <ResponseHeader isEnglish={isEnglish} messageCount={messageCount} sessionLimit={sessionLimit} startNewConversation={startNewConversation} />

        {sessionLimitReached && <SessionLimitWarning isEnglish={isEnglish} />}
        {!response && !isProcessing && messageCount === 0 && <EmptyState isEnglish={isEnglish} userInfo={userInfo} />}
        {isProcessing && <LoadingIndicator isEnglish={isEnglish} />}
        {response && <ResponseContent response={response} isEnglish={isEnglish} />}
    </div>
);

const ResponseHeader = ({ isEnglish, messageCount, sessionLimit, startNewConversation }) => (
    <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">{isEnglish ? "Medical Consultation" : "استشارة طبية"}</h3>
        {messageCount > 0 && (
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{messageCount}/{sessionLimit} {isEnglish ? "messages" : "رسائل"}</span>
                <button onClick={startNewConversation} className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    {isEnglish ? "New Session" : "جلسة جديدة"}
                </button>
            </div>
        )}
    </div>
);

const EmptyState = ({ isEnglish }) => (
    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
        <FaStethoscope className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="font-medium text-lg mb-1">{isEnglish ? "Medical Symptom Checker" : "مدقق الأعراض الطبية"}</h3>
        <p className="text-sm max-w-md mb-6">
            {isEnglish ? "Describe your symptoms in English or Arabic. I'll help you understand possible conditions and recommend next steps." : "صف أعراضك باللغة الإنجليزية أو العربية. سأساعدك على فهم الحالات المحتملة وأقترح عليك الخطوات التالية."}
        </p>
        <FeatureGrid isEnglish={isEnglish} />
    </div>
);

const FeatureGrid = ({ isEnglish }) => (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-6">
        <FeatureCard icon={FaLanguage} color="blue" text={isEnglish ? "English & Arabic" : "الإنجليزية والعربية"} />
        <FeatureCard icon={FaAmbulance} color="red" text={isEnglish ? "Emergency Detection" : "كشف الطوارئ"} />
    </div>
);

const FeatureCard = ({ icon: Icon, color, text }) => (
    <div className={`bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center`}>
        <div className={`bg-${color}-100 text-${color}-600 p-2 rounded-full inline-flex mb-2`}>
            <Icon className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium">{text}</p>
    </div>
);

const LoadingIndicator = ({ isEnglish }) => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-full">
                <div className="flex space-x-1">
                    {[0, 0.2, 0.4].map(delay => (
                        <div key={delay} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                </div>
                <span className="text-blue-700 dark:text-blue-300 text-sm">
                    {isEnglish ? "Analyzing with medical database..." : "جاري التحليل مع قاعدة البيانات الطبية..."}
                </span>
            </div>
        </div>
    </div>
);

const ResponseContent = ({ response, isEnglish }) => (
    <div className="relative">
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: response }} />
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-xs font-medium">
                ⚠️ {isEnglish ? "This AI system may not always be accurate. Do not take its responses as professional medical advice. Always consult with a qualified healthcare provider for medical concerns." : "هذا النظام الذكي قد لا يكون دقيقًا دائمًا. لا تعتمد على ردوده كاستشارة طبية مهنية. استشر دائمًا مقدم رعاية صحية مؤهل للشواغل الطبية."}
            </p>
        </div>
    </div>
);

const EmergencyAlert = ({ isEnglish }) => (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <FaAmbulance className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
            <h4 className="font-bold text-red-800">{isEnglish ? "Emergency Situation Detected" : "تم اكتشاف حالة طوارئ"}</h4>
            <p className="text-red-700 text-sm">
                {isEnglish ? "Please seek immediate medical attention. This is a potentially life-threatening condition." : "يرجى طلب الرعاية الطبية الفورية. هذه حالة قد تهدد الحياة."}
            </p>
        </div>
    </div>
);

const SpecialistRecommendation = ({ isEnglish }) => (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-bold text-blue-800 mb-2">{isEnglish ? "Ready to Book an Appointment?" : "مستعد لحجز موعد؟"}</h4>
        <p className="text-blue-700 text-sm mb-3">
            {isEnglish ? "Based on your symptoms, we recommend consulting with a specialist." : "بناءً على الأعراض الخاصة بك، نوصي باستشارة أخصائي."}
        </p>
    </div>
);

const RateLimitAlert = ({ isEnglish }) => (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-yellow-700 text-sm text-center">
            {isEnglish ? "⏳ Please wait a moment before sending another request" : "⏳ يرجى الانتظار لحظة قبل إرسال طلب آخر"}
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

const InputSection = ({
    userInput, setUserInput, isEnglish, language, isButtonDisabled, getButtonText, isProcessing,
    handleSendMessage, handleKeyDown, autoResizeTextarea, textareaRef, setIsVoiceModalOpen, sessionLimitReached }) => (
    <div className="mt-4">
        <div className="mt-5 flex flex-col md:flex-row gap-2 items-stretch md:items-end">
            <div className="flex-1 relative">
                <textarea ref={textareaRef} placeholder={sessionLimitReached ? (isEnglish ? "Session limit reached. Start a new chat to continue." : "تم الوصول إلى الحد الأقصى للجلسة. ابدأ محادثة جديدة للمتابعة.") : (isEnglish ? "Describe your health issue in detail to get a proper answer..." : "صف مشكلتك الصحية بالتفصيل للحصول على إجابة مناسبة...")} rows={1} className={`w-full text-base border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed max-h-40 overflow-y-auto pr-12 ${isEnglish ? "text-left" : "text-right"}`} dir={isEnglish ? "ltr" : "rtl"} value={userInput} onChange={(e) => setUserInput(e.target.value)} onInput={() => autoResizeTextarea(textareaRef)} onKeyDown={handleKeyDown} disabled={sessionLimitReached} />
                <VoiceInputButton onClick={() => setIsVoiceModalOpen(true)} disabled={sessionLimitReached} />
            </div>

            <SendButton onClick={handleSendMessage} disabled={isButtonDisabled} isProcessing={isProcessing} getButtonText={getButtonText} />

        </div>
        <InputFooter isEnglish={isEnglish} language={language} />
    </div>
);

const VoiceInputButton = ({ onClick, disabled }) => (
    <button onClick={onClick} className="absolute right-3 bottom-3 p-2 bg-gray-300 rounded-full text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed" title="Voice Input" disabled={disabled}>
        <FaMicrophone className="h-5 w-5" />
    </button>
);

const SendButton = ({ onClick, disabled, isProcessing, getButtonText }) => (
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

const InputFooter = ({ isEnglish, language }) => (
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
);

export default AssistantTab;