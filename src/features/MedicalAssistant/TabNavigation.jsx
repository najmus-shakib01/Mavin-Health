import { NavLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const TabNavigation = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex border-b border-gray-200">
            <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'assistant' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('assistant')}>
                Diagnosis Assistant
            </button>

            <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('history')}>
                Medical History
            </button>

            <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('info')}>
                Health Information
            </button>
            
            <NavLink to="/doctors" className={`px-6 py-3 font-medium text-sm ${activeTab === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('doctors')}>
                Doctor
            </NavLink>
        </div>
    );
};

export default TabNavigation;