import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { LocationProvider } from "./contexts/LocationContext";
import Routes from "./routes/Routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <LocationProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={Routes} />
          </QueryClientProvider>
        </LanguageProvider>
      </LocationProvider>
    </ErrorBoundary>
  );
};

export default App;