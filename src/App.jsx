import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import ChatBot from "./features/ChatBot/ChatBot";
import Routes from "./routes/Routes";

const queryClient = new QueryClient();

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={Routes} />
        <ChatBot />
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;