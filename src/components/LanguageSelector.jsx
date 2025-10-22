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

    const languages = [
        { key: 'english', label: 'English' },
        { key: 'arabic', label: 'العربية' }
    ];

    return (
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-gray-900 rounded-full p-1">
            {languages.map(({ key, label }) => (
                availableLanguages.includes(key) && (
                    <button key={key} onClick={() => changeLanguage(key)} className={`px-4 py-1 rounded-full text-sm font-medium transition ${language === key ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300' : 'text-blue-600 dark:text-blue-300'}`}>
                        {label}
                    </button>
                )))}
        </div>
    );
};

export default LanguageSelector;