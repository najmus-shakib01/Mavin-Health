import { useLanguage } from "../contexts/LanguageContext";

const LanguageSelector = () => {
    const { language, changeLanguage, availableLanguages, clientRegion } = useLanguage();

    if (clientRegion === 'usa') {
        return (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1">
                <span className="px-4 py-1 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300">
                    English (USA)
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1">
            {availableLanguages.includes('english') && (
                <button 
                    onClick={() => changeLanguage('english')} 
                    className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                        language === 'english'
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300'
                            : 'text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                >
                    English
                </button>
            )}
            {availableLanguages.includes('arabic') && (
                <button 
                    onClick={() => changeLanguage('arabic')} 
                    className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                        language === 'arabic'
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300'
                            : 'text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                >
                    العربية
                </button>
            )}
        </div>
    );
};

export default LanguageSelector;