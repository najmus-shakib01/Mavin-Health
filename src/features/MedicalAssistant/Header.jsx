import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { FaStethoscope } from "react-icons/fa";
import LanguageSelector from "../../components/LanguageSelector";

const Header = () => {
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
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-4 md:p-6 dark:from-gray-700 dark:to-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                        <FaStethoscope className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold leading-tight">Medical Assistant</h1>
                        <p className="text-blue-100 text-xs md:text-sm">AI-Powered Medical Symptom Analytics</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                    <LanguageSelector />
                    
                    <button onClick={toggleDarkMode} className="p-1.5 md:p-2 text-white bg-blue-600 dark:bg-blue-400 rounded-full transition-colors" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                        {darkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;