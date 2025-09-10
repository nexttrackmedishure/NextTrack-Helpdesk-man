import React, { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  activeTab: string; // Add activeTab prop
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 h-20 flex items-center shadow-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Tab Title */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activeTab}
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            {activeTab === "Dashboard" && "Monitor and manage support tickets efficiently"}
            {activeTab === "Tickets" && "View, manage, and track all support tickets"}
            {activeTab === "Customers" && "Manage customer information and relationships"}
            {activeTab === "Knowledge Base" && "Access and manage support documentation"}
            {activeTab === "Analytics" && "View detailed reports and performance metrics"}
            {activeTab === "Categories" && "Organize and manage ticket categories"}
            {activeTab === "History" && "Review past activities and ticket history"}
            {activeTab === "Settings" && "Configure system preferences and options"}
          </p>
        </div>

        {/* Right Section - Modern Design */}
        <div className="flex items-center space-x-3">
          {/* Animated Theme Toggle */}
          <div className="relative">
            <AnimatedThemeToggler />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>


          {/* User Profile */}
          <div
            ref={dropdownRef}
            className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700 relative"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {user ? getUserInitials(user.name) : "U"}
                </span>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role || "User"}
              </p>
            </div>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
