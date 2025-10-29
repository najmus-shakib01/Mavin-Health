/* eslint-disable react/prop-types */
import { createContext, useCallback, useContext, useState } from 'react';

const SessionContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error('useSession must be used within a SessionProvider');
    return context;
};

export const SessionProvider = ({ children }) => {
    const [messageCount, setMessageCount] = useState(0);
    const [sessionLimit] = useState(15);
    const [userInfo, setUserInfo] = useState({ age: '', gender: '', duration: '', symptoms: '' });

    const incrementMessageCount = useCallback(() => {
        setMessageCount(prev => {
            if (prev >= sessionLimit) return prev;
            return prev + 1;
        });
    }, [sessionLimit]);

    const resetSession = useCallback(() => {
        setMessageCount(0);
        setUserInfo({ age: '', gender: '', duration: '', symptoms: '' });
    }, []);

    const updateUserInfo = useCallback((newInfo) => {
        setUserInfo(prev => ({ ...prev, ...newInfo }));
    }, []);

    const hasRequiredInfo = useCallback(() =>
        userInfo.age && userInfo.gender && userInfo.duration
        , [userInfo]);

    const value = {
        messageCount, sessionLimit, sessionLimitReached: messageCount >= sessionLimit, incrementMessageCount, resetSession, userInfo, updateUserInfo, hasRequiredInfo
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};