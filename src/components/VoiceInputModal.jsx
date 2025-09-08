/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaTimes } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const VoiceInputModal = ({ isOpen, onClose, onTextConverted }) => {
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { isEnglish } = useLanguage();

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFinalTranscript("");
      setInterimTranscript("");
      setIsListening(false);
      setPermissionDenied(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert(
        isEnglish
          ? "Speech recognition is not supported in your browser."
          : "التعرف على الصوت غير مدعوم في متصفحك."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = isEnglish ? "en-US" : "ar-SA";

    recognition.onresult = (event) => {
      let tempFinal = "";
      let tempInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          tempFinal += text + " ";
        } else {
          tempInterim += text;
        }
      }

      // শুধু final আলাদা রাখো
      if (tempFinal) {
        setFinalTranscript((prev) => prev + tempFinal);
      }
      setInterimTranscript(tempInterim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setPermissionDenied(true);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
    setPermissionDenied(false);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleInsertText = () => {
    const text = (finalTranscript + " " + interimTranscript).trim();
    if (text) {
      onTextConverted(text);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {isEnglish ? "Voice Input" : "الإدخال الصوتي"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {permissionDenied ? (
          <div className="text-center py-8">
            <FaMicrophoneSlash className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2 dark:text-red-400">
              {isEnglish
                ? "Microphone Permission Denied"
                : "تم رفض إذن الميكروفون"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {isEnglish
                ? "Please allow microphone access in your browser settings to use voice input."
                : "يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح لاستخدام الإدخال الصوتي."}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEnglish ? "OK" : "موافق"}
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-6 rounded-full text-white text-2xl transition-all ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                {isListening
                  ? isEnglish
                    ? "Listening..."
                    : "جاري الاستماع..."
                  : isEnglish
                  ? "Click to start speaking"
                  : "انقر للبدء في التحدث"}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isEnglish ? "Transcript:" : "النص:"}
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto bg-gray-50 dark:bg-gray-700">
                {(finalTranscript + interimTranscript).trim() || (
                  <p className="text-gray-400 italic">
                    {isEnglish
                      ? "Start speaking to see transcript here..."
                      : "ابدأ التحدث لرؤية النص هنا..."}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300"
              >
                {isEnglish ? "Cancel" : "إلغاء"}
              </button>
              <button
                onClick={handleInsertText}
                disabled={!(finalTranscript + interimTranscript).trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isEnglish ? "Insert Text" : "إدراج النص"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceInputModal;
