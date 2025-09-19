import React, { useState } from 'react';
import { X, Send, Search } from 'lucide-react';

interface ForwardMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForward: (conversationId: string, conversationName: string) => void;
  conversations: Array<{
    id: string;
    name: string;
    type: 'direct' | 'group';
    lastMessage?: string;
    unreadCount?: number;
  }>;
  messageToForward: {
    text?: string;
    type: string;
    images?: Array<{ name: string; url: string; size: number }>;
  } | null;
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  isOpen,
  onClose,
  onForward,
  conversations,
  messageToForward
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleForward = () => {
    if (selectedConversation) {
      const conversation = conversations.find(conv => conv.id === selectedConversation);
      if (conversation) {
        onForward(conversation.id, conversation.name);
        onClose();
        setSelectedConversation(null);
        setSearchTerm('');
      }
    }
  };

  const getMessagePreview = () => {
    if (!messageToForward) return 'No message selected';
    
    if (messageToForward.type === 'image' && messageToForward.images) {
      return `Photo album (${messageToForward.images.length} images)`;
    }
    
    return messageToForward.text || 'Message';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Forward Message
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Forwarding:</p>
            <p className="text-sm text-gray-900 dark:text-white font-medium">
              {getMessagePreview()}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 ${
                  selectedConversation === conversation.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {conversation.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {conversation.type === 'group' ? 'Group' : 'Direct message'}
                    </p>
                  </div>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedConversation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;
