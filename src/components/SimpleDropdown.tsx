import React, { useState } from 'react';
import { MoreVertical, Reply, Forward, Copy, Flag, Trash2 } from 'lucide-react';

interface SimpleDropdownProps {
  message: any;
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
  onCopy?: (message: any) => void;
  onReport?: (message: any) => void;
  onDelete?: (message: any) => void;
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  message,
  onReply,
  onForward,
  onCopy,
  onReport,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log('Dropdown button clicked!');
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      <button 
        id={`dropdownMenuIconButton-${message.id}`}
        onClick={handleClick}
        className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" 
        type="button"
      >
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
        </svg>
      </button>
      
      <div 
        id={`dropdownDots-${message.id}`}
        className={`absolute top-full right-0 mt-1 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600 ${isOpen ? 'block' : 'hidden'}`}
      >
        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby={`dropdownMenuIconButton-${message.id}`}>
          <li>
            <button 
              onClick={() => handleAction(() => onReply?.(message))}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Reply
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleAction(() => onForward?.(message))}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Forward
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleAction(() => onCopy?.(message))}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Copy
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleAction(() => onReport?.(message))}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Report
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleAction(() => onDelete?.(message))}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-red-600 dark:text-red-400"
            >
              Delete
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SimpleDropdown;
