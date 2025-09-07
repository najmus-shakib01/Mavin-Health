/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaAmbulance, FaCopy, FaLanguage, FaPaperPlane, FaStethoscope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Error from "../../components/Error";
import Loader from "../../components/Loader";
import { useLanguage } from "../../contexts/LanguageContext";

const AssistantTab = ({
    userInput, setUserInput, response, responseDivRef, sendMessageMutation, handleSendMessage, handleKeyDown, textareaRef, autoResizeTextarea }) => {

    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const { language, isEnglish } = useLanguage();

    const handleCopy = () => {
        navigator.clipboard.writeText(response.replace(/<[^>]+>/g, " ")).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const hasSpecialistRecommendation = response && response.includes("Specialist Recommendation");

    return (
        <div className="p-3 md:p-0">
            <div ref={responseDivRef} id="response" className="border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-4 md:p-5 min-h-[250px] md:min-h-[300px] max-h-[350px] md:max-h-[400px] overflow-y-auto bg-gray-50">

                {!response && !sendMessageMutation.isPending && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-2">

                        <FaStethoscope className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mb-3" />

                        <h3 className="font-medium text-base md:text-lg mb-1">
                            {isEnglish ? "Medical Symptom Checker" : "مدقق الأعراض الطبية"}
                        </h3>
                        <p className="text-xs md:text-sm max-w-md">
                            {isEnglish ? "Describe your symptoms in English or Arabic. I'll help you understand possible conditions and recommend next steps." : "صف أعراضك باللغة الإنجليزية أو العربية. سأساعدك في فهم الحالات المحتملة والتوصية بالخطوات التالية."}
                        </p>

                        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-2 md:gap-3 w-full max-w-sm">

                            <div className="bg-white dark:bg-gray-900 dark:border-gray-600 p-2 md:p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-blue-100 text-blue-600 p-1.5 md:p-2 rounded-full inline-flex mb-1 md:mb-2">
                                    <FaLanguage className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <p className="text-xs font-medium">
                                    {isEnglish ? "English & Arabic" : "الإنجليزية والعربية"}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-900 dark:border-gray-600 p-2 md:p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-emerald-100 text-emerald-600 p-1.5 md:p-2 rounded-full inline-flex mb-1 md:mb-2">
                                    <FaAmbulance className="w-4 h-4 md:w-5 md:h-5" />
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
                        <div className="prose prose-sm max-w-none pr-12 md:pr-20">
                            <div dangerouslySetInnerHTML={{ __html: response }} />
                        </div>

                        <button onClick={handleCopy} className="absolute top-1 md:top-2 right-1 md:right-2 flex items-center gap-1 px-2 py-1 bg-gray-300 rounded text-gray-700 text-xs hover:bg-gray-400 transition">
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
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <FaAmbulance className="h-5 w-5 md:h-6 md:w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800 text-sm md:text-base">
                            {isEnglish ? "Emergency Situation Detected" : "تم اكتشاف حالة طوارئ"}
                        </h4>
                        <p className="text-red-700 text-xs md:text-sm">
                            {isEnglish ? "Please seek immediate medical attention. This is a potentially life-threatening condition." : "يرجى طلب الرعاية الطبية الفورية. هذه حالة قد تهدد الحياة."}
                        </p>
                    </div>
                </div>
            )}

            {hasSpecialistRecommendation && (
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="font-bold text-blue-800 text-sm md:text-base mb-1 md:mb-2">
                        {isEnglish ? "Ready to Book an Appointment?" : "مستعد لحجز موعد؟"}
                    </h4>
                    <p className="text-blue-700 text-xs md:text-sm mb-2 md:mb-3">
                        {isEnglish ? "Based on your symptoms, we recommend consulting with a specialist. You can now book an appointment with a qualified healthcare professional." : "بناءً على الأعراض الخاصة بك، نوصي باستشارة أخصائي. يمكنك الآن حجز موعد مع متخصص رعاية صحية مؤهل."}
                    </p>
                    <button onClick={() => navigate("/practitioners")} className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm font-medium">
                        {isEnglish ? "Find Healthcare Providers" : "ابحث عن مقدمي الرعاية الصحية"}
                    </button>
                </div>
            )}

            <div className="mt-4 md:mt-5 flex gap-2 items-end">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        id="userInput"
                        placeholder={isEnglish ? "Describe your health issue in detail to get a proper answer..." : "صف مشكلتك الصحية بالتفصيل للحصول على إجابة مناسبة..."}
                        rows={1}
                        autoFocus
                        className="w-full text-sm md:text-base border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-sm rounded-xl px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed max-h-40 overflow-y-auto pr-10 md:pr-12"
                        aria-label={isEnglish ? "Type your health question here..." : "اكتب سؤالك الصحي هنا..."}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onInput={autoResizeTextarea}
                        onKeyDown={handleKeyDown}
                    ></textarea>
                </div>

                <button
                    onClick={handleSendMessage}
                    id="sendButton"
                    disabled={sendMessageMutation.isPending || !userInput.trim()}
                    className="px-4 py-2 md:px-5 md:py-7 rounded-xl text-white shadow-sm text-xs md:text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed h-[42px] md:h-[46px] flex items-center justify-center gap-1 md:gap-2"
                >
                    {sendMessageMutation.isPending ? (
                        <Loader className="h-3 w-3 md:h-4 md:w-4" />
                    ) : (
                        <>
                            <FaPaperPlane className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden md:inline">{isEnglish ? "Analyze" : "تحليل"}</span>
                        </>
                    )}
                </button>
            </div>

            <div className="mt-3 md:mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500 max-w-[70%]">
                    {isEnglish ? "This assistant only responds to medical questions. For emergencies, contact a doctor immediately." : "هذا المساعد responds للأسئلة الطبية فقط. للحالات الطارئة، اتصل بالطبيب فورًا."}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-flex items-center">
                        <FaLanguage className="h-3 w-3 mr-1" />
                        {language === 'english' ? 'EN' : 'AR'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AssistantTab;