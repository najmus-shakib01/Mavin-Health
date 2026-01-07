// src/layouts/MedicalAssistantLayout.jsx
import { Outlet } from "react-router-dom";
import ChatBotButton from "../components/ChatBotButton";

const MedicalAssistantLayout = () => {
  return (
    <>
      <Outlet />
      <ChatBotButton />
    </>
  );
};

export default MedicalAssistantLayout;