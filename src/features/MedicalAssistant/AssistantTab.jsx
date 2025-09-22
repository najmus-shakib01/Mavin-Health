/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaAmbulance, FaCopy, FaLanguage, FaMicrophone, FaPaperPlane, FaStethoscope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Error from "../../components/Error";
import Loader from "../../components/Loader";
import VoiceInputModal from "../../components/VoiceInputModal";
import { useLanguage } from "../../contexts/LanguageContext";

const AssistantTab = ({
    userInput, setUserInput, response, responseDivRef, sendMessageMutation, handleSendMessage, handleKeyDown, textareaRef, autoResizeTextarea }) => {

    const [copied, setCopied] = useState(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const navigate = useNavigate();
    const { language, isEnglish } = useLanguage();

    const handleCopy = () => {
        navigator.clipboard.writeText(response.replace(/<[^>]+>/g, " ")).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const hasSpecialistRecommendation = response && response.includes("Specialist Recommendation");

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

    return (
        <div>
            <div ref={responseDivRef} id="response" className="border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl p-5 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50">

                {!response && !sendMessageMutation.isPending && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                        <FaStethoscope className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="font-medium text-lg mb-1 pr-5">
                            {isEnglish ? "Medical Symptom Checker" : "مدقق الأعراض الطبية"}
                        </h3>
                        <p className="text-sm max-w-md">
                            {isEnglish ? "Describe your symptoms in English or Arabic. I'll help you understand possible conditions and recommend next steps." : "صف أعراضك باللغة الإنجليزية أو العربية. سأساعدك في فهم الحالات المحتملة والتوصية بالخطوات التالية."}
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
                            <div className="bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-blue-200 text-blue-600 p-2 rounded-full inline-flex mb-2">
                                    <FaLanguage className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-medium">
                                    {isEnglish ? "English & Arabic" : "الإنجليزية والعربية"}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 dark:border-gray-600 p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full inline-flex mb-2">
                                    <FaAmbulance className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-medium">
                                    {isEnglish ? "Emergency Detection" : "كشف الطوارئ"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {sendMessageMutation.isPending && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center"><Loader /></div>
                    </div>
                )}

                {sendMessageMutation.isError && (
                    <Error message={sendMessageMutation.error.message} onRetry={handleSendMessage} />
                )}

                {response && (
                    <div className="relative group">
                        <div className="prose prose-sm max-w-none pr-20">
                            <div dangerouslySetInnerHTML={{ __html: response }} />
                        </div>

                        <button onClick={handleCopy} className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gray-300 rounded-lg shadow-sm text-gray-700 text-xs hover:bg-gray-400 transition">
                            <FaCopy className="w-3 h-3" />
                            {copied ? (isEnglish ? "Copied!" : "تم النسخ!") : (isEnglish ? "Copy" : "نسخ")}
                        </button>

                        {copied && (
                            <span className="absolute top-[-1.5rem] right-0 bg-green-200 text-green-900 text-xs px-2 py-1 rounded shadow-md animate-fade-in">
                                {isEnglish ? "Copied to clipboard!" : "تم النسخ إلى الحافظة!"}
                            </span>
                        )}
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
                        {isEnglish ? "Based on your symptoms, we recommend consulting with a specialist. You can now book an appointment with a qualified healthcare professional." : "بناءً على الأعراض الخاصة بك، نوصي باستشارة أخصائي. يمكنك الآن حجز موعد مع متخصص رعاية صحية مؤهل."}
                    </p>
                    <button onClick={() => navigate("/practitioners")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                        {isEnglish ? "Find Healthcare Providers" : "ابحث عن مقدمي الرعاية الصحية"}
                    </button>
                </div>
            )}

            <div className="mt-5 flex flex-col md:flex-row gap-2 items-stretch md:items-end">
                <div className="flex-1 relative">
                    <textarea ref={textareaRef} id="userInput" placeholder={isEnglish ? "Describe your health issue in detail to get a proper answer..." : "صف مشكلتك الصحية بالتفصيل للحصول على إجابة مناسبة..."} rows={1} autoFocus className={`w-full text-base border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed max-h-40 overflow-y-auto pr-12 ${isEnglish ? "text-left" : "text-right"}`} dir={isEnglish ? "ltr" : "rtl"} value={userInput} onChange={(e) => setUserInput(e.target.value)} onInput={autoResizeTextarea} onKeyDown={handleKeyDown} />

                    <button onClick={() => setIsVoiceModalOpen(true)} className="absolute right-3 bottom-3 p-2 bg-gray-300 rounded-full text-gray-500" title={isEnglish ? "Voice Input" : "الإدخال الصوتي"}>
                        <FaMicrophone className="h-5 w-5" />
                    </button>
                </div>

                <button onClick={handleSendMessage} id="sendButton" disabled={sendMessageMutation.isPending || !userInput.trim()} className="w-full md:w-auto px-5 py-3 rounded-xl text-white shadow-sm text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {sendMessageMutation.isPending ? (
                        <Loader className="h-4 w-4" />
                    ) : (
                        <>
                            <FaPaperPlane className="h-4 w-4" />
                            {isEnglish ? "Analyze" : "تحليل"}
                        </>
                    )}
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    {isEnglish ? "This assistant only responds to medical questions. For emergencies, contact a doctor immediately." : "هذا المساعد responds للأسئلة الطبية فقط. للحالات الطارئة، اتصل بالطبيب فورًا."}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-flex items-center">
                        <FaLanguage className="h-3 w-3 mr-1" />
                        {language === 'english' ? 'EN' : 'AR'}
                    </span>
                </div>
            </div>

            <VoiceInputModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onTextConverted={handleVoiceTextConverted} />
        </div>
    );
};

export default AssistantTab;