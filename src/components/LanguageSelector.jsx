import { useLanguage } from "../contexts/LanguageContext";
import { useLocation } from "../contexts/LocationContext";

const LanguageSelector = () => {
    const { language, changeLanguage, availableLanguages } = useLanguage();
    const { isLoading, isUSA, isSaudiArabia } = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1">
                <div className="px-4 py-1 rounded-full text-sm font-medium bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 animate-pulse">
                    Loading...
                </div>
            </div>
        );
    }

    if (isUSA) {
        return (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1">
                <span className="px-4 py-1 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300">
                    English (USA)
                </span>
            </div>
        );
    }

    if (isSaudiArabia) {
        const languages = [
            { key: 'english', label: 'English' },
            { key: 'arabic', label: 'العربية' }
        ];

        return (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-gray-900 rounded-full p-1">
                {languages.map(({ key, label }) => (
                    <button key={key} onClick={() => changeLanguage(key)} className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-200 ${language === key ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-800'}`}>
                        {label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-gray-900 rounded-full p-1">
            {availableLanguages.map((lang) => (
                <button key={lang} onClick={() => changeLanguage(lang)} className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-200 ${language === lang ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-800'}`}>
                    {lang === 'english' ? 'English' : 'العربية'}
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;