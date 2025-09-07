import { NavLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const TabNavigation = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto hide-scrollbar">
            <button className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'assistant' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('assistant')}>
                Diagnosis Assistant
            </button>

            <button className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('history')}>
                Medical History
            </button>

            <button className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('info')}>
                Health Information
            </button>

            <NavLink to="/doctors" className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('doctors')}>
                Doctor
            </NavLink>

            <NavLink to="/practitioners" className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'practitioners' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('practitioners')}>
                Practitioners
            </NavLink>

            <NavLink to="/clinics" className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm whitespace-nowrap ${activeTab === 'clinics' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('clinics')}>
                Clinics
            </NavLink>

            <style>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default TabNavigation;