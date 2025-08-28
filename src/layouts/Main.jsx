import { Outlet } from "react-router-dom";
import { LanguageProvider } from "../contexts/LanguageContext";

const Main = () => {
  return (
    <LanguageProvider>
      <Outlet />
    </LanguageProvider>
  );
};

export default Main;
