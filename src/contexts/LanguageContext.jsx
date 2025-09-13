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

export const LanguageProvider = ({ children, clientRegion = 'saudi' }) => {
  const [language, setLanguage] = useState('english');
  const [availableLanguages, setAvailableLanguages] = useState(['english', 'arabic']); 

  useEffect(() => {
    if (clientRegion === 'usa') {
      setAvailableLanguages(['english']);
      setLanguage('english');
    } else if (clientRegion === 'saudi') {
      setAvailableLanguages(['english', 'arabic']);

      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage && ['english', 'arabic'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      } else {
        setLanguage('english');
      }
    }
  }, [clientRegion]);

  const changeLanguage = (lang) => {
    if (availableLanguages.includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('selectedLanguage', lang);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }
  };

  const value = {
    language,
    changeLanguage,
    availableLanguages,
    isEnglish: language === 'english',
    isArabic: language === 'arabic',
    direction: language === 'arabic' ? 'rtl' : 'ltr',
    clientRegion
  };

  return (
    <LanguageContext.Provider value={value}>
      <div className={language === 'arabic' ? 'font-arabic' : 'font-english'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};