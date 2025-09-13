import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import ChatBotButton from "./components/ChatBotButton";
import { LanguageProvider } from "./contexts/LanguageContext";
import Routes from "./routes/Routes";

const queryClient = new QueryClient();

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={Routes} />
        <ChatBotButton />
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;