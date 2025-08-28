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
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6 dark:from-gray-700 dark:to-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full">
                        <FaStethoscope className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Medical Assistant</h1>
                        <p className="text-blue-100">AI-Powered Medical Symptom Analytics</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    
                    <button onClick={toggleDarkMode} className="p-2 text-white bg-blue-600 dark:bg-blue-400 rounded-full transition-colors" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <span className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Header;