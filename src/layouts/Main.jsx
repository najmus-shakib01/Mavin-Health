import { Outlet } from "react-router-dom";
import { LanguageProvider } from "../contexts/LanguageContext";

const Main = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </div>
    </LanguageProvider>
  );
};

export default Main;