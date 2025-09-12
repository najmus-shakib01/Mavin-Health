/* eslint-disable react/prop-types */
import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: "assistant", label: "Diagnosis Assistant", icon: "🩺" },
    { id: "history", label: "Medical History", icon: "📋" },
    { id: "info", label: "Health Information", icon: "💊" },
    { id: "doctors", label: "Doctors", link: "/doctors", icon: "👨‍⚕️" },
    { id: "practitioners", label: "Practitioners", link: "/practitioners", icon: "👩‍⚕️" },
    { id: "clinics", label: "Clinics", link: "/clinics", icon: "🏥" },
    { id: "booking-success", label: "Appointments", link: "/booking-success", icon: "📅" },
  ];

  return (
    <>
      <div className="hidden md:block w-64 bg-white dark:bg-gray-800 h-screen shadow-lg fixed left-0 top-0 overflow-y-auto pt-20">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 pl-3">Navigation</h2>
          <nav className="space-y-1">
            {tabs.map((tab) =>
              tab.link ? (
                <NavLink key={tab.id} to={tab.link} className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-l-4 border-blue-500" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}`} onClick={() => setActiveTab(tab.id)}>
                  <span className="mr-3 text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </NavLink>
              ) : (
                <button key={tab.id} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-left ${activeTab === tab.id
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-l-4 border-blue-500"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`} onClick={() => setActiveTab(tab.id)}>
                  <span className="mr-3 text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50 flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Navigation</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700 dark:text-gray-200">
          <Menu size={28} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed top-0 left-0 w-64 h-screen bg-white dark:bg-gray-800 shadow-lg z-50 pt-16 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) =>
              tab.link ? (
                <NavLink key={tab.id} to={tab.link} className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-l-4 border-blue-500" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                  onClick={() => { setActiveTab(tab.id); setMobileOpen(false); }}>
                  <span className="mr-3 text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </NavLink>
              ) : (
                <button key={tab.id} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-left ${activeTab === tab.id ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-l-4 border-blue-500" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                  onClick={() => { setActiveTab(tab.id); setMobileOpen(false); }}>
                  <span className="mr-3 text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default TabNavigation;