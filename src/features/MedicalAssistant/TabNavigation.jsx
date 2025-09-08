import { NavLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto hide-scrollbar md:hidden">
        <div className="flex">
          {[
            { id: "assistant", label: "Diagnosis Assistant" },
            { id: "history", label: "Medical History" },
            { id: "info", label: "Health Information" },
            { id: "doctors", label: "Doctor", link: "/doctors" },
            { id: "practitioners", label: "Practitioners", link: "/practitioners" },
            { id: "clinics", label: "Clinics", link: "/clinics" },
            { id: "booking-success", label: "Booking Success", link: "/booking-success" },
          ].map((tab) =>
            tab.link ? (
              <NavLink
                key={tab.id}
                to={tab.link}
                className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs whitespace-nowrap ${activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </NavLink>
            ) : (
              <button
                key={tab.id}
                className={`px-4 py-2 md:px-6 md:py-3 font-medium text-xs whitespace-nowrap ${activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="hidden md:grid border-b border-gray-200 dark:border-gray-700 gap-2">
        <div className="grid grid-cols-4">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "assistant"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("assistant")}
          >
            Diagnosis Assistant
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "history"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("history")}
          >
            Medical History
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "info"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("info")}
          >
            Health Information
          </button>
          <NavLink
            to="/doctors"
            className={`px-4 py-2 font-medium ${activeTab === "doctors"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("doctors")}
          >
            Doctor
          </NavLink>
        </div>

        <div className="grid grid-cols-3">
          <NavLink
            to="/practitioners"
            className={`px-4 py-2 font-medium ${activeTab === "practitioners"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("practitioners")}
          >
            Practitioners
          </NavLink>
          <NavLink
            to="/clinics"
            className={`px-4 py-2 font-medium ${activeTab === "clinics"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("clinics")}
          >
            Clinics
          </NavLink>
          <NavLink
            to="/booking-success"
            className={`px-4 py-2 font-medium ${activeTab === "booking-success"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("booking-success")}
          >
            Booking Success
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
