import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export const AnimatedThemeToggler: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    // Prevent multiple rapid clicks
    if (isAnimating) return;
    
    setIsAnimating(true);
    toggleTheme();

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={`
          relative w-12 h-12 rounded-full p-2 transition-all duration-300 ease-in-out cursor-pointer
          ${
            theme === "light"
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }
          hover:scale-105 active:scale-95
          ${isAnimating ? "animate-pulse" : ""}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transform-gpu
          ${isAnimating ? "pointer-events-none" : "pointer-events-auto"}
        `}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        type="button"
      >
        {/* Icon container - properly centered */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </div>
      </button>
    </div>
  );
};
