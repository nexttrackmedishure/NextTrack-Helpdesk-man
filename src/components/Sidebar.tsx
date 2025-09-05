import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  Settings,
  BarChart3,
  FolderOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  activeTab: string; // Add activeTab prop
  onTabChange: (tabName: string) => void; // Add onTabChange prop
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle, activeTab, onTabChange }) => {
  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: MessageSquare, label: "Tickets" },
    { icon: Users, label: "Customers" },
    { icon: FileText, label: "Knowledge Base" },
    { icon: BarChart3, label: "Analytics" },
    { icon: FolderOpen, label: "Categories" },
    { icon: Clock, label: "History" },
    { icon: Settings, label: "Settings" },
  ];

  // Function to handle tab clicks
  const handleTabClick = (label: string) => {
    onTabChange(label);
  };

  return (
    <div
      className={`sidebar-transition bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 relative ${
        expanded ? "w-64" : "w-16"
      }`}
    >
      {/* Logo Section - Height matched with header */}
      <div className="flex items-center h-20 border-b border-gray-200 dark:border-dark-700 relative">
        {expanded ? (
          <div className="flex items-center space-x-3 ml-6 mr-8">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="NexTrack Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                NexTrack
              </span>
              <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '8pt' }}>
                IT Asset Management System
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center mx-auto rounded-lg overflow-hidden">
            <img 
              src="/logo.png" 
              alt="NexTrack Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleTabClick(item.label)}
                className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  activeTab === item.label
                    ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    expanded ? "mr-3" : "mx-auto"
                  } ${activeTab === item.label ? "text-primary-600 dark:text-primary-400" : "group-hover:scale-110"}`}
                />
                {expanded && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button - Positioned above break line with smooth animations */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600 z-10 group"
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <div className="transition-all duration-300 ease-in-out transform group-hover:scale-110">
          {expanded ? (
            <ChevronLeft className="w-3 h-3 transition-transform duration-300 ease-in-out group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight className="w-3 h-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          )}
        </div>
      </button>
    </div>
  );
};

export default Sidebar;
