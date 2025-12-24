import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "./LocationContext";

const LanguageContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};

// eslint-disable-next-line react/prop-types
export const LanguageProvider = ({ children }) => {
  const { countryCode, isUSA } = useLocation();

  const [language, setLanguage] = useState("english");

  const availableLanguages = useMemo(() => {
    return isUSA ? ["english"] : ["english", "arabic"];
  }, [isUSA]);

  // Keep existing behavior: USA => English only, others => read saved language
  useEffect(() => {
    if (isUSA) {
      setLanguage("english");
      return;
    }

    try {
      const saved = localStorage.getItem("selectedLanguage");
      if (saved && ["english", "arabic"].includes(saved)) {
        setLanguage(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, [isUSA, countryCode]);

  const changeLanguage = useCallback(
    (lang) => {
      if (!availableLanguages.includes(lang)) return;

      setLanguage((prev) => {
        if (prev === lang) return prev;

        try {
          localStorage.setItem("selectedLanguage", lang);
        } catch {
          // ignore
        }

        // keep existing event behavior
        window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }));
        return lang;
      });
    },
    [availableLanguages]
  );

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      availableLanguages,
      isEnglish: language === "english",
      isArabic: language === "arabic",
      direction: language === "arabic" ? "rtl" : "ltr",
      countryCode,
    }),
    [language, changeLanguage, availableLanguages, countryCode]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div className={language === "arabic" ? "font-arabic" : "font-english"}>{children}</div>
    </LanguageContext.Provider>
  );
};
