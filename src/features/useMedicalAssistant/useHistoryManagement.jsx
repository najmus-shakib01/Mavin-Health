import { useCallback, useState } from "react";

export const useHistoryManagement = () => {
    const [medicalHistory, setMedicalHistory] = useState([]);

    // হিস্টোরি ক্লিয়ার করা
    const clearHistory = useCallback(() => {
        setMedicalHistory([]);
        // লোকাল স্টোরেজ থেকেও ডিলিট
        localStorage.removeItem('medicalAssistantHistory');
    }, []);

    // লোকাল স্টোরেজ থেকে হিস্টোরি লোড
    const loadHistoryFromStorage = useCallback(() => {
        try {
            const savedHistory = localStorage.getItem('medicalAssistantHistory');
            if (savedHistory) {
                return JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Error loading history from storage:', error);
        }
        return [];
    }, []);

    // লোকাল স্টোরেজে হিস্টোরি সেভ 
    const saveHistoryToStorage = useCallback((history) => {
        try {
            localStorage.setItem('medicalAssistantHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving history to storage:', error);
        }
    }, []);

    return {
        medicalHistory,
        setMedicalHistory,
        clearHistory,
        loadHistoryFromStorage,
        saveHistoryToStorage
    };
};