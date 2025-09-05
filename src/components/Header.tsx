import React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler";

interface HeaderProps {
  onMenuClick: () => void;
  activeTab: string; // Add activeTab prop
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  return (
    <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">

          {/* Search Bar - Only show when NOT on Dashboard */}
          {activeTab !== "Dashboard" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search or type command..."
                className="w-80 pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-600 rounded border border-gray-200 dark:border-dark-500">
                  ⌘K
                </kbd>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Animated Theme Toggle */}
          <AnimatedThemeToggler />

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">M</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Musharof
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tech Support
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
