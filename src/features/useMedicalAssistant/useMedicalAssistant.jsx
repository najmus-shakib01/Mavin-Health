import { useCallback, useEffect, useRef, useState } from "react";
import useApiCommunication from "./useApiCommunication";
import useEmergencyDetection from "./useEmergencyDetection";
import useHistoryManagement from "./useHistoryManagement";
import useLanguageDetection from "./useLanguageDetection";
import useMedicalValidation from "./useMedicalValidation";

const useMedicalAssistant = () => {
    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState("");
    const responseDivRef = useRef(null);

    // বিভিন্ন হুক থেকে ফাংশনগুলো ইম্পোর্ট করুন
    const { detectLanguage } = useLanguageDetection();
    const { detectEmergency } = useEmergencyDetection();
    const { isMedicalQuestion } = useMedicalValidation();

    const { medicalHistory, setMedicalHistory, clearHistory, loadHistoryFromStorage, saveHistoryToStorage
    } = useHistoryManagement();

    const { sendMessageMutation } = useApiCommunication(setResponse, setMedicalHistory, saveHistoryToStorage, responseDivRef);

    // কম্পোনেন্ট মাউন্ট হলে হিস্টোরি লোড
    useEffect(() => {
        const savedHistory = loadHistoryFromStorage();
        if (savedHistory.length > 0) {
            setMedicalHistory(savedHistory);
        }
    }, [loadHistoryFromStorage, setMedicalHistory]);

    // মেসেজ পাঠানো - সংশোধিত
    const handleSendMessage = useCallback(() => {
        if (!userInput.trim()) {
            setResponse("Please describe your symptoms.");
            return;
        }

        if (!detectLanguage(userInput)) {
            setResponse(`<span style="color:red">I only accept questions in English or Arabic. Please ask in English or Arabic.</span>`);
            return;
        }

        if (detectEmergency(userInput)) {
            const emergencyResponse = `
                <span style="color:red; font-weight:bold;">
                    ⚠️ EMERGENCY ALERT! You may be experiencing a serious medical condition. 
                    ➡️ Please go to the nearest hospital immediately or call emergency services.
                    📞 Call your local emergency number (e.g., 999 in Bangladesh, 911 in USA, 112 in EU).  
                    🏥 Use Google Maps to search for "nearest hospital" if needed.
                </span>
            `;

            setResponse(emergencyResponse);

            // নতুন অবজেক্ট রেফারেন্স তৈরি করে এবং হিস্টোরি আপডেট করে
            const newHistoryItem = { query: userInput, response: emergencyResponse, language: /[\u0600-\u06FF]/.test(userInput) ? 'Arabic' : 'English', time: new Date().toLocaleTimeString(), id: Date.now(), emergency: true };

            setMedicalHistory(prev => {
                const updatedHistory = [...prev, newHistoryItem];
                saveHistoryToStorage(updatedHistory);
                return updatedHistory;
            });

            // ইমার্জেন্সি ক্ষেত্রেও ইনপুট ক্লিয়ার করুন
            setUserInput("");

            return;
        }

        if (!isMedicalQuestion(userInput)) {
            setResponse("I specialize only in medical diagnosis and disease detection queries. Please ask about health symptoms or medical conditions.");
            // নন-মেডিকেল প্রশ্নের ক্ষেত্রেও ইনপুট ক্লিয়ার করুন
            setUserInput("");
            return;
        }

        // Store the input before clearing it
        const inputToSend = userInput;

        // Clear the input immediately
        setUserInput("");

        // Send the stored input
        sendMessageMutation.mutate(inputToSend);

        // ইনপুট ক্লিয়ার করা হবে মূল কম্পোনেন্টে
    }, [userInput, detectLanguage, detectEmergency, isMedicalQuestion, sendMessageMutation, saveHistoryToStorage, setMedicalHistory]);

    return { userInput, setUserInput, response, responseDivRef, sendMessageMutation, handleSendMessage, medicalHistory, clearHistory };
};

export default useMedicalAssistant;