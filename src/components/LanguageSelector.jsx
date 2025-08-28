import { useLanguage } from "../contexts/LanguageContext";

const LanguageSelector = () => {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-white/20 rounded-full p-1">
            <button onClick={() => changeLanguage('english')} className={`px-4 py-1 rounded-full text-sm font-medium transition ${language === 'english'
                ? 'bg-white dark:bg-gray-800 text-black dark:text-white'
                : 'text-white dark:text-white'
                }`}>
                English
            </button>
            <button onClick={() => changeLanguage('arabic')} className={`px-4 py-1 rounded-full text-sm font-medium transition ${language === 'arabic'
                ? 'bg-white dark:bg-gray-800 text-black dark:text-white'
                : 'text-white dark:text-white'
                }`}>
                العربية
            </button>
        </div>
    );
};

export default LanguageSelector;