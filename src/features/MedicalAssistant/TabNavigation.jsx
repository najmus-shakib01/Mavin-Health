import { NavLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const TabNavigation = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'assistant' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('assistant')}>
                Diagnosis Assistant
            </button>

            <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('history')}>
                Medical History
            </button>

            <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('info')}>
                Health Information
            </button>

            <NavLink to="/doctors" className={`px-6 py-3 font-medium text-sm ${activeTab === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('doctors')}>
                Doctor
            </NavLink>

            <NavLink to="/practitioners" className={`px-6 py-3 font-medium text-sm ${activeTab === 'practitioners' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('practitioners')}>
                Practitioners
            </NavLink>

            <NavLink to="/clinics" className={`px-6 py-3 font-medium text-sm ${activeTab === 'clinics' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('clinics')}>
                Clinics
            </NavLink>
        </div>
    );
};

export default TabNavigation;