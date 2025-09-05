import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import TicketGallery from "./components/TicketGallery";

function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

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
          <Header onMenuClick={toggleSidebar} activeTab={activeTab} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-dark-900 p-4 md:p-6">
            <div className="max-w-full">
              {activeTab === "Dashboard" && <Dashboard />}
              {activeTab === "Tickets" && <TicketGallery />}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
