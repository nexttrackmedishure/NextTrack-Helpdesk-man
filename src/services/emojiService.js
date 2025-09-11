// Emoji API Service for chat application
const EMOJI_API_BASE_URL = 'https://emoji-api.com/emojis';
const EMOJI_API_KEY = import.meta.env.VITE_EMOJI_API_KEY || 'YOUR_EMOJI_API_KEY_HERE';

export class EmojiService {
  constructor() {
    this.cache = new Map();
    this.categories = [
      'smileys-emotion',
      'people-body', 
      'animals-nature',
      'food-drink',
      'travel-places',
      'activities',
      'objects',
      'symbols',
      'flags'
    ];
  }

  // Get all emojis from the API
  async getAllEmojis() {
    try {
      if (this.cache.has('all-emojis')) {
        return this.cache.get('all-emojis');
      }

      const response = await fetch(`${EMOJI_API_BASE_URL}?access_key=${EMOJI_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }

      // Cache the results
      this.cache.set('all-emojis', data);
      return data;
    } catch (error) {
      console.error('Error fetching emojis:', error);
      // Return fallback emojis if API fails
      return this.getFallbackEmojis();
    }
  }

  // Get emojis by category
  async getEmojisByCategory(category) {
    try {
      const cacheKey = `category-${category}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Check if we have a valid API key
      if (EMOJI_API_KEY === 'YOUR_EMOJI_API_KEY_HERE') {
        console.log('No valid API key found, using fallback emojis');
        return this.getFallbackEmojis();
      }

      const response = await fetch(`${EMOJI_API_BASE_URL}?access_key=${EMOJI_API_KEY}&group=${category}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching emojis for category ${category}:`, error);
      // Return fallback emojis instead of empty array
      return this.getFallbackEmojis();
    }
  }

  // Search emojis by name
  async searchEmojis(query) {
    try {
      const allEmojis = await this.getAllEmojis();
      if (!allEmojis || !Array.isArray(allEmojis)) {
        // Use fallback emojis for search
        const fallbackEmojis = this.getFallbackEmojis();
        const searchTerm = query.toLowerCase();
        return fallbackEmojis.filter(emoji => 
          emoji.unicodeName.toLowerCase().includes(searchTerm) ||
          emoji.slug.toLowerCase().includes(searchTerm)
        );
      }

      const searchTerm = query.toLowerCase();
      return allEmojis.filter(emoji => 
        emoji.unicodeName.toLowerCase().includes(searchTerm) ||
        emoji.slug.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching emojis:', error);
      // Return fallback search results
      const fallbackEmojis = this.getFallbackEmojis();
      const searchTerm = query.toLowerCase();
      return fallbackEmojis.filter(emoji => 
        emoji.unicodeName.toLowerCase().includes(searchTerm) ||
        emoji.slug.toLowerCase().includes(searchTerm)
      );
    }
  }

  // Get popular/recently used emojis
  getRecentEmojis() {
    const recent = localStorage.getItem('recent-emojis');
    return recent ? JSON.parse(recent) : [];
  }

  // Add emoji to recent list
  addToRecent(emoji) {
    try {
      const recent = this.getRecentEmojis();
      const existingIndex = recent.findIndex(e => e.unicodeName === emoji.unicodeName);
      
      if (existingIndex > -1) {
        recent.splice(existingIndex, 1);
      }
      
      recent.unshift(emoji);
      
      // Keep only last 20 emojis
      const limitedRecent = recent.slice(0, 20);
      localStorage.setItem('recent-emojis', JSON.stringify(limitedRecent));
    } catch (error) {
      console.error('Error saving recent emoji:', error);
    }
  }

  // Get fallback emojis when API is not available
  getFallbackEmojis() {
    return [
      { character: '😀', unicodeName: 'grinning face', slug: 'grinning-face' },
      { character: '😃', unicodeName: 'grinning face with big eyes', slug: 'grinning-face-big-eyes' },
      { character: '😄', unicodeName: 'grinning face with smiling eyes', slug: 'grinning-face-smiling-eyes' },
      { character: '😁', unicodeName: 'beaming face with smiling eyes', slug: 'beaming-face-smiling-eyes' },
      { character: '😆', unicodeName: 'grinning squinting face', slug: 'grinning-squinting-face' },
      { character: '😅', unicodeName: 'grinning face with sweat', slug: 'grinning-face-sweat' },
      { character: '🤣', unicodeName: 'rolling on the floor laughing', slug: 'rolling-floor-laughing' },
      { character: '😂', unicodeName: 'face with tears of joy', slug: 'face-tears-joy' },
      { character: '🙂', unicodeName: 'slightly smiling face', slug: 'slightly-smiling-face' },
      { character: '🙃', unicodeName: 'upside-down face', slug: 'upside-down-face' },
      { character: '😉', unicodeName: 'winking face', slug: 'winking-face' },
      { character: '😊', unicodeName: 'smiling face with smiling eyes', slug: 'smiling-face-smiling-eyes' },
      { character: '😇', unicodeName: 'smiling face with halo', slug: 'smiling-face-halo' },
      { character: '🥰', unicodeName: 'smiling face with hearts', slug: 'smiling-face-hearts' },
      { character: '😍', unicodeName: 'smiling face with heart-eyes', slug: 'smiling-face-heart-eyes' },
      { character: '🤩', unicodeName: 'star-struck', slug: 'star-struck' },
      { character: '😘', unicodeName: 'face blowing a kiss', slug: 'face-blowing-kiss' },
      { character: '😗', unicodeName: 'kissing face', slug: 'kissing-face' },
      { character: '😚', unicodeName: 'kissing face with closed eyes', slug: 'kissing-face-closed-eyes' },
      { character: '😙', unicodeName: 'kissing face with smiling eyes', slug: 'kissing-face-smiling-eyes' },
      { character: '😋', unicodeName: 'face savoring food', slug: 'face-savoring-food' },
      { character: '😛', unicodeName: 'face with tongue', slug: 'face-tongue' },
      { character: '😜', unicodeName: 'winking face with tongue', slug: 'winking-face-tongue' },
      { character: '🤪', unicodeName: 'zany face', slug: 'zany-face' },
      { character: '😝', unicodeName: 'squinting face with tongue', slug: 'squinting-face-tongue' },
      { character: '🤑', unicodeName: 'money-mouth face', slug: 'money-mouth-face' },
      { character: '🤗', unicodeName: 'hugging face', slug: 'hugging-face' },
      { character: '🤭', unicodeName: 'face with hand over mouth', slug: 'face-hand-mouth' },
      { character: '🤫', unicodeName: 'shushing face', slug: 'shushing-face' },
      { character: '🤔', unicodeName: 'thinking face', slug: 'thinking-face' },
      { character: '🤐', unicodeName: 'zipper-mouth face', slug: 'zipper-mouth-face' },
      { character: '🤨', unicodeName: 'face with raised eyebrow', slug: 'face-raised-eyebrow' },
      { character: '😐', unicodeName: 'neutral face', slug: 'neutral-face' },
      { character: '😑', unicodeName: 'expressionless face', slug: 'expressionless-face' },
      { character: '😶', unicodeName: 'face without mouth', slug: 'face-without-mouth' },
      { character: '😏', unicodeName: 'smirking face', slug: 'smirking-face' },
      { character: '😒', unicodeName: 'unamused face', slug: 'unamused-face' },
      { character: '🙄', unicodeName: 'face with rolling eyes', slug: 'face-rolling-eyes' },
      { character: '😬', unicodeName: 'grimacing face', slug: 'grimacing-face' },
      { character: '🤥', unicodeName: 'lying face', slug: 'lying-face' },
      { character: '😔', unicodeName: 'pensive face', slug: 'pensive-face' },
      { character: '😪', unicodeName: 'sleepy face', slug: 'sleepy-face' },
      { character: '🤤', unicodeName: 'drooling face', slug: 'drooling-face' },
      { character: '😴', unicodeName: 'sleeping face', slug: 'sleeping-face' },
      { character: '😷', unicodeName: 'face with medical mask', slug: 'face-medical-mask' },
      { character: '🤒', unicodeName: 'face with thermometer', slug: 'face-thermometer' },
      { character: '🤕', unicodeName: 'face with head-bandage', slug: 'face-head-bandage' },
      { character: '🤢', unicodeName: 'nauseated face', slug: 'nauseated-face' },
      { character: '🤮', unicodeName: 'face vomiting', slug: 'face-vomiting' },
      { character: '🤧', unicodeName: 'sneezing face', slug: 'sneezing-face' },
      { character: '🥵', unicodeName: 'hot face', slug: 'hot-face' },
      { character: '🥶', unicodeName: 'cold face', slug: 'cold-face' },
      { character: '🥴', unicodeName: 'woozy face', slug: 'woozy-face' },
      { character: '😵', unicodeName: 'knocked-out face', slug: 'knocked-out-face' },
      { character: '🤯', unicodeName: 'exploding head', slug: 'exploding-head' },
      { character: '🤠', unicodeName: 'cowboy hat face', slug: 'cowboy-hat-face' },
      { character: '🥳', unicodeName: 'partying face', slug: 'partying-face' },
      { character: '😎', unicodeName: 'smiling face with sunglasses', slug: 'smiling-face-sunglasses' },
      { character: '🤓', unicodeName: 'nerd face', slug: 'nerd-face' },
      { character: '🧐', unicodeName: 'face with monocle', slug: 'face-monocle' }
    ];
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await fetch(`${EMOJI_API_BASE_URL}?access_key=${EMOJI_API_KEY}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        return {
          success: false,
          message: data.message,
          suggestion: 'Please check your API key at https://emoji-api.com/'
        };
      }
      
      return {
        success: true,
        message: 'Emoji API connection successful',
        emojiCount: Array.isArray(data) ? data.length : 0
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        suggestion: 'Check your internet connection and API key'
      };
    }
  }
}

// Export singleton instance
export const emojiService = new EmojiService();
