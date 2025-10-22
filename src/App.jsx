import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SessionProvider } from "./contexts/SessionContext";
import "./App.css";
import ChatBotButton from "./components/ChatBotButton";
import ErrorBoundary from "./components/ErrorBoundary";
import Routes from "./routes/Routes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary> 
      <LanguageProvider>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={Routes} />
            <ChatBotButton />
          </QueryClientProvider>
        </SessionProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;