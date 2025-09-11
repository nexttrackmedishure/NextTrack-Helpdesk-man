import React, { useState, useEffect, useRef } from 'react';
import { emojiService, EmojiData } from '../services/emojiService';
import { X, Smile } from 'lucide-react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position?: { top: number; left: number };
}

interface Emoji {
  character: string;
  unicodeName: string;
  slug: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  isOpen, 
  onClose, 
  onEmojiSelect, 
  position = { top: 0, left: 0 } 
}) => {
  const [emojis, setEmojis] = useState<EmojiData[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<EmojiData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('smileys-emotion');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'smileys-emotion', name: 'Smileys', icon: <Smile className="w-4 h-4" /> }
  ];

  // Load emojis when component mounts or category changes
  useEffect(() => {
    if (isOpen) {
      loadEmojis();
    }
  }, [isOpen, selectedCategory]);


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

  const loadEmojis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get emojis from API, fallback to basic emojis if it fails
      try {
        const data = await emojiService.getEmojisByCategory(selectedCategory);
        const emojiData = Array.isArray(data) ? data : [];
        setEmojis(emojiData);
        setFilteredEmojis(emojiData);
      } catch (apiError) {
        console.log('API not available, using fallback emojis');
        // Use fallback emojis when API fails
        const fallbackEmojis = emojiService.getFallbackEmojis();
        setEmojis(fallbackEmojis);
        setFilteredEmojis(fallbackEmojis);
      }
    } catch (err) {
      console.error('Error loading emojis:', err);
      // Use fallback emojis as last resort
      const fallbackEmojis = emojiService.getFallbackEmojis();
      setEmojis(fallbackEmojis);
      setFilteredEmojis(fallbackEmojis);
    } finally {
      setIsLoading(false);
    }
  };


  const handleEmojiClick = (emoji: Emoji) => {
    emojiService.addToRecent(emoji);
    onEmojiSelect(emoji.character);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-80 max-h-96 overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)'
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Choose an emoji
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

      </div>

      {/* Categories */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400"
          >
            {category.icon}
            {category.name}
          </div>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-3 max-h-64 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading emojis...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500 dark:text-red-400 mb-2">{error}</p>
            <button
              onClick={loadEmojis}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredEmojis.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No emojis available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji.character}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-lg"
                title={emoji.unicodeName}
              >
                {emoji.character}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Powered by <a href="https://emoji-api.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Emoji API</a>
        </p>
      </div>
    </div>
  );
};

export default EmojiPicker;
