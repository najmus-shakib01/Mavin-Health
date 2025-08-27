/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaAmbulance, FaCopy, FaLanguage, FaPaperPlane, FaStethoscope } from "react-icons/fa";
import Error from "../../components/Error";
import Loader from "../../components/Loader";

const AssistantTab = ({
    userInput, setUserInput, response, responseDivRef, sendMessageMutation, handleSendMessage, handleKeyDown, textareaRef, autoResizeTextarea }) => {

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(response.replace(/<[^>]+>/g, " ")).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div>
            <div ref={responseDivRef} id="response" className="border border-gray-200 rounded-xl p-5 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-50">

                {!response && !sendMessageMutation.isPending && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">

                        <FaStethoscope className="w-12 h-12 text-gray-300 mb-3" />

                        <h3 className="font-medium text-lg mb-1 pr-5">Medical Symptom Checker</h3>
                        <p className="text-sm max-w-md">Describe your symptoms in English or Arabic. I&apos;ll help you understand possible conditions and recommend next steps.</p>

                        <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">

                            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-full inline-flex mb-2">
                                    <FaLanguage className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-medium">English & Arabic</p>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full inline-flex mb-2">
                                    <FaAmbulance className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-medium">Emergency Detection</p>
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

                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gray-300 rounded-lg shadow-sm text-gray-700 text-xs hover:bg-gray-400 transition">
                            <FaCopy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                        </button>


                        {copied && (
                            <span className="absolute top-[-1.2rem] right-0 bg-green-200 text-green-900 text-xs px-2 py-1 rounded shadow-md animate-fade-in z-10">
                                Copied to clipboard!
                            </span>
                        )}
                    </div>
                )}
            </div>

            {response && response.includes("EMERGENCY") && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <FaAmbulance className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800"> Emergency Situation Detected</h4>
                        <p className="text-red-700 text-sm"> Please seek immediate medical attention. This is a potentially life-threatening condition.</p>
                    </div>
                </div>
            )}

            <div className="mt-5 flex gap-2 items-end">
                <div className="flex-1 relative">
                    <textarea ref={textareaRef} id="userInput" placeholder="Describe your symptoms in English or Arabic..." rows={1} autoFocus className="w-full text-base border border-gray-300 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus: focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed max-h-40 overflow-y-auto pr-12" aria-label="Type your health question here..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onInput={autoResizeTextarea} onKeyDown={handleKeyDown}
                    ></textarea>
                </div>

                <button onClick={handleSendMessage} id="sendButton" disabled={sendMessageMutation.isPending || !userInput.trim()} className="px-5 py-7 rounded-xl text-white shadow-sm text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed h-[46px] flex items-center gap-2">
                    {sendMessageMutation.isPending ? (
                        <><Loader className="h-4 w-4" /></>
                    ) : (
                        <><FaPaperPlane className="h-4 w-4" />Analyze</>
                    )}

                </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500"> This assistant only responds to medical questions. For emergencies, contact a doctor immediately.</p>
                <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-flex items-center"><FaLanguage className="h-3 w-3 mr-1" />EN/AR</span>
                </div>
            </div>

        </div>
    );
};

export default AssistantTab;