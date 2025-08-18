// MedicalAssistant.jsx ফাইল এখন শুধু UI এর কাজ করবে।
// সব API কল, লজিক useMedicalAssistant.jsx ফাইল থেকে আসবে।
import { useEffect, useRef } from "react";
import Error from "../../components/Error";
import Loader from "../../components/Loader";
import PageTitle from "../../utils/PageTitle";
import { useMedicalAssistant } from "./useMedicalAssistant.jsx";

const MedicalAssistant = () => {
  const {
    userInput,
    setUserInput,
    response,
    responseDivRef,
    sendMessageMutation,
    handleSendMessage,
  } = useMedicalAssistant();

  const textareaRef = useRef(null);

  // অটো-রিসাইজ টেক্সটএরিয়া
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [userInput]);

  // এন্টার চাপলে সেন্ড
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4">
      <PageTitle title="Medical Assistant" />
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-xl rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Medical Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Ask any health-related questions
              </p>
            </div>
          </div>
          {/* Response Box */}
          <div
            ref={responseDivRef}
            id="response"
            className="mt-5 border border-gray-200 rounded-2xl p-4 min-h-[5rem] text-gray-800 bg-gray-50"
          >
            {sendMessageMutation.isPending && <Loader />}
            {sendMessageMutation.isError && (
              <Error
                message={sendMessageMutation.error.message}
                onRetry={handleSendMessage}
              />
            )}
            {response && <div dangerouslySetInnerHTML={{ __html: response }} />}
          </div>
          {/* Input Box */}
          <div className="mt-4 flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                id="userInput"
                placeholder="Type your health question here..."
                rows={1}
                autoFocus
                className="w-full text-base border border-gray-300 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none leading-relaxed max-h-40 overflow-y-auto"
                aria-label="Type your health question here..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onInput={autoResizeTextarea}
                onKeyDown={handleKeyDown}
              ></textarea>
            </div>
            <button
              onClick={handleSendMessage}
              id="sendButton"
              disabled={sendMessageMutation.isPending}
              className="px-5 py-3 rounded-xl text-white shadow-sm text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed h-[46px]"
            >
              {sendMessageMutation.isPending ? "Sending..." : "Ask!"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            This assistant only responds to medical questions. For emergencies,
            contact a doctor immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;
