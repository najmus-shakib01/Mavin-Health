import { useCallback, useState } from "react";

const useHistoryManagement = () => {
    const [medicalHistory, setMedicalHistory] = useState([]);

    const clearHistory = useCallback(() => {
        setMedicalHistory([]);
        localStorage.removeItem('medicalAssistantHistory');
    }, []);

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

    const saveHistoryToStorage = useCallback((history) => {
        try {
            localStorage.setItem('medicalAssistantHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving history to storage:', error);
        }
    }, []);

    return { medicalHistory, setMedicalHistory, clearHistory, loadHistoryFromStorage, saveHistoryToStorage };
};

export default useHistoryManagement;