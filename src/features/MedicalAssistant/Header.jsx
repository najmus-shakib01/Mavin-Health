import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FaStethoscope } from "react-icons/fa";
import LanguageSelector from "../../components/LanguageSelector";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
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
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-4 md:p-6 dark:from-gray-700 dark:to-gray-700 pt-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                        <FaStethoscope className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div className="max-w-[180px] md:max-w-none">
                        <h1 className="text-lg md:text-2xl font-bold leading-tight">Medical Assistant</h1>
                        <p className="text-blue-100 text-xs md:text-sm hidden md:block">AI-Powered Medical Symptom Analytics</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden md:block">
                        <LanguageSelector />
                    </div>
                    
                    <button onClick={toggleDarkMode} className="p-1.5 md:p-2 text-white bg-blue-600 dark:bg-blue-400 rounded-full transition-colors" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                        {darkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
                    </button>

                    <span className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="mt-4 md:hidden bg-blue-700 dark:bg-gray-800 rounded-lg p-4">
                    <div className="mb-3">
                        <LanguageSelector />
                    </div>
                    <p className="text-blue-100 text-sm md:hidden">AI-Powered Medical Symptom Analytics</p>
                </div>
            )}
        </div>
    );
};

export default Header;