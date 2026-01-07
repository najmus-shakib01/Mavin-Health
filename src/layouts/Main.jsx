import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import ChatBotButton from "../components/ChatBotButton";

const Main = () => {
  const [setShowFooter] = useState(true);
  const location = useLocation();
  
  // Check current page
  const isHomePage = location.pathname === '/';
  const isLegalPage = location.pathname.includes('terms-of-service') || 
                      location.pathname.includes('privacy-policy');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Main Content */}
      <Outlet />
      
      {/* Show ChatBotButton only on home page (not on legal pages) */}
      {isHomePage && <ChatBotButton />}
      
      {/* Show Footer only on legal pages */}
      {isLegalPage && (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Medical Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your private AI symptom checker
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6">
                <Link 
                  to="/terms-of-service" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowFooter(false)}
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacy-policy" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowFooter(false)}
                >
                  Privacy Policy
                </Link>
                <a 
                  href="mailto:support@medicalassistant.ai" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⚠️ This AI system is not a licensed healthcare provider. Information provided is for educational purposes only. 
                In emergencies, call your local emergency number immediately.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                © {new Date().getFullYear()} Medical Assistant. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Main;