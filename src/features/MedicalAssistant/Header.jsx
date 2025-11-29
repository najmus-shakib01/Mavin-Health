import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { FaStethoscope } from "react-icons/fa";
import LanguageSelector from "../../components/LanguageSelector";

const Header = () => {
    const [darkMode, setDarkMode] = useState(() =>
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    return (
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-3 sm:p-4 md:p-6 dark:from-gray-700 dark:to-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <HeaderTitle />
                <HeaderControls darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
        </div>
    );
};

const HeaderTitle = () => (
    <div className="flex items-center gap-2 md:gap-4">
        <div className="p-2 md:p-3 bg-white/20 rounded-full">
            <FaStethoscope className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div>
            <h1 className="text-base sm:text-lg md:text-2xl font-bold leading-tight">Medical Assistant</h1>
            <p className="text-blue-100 text-xs sm:text-sm md:text-base pt-3 md:pt-1">
                AI-Powered Medical Symptom Analytics
            </p>
        </div>
    </div>
);

// eslint-disable-next-line react/prop-types
const HeaderControls = ({ darkMode, setDarkMode }) => (
    <div className="flex items-center gap-2 md:gap-4">
        <LanguageSelector />
        <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 md:p-2 text-white bg-blue-600 dark:bg-blue-400 rounded-full transition-colors hover:bg-blue-700 dark:hover:bg-blue-500" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? <Sun size={18} className="w-4 h-4 md:w-5 md:h-5" /> : <Moon size={18} className="w-4 h-4 md:w-5 md:h-5" />}
        </button>
    </div>
);

export default Header;