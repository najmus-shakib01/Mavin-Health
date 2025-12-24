/* eslint-disable react/prop-types */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const SessionContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
};

const DEFAULT_USER_INFO = Object.freeze({
  age: "",
  gender: "",
  duration: "",
  symptoms: "",
});

export const SessionProvider = ({ children }) => {
  const [messageCount, setMessageCount] = useState(0);
  const [userInfo, setUserInfo] = useState(DEFAULT_USER_INFO);

  const sessionLimit = 15;

  const incrementMessageCount = useCallback(() => {
    setMessageCount((prev) => (prev >= sessionLimit ? prev : prev + 1));
  }, [sessionLimit]);

  const resetSession = useCallback(() => {
    setMessageCount(0);
    setUserInfo(DEFAULT_USER_INFO);
  }, []);

  const updateUserInfo = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;

    setUserInfo((prev) => {
      const cleaned = Object.fromEntries(
        Object.entries(partial).filter(
          ([, v]) => v !== undefined && v !== null && String(v).trim() !== ""
        )
      );

      if (Object.keys(cleaned).length === 0) return prev;
      return { ...prev, ...cleaned };
    });
  }, []);

  const hasRequiredInfo = useCallback(() => {
    return Boolean(userInfo.age && userInfo.gender && userInfo.duration);
  }, [userInfo]);

  const value = useMemo(
    () => ({
      messageCount,
      sessionLimit,
      sessionLimitReached: messageCount >= sessionLimit,
      incrementMessageCount,
      resetSession,
      userInfo,
      updateUserInfo,
      hasRequiredInfo,
    }),
    [
      messageCount,
      sessionLimit,
      incrementMessageCount,
      resetSession,
      userInfo,
      updateUserInfo,
      hasRequiredInfo,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
