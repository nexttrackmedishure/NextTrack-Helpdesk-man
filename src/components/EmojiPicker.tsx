import React, { useRef, useEffect } from 'react';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position?: { top: number; left: number };
}

const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({ 
  isOpen, 
  onClose, 
  onEmojiSelect, 
  position = { top: 0, left: 0 } 
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle emoji selection from the emoji-picker-react library
  const handleEmojiClick = (emojiObject: any) => {
    onEmojiSelect(emojiObject.emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)'
      }}
    >
      {/* Header with close button */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Choose an emoji
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Emoji Picker from emoji-picker-react */}
      <div className="emoji-picker-wrapper">
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          width={320}
          height={400}
          searchDisabled={false}
          skinTonesDisabled={false}
          previewConfig={{
            showPreview: true,
            defaultEmoji: '1f60a',
            defaultCaption: 'Choose your emoji!'
          }}
          theme={isDark ? Theme.DARK : Theme.LIGHT}
          lazyLoadEmojis={false}
          emojiStyle={EmojiStyle.TWITTER}
          autoFocusSearch={false}
        />
      </div>
    </div>
  );
};

export default EmojiPickerComponent;
