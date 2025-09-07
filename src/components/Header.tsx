import React from "react";
import { Bell, ChevronDown } from "lucide-react";
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler";

interface HeaderProps {
  onMenuClick: () => void;
  activeTab: string; // Add activeTab prop
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-end">
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
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm font-semibold text-white">M</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Musharof
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tech Support
              </p>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
