import { useState, useEffect, Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./components/Dashboard"));
const TicketGallery = lazy(() => import("./components/TicketGallery"));
const ChatApplication = lazy(() => import("./components/ChatApplication"));

// Authenticated App Component
function AuthenticatedApp() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Update document title when activeTab changes
  useEffect(() => {
    document.title = `NexTrack | ${activeTab}`;
  }, [activeTab]);

  // Prevent body scrolling when modal is open or when in Customers tab
  useEffect(() => {
    if (isNewRequestModalOpen || activeTab === "Customers") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isNewRequestModalOpen, activeTab]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {!isNewRequestModalOpen && <Header activeTab={activeTab} />}
        <main
          className={`flex-1 overflow-x-hidden bg-gray-50 dark:bg-dark-900 ${
            activeTab === "Customers" ? "p-0" : "p-4 md:p-6"
          } ${
            isNewRequestModalOpen || activeTab === "Customers" ? "overflow-y-hidden" : "overflow-y-auto"
          }`}
        >
          <div className={activeTab === "Customers" ? "h-full" : "max-w-full"}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              {activeTab === "Dashboard" && <Dashboard />}
              {activeTab === "Tickets" && (
                <TicketGallery
                  isNewRequestModalOpen={isNewRequestModalOpen}
                  setIsNewRequestModalOpen={setIsNewRequestModalOpen}
                />
              )}
              {activeTab === "Customers" && <ChatApplication />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

// Main App Component with Authentication
function App() {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Login onLogin={login} />
      </ThemeProvider>
    );
  }

  // Show authenticated app if logged in
  return (
    <ThemeProvider>
      <AuthenticatedApp />
    </ThemeProvider>
  );
}

export default App;
