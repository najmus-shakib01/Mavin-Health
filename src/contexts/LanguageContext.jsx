/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('english');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (lang === 'english' || lang === 'arabic') {
      setLanguage(lang);
      localStorage.setItem('selectedLanguage', lang);
    }
  };

  const value = {
    language,
    changeLanguage,
    isEnglish: language === 'english',
    isArabic: language === 'arabic'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};