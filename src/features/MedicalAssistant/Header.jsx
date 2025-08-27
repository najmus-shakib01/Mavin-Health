import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { FaStethoscope } from "react-icons/fa";

// eslint-disable-next-line react/prop-types
const Header = ({ selectedLanguage, onLanguageChange }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return (
            savedTheme === "dark" ||
            (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
        );
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 rounded-full">
                    <FaStethoscope className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Medical Assistant</h1>
                    <p className="text-blue-100"> AI-Powered Medical Symptom Analytics</p>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={() => onLanguageChange('english')} className={`text-sm px-5 py-2 rounded-full ${selectedLanguage === 'english' ? 'bg-white text-blue-600' : 'bg-white/20'}`}>
                    English
                </button>
                <button onClick={() => onLanguageChange('arabic')} className={`text-sm px-5 py-2 rounded-full ${selectedLanguage === 'arabic' ? 'bg-white text-blue-600' : 'bg-white/20'}`}
                >
                    Arabic
                </button>

                <div className="flex items-center gap-5">
                    <button onClick={toggleDarkMode} className="p-2 text-white bg-blue-600 dark:bg-blue-400 rounded-full transition-colors" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;