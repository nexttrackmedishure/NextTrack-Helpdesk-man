import React from 'react';

interface TypingIndicatorProps {
  userName: string;
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {userName} is typing
          </span>
          <div className="flex space-x-1">
            <div 
              className="typing-dot animate-bounce" 
              style={{ animationDelay: '0ms' }}
            ></div>
            <div 
              className="typing-dot animate-bounce" 
              style={{ animationDelay: '150ms' }}
            ></div>
            <div 
              className="typing-dot animate-bounce" 
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
