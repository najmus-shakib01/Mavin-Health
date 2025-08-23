import { useCallback } from "react";

const useEmergencyDetection = () => {
    // ইমার্জেন্সি লক্ষণ ডিটেক্ট করা
    const detectEmergency = useCallback((text) => {
        const emergencyKeywords = [
            'chest pain', 'heart attack', 'stroke', 'bleeding heavily',
            'cannot breathe', 'difficulty breathing', 'unconscious',
            'severe pain', 'suicide', 'kill myself', 'ألم في الصدر',
            'نوبة قلبية', 'سكتة دماغية', 'نزيف حاد', 'صعوبة في التنفس'
        ];
        return emergencyKeywords.some(keyword =>
            text.toLowerCase().includes(keyword.toLowerCase())
        );
    }, []);

    return { detectEmergency };
};

export default useEmergencyDetection;