import { useState, useEffect, Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./components/Dashboard"));
const TicketGallery = lazy(() => import("./components/TicketGallery"));

function App() {
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

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isNewRequestModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isNewRequestModalOpen]);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
        <Sidebar
          expanded={sidebarExpanded}
          onToggle={toggleSidebar}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {!isNewRequestModalOpen && (
            <Header onMenuClick={toggleSidebar} activeTab={activeTab} />
          )}
          <main
            className={`flex-1 overflow-x-hidden bg-gray-50 dark:bg-dark-900 p-4 md:p-6 ${
              isNewRequestModalOpen ? "overflow-y-hidden" : "overflow-y-auto"
            }`}
          >
            <div className="max-w-full">
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
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
