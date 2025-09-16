import { apiService } from "./apiConfig";

// Types for chat functionality
export interface ChatContact {
  id: number;
  name: string;
  email?: string;
  avatar: string;
  status: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  userId?: string; // MongoDB ObjectId as string
  conversationId?: string; // MongoDB conversation ID
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: "agent" | "customer";
  timestamp: string;
  isRead: boolean;
  conversationId?: string; // MongoDB ObjectId as string
  messageId?: string; // MongoDB ObjectId as string
}

export interface ChatConversation {
  _id?: string;
  contactId: number;
  contactName: string;
  contactEmail: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  status: "active" | "closed" | "archived";
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Chat service for managing chat functionality with MongoDB
export class ChatService {
  private isConnected: boolean = false;

  constructor() {
    this.init();
    this.cleanupOldLocalStorageData();
  }

  private cleanupOldLocalStorageData() {
    // Clean up old localStorage keys that might cause conflicts
    const oldKeys = ["conversations", "messages"];
    oldKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 Cleaned up old localStorage key: ${key}`);
      }
    });

    // Add storage event listener for cross-window synchronization
    this.setupStorageSync();
  }

  private setupStorageSync() {
    // Listen for storage changes from other windows
    window.addEventListener("storage", (e) => {
      if (
        e.key === "shared_conversations" ||
        e.key?.startsWith("shared_messages_")
      ) {
        console.log("🔄 Storage changed in another window:", e.key);
        // Trigger a custom event to notify components
        window.dispatchEvent(
          new CustomEvent("localStorageUpdated", {
            detail: { key: e.key, newValue: e.newValue },
          })
        );
      }
    });
  }

  async init() {
    try {
      // Check if we can reach the API service
      const healthCheck = await apiService.healthCheck();
      this.isConnected = healthCheck.status === "healthy";

      if (this.isConnected) {
        console.log("💬 Chat service initialized successfully");
      } else {
        console.warn("⚠️ Chat service initialized but API not available");
      }
    } catch (error) {
      console.error("❌ Failed to initialize chat service:", error);
      this.isConnected = false;
    }
  }

  // Contact management
  async createContact(
    contactData: Omit<ChatContact, "id">
  ): Promise<ChatContact> {
    try {
      if (!this.isConnected) {
        throw new Error("API not connected");
      }

      const result = await apiService.createContact(contactData);
      return result.data;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  async getContacts(): Promise<ChatContact[]> {
    try {
      if (!this.isConnected) {
        // Return mock data if API not connected
        return this.getMockContacts();
      }

      const result = await apiService.getContacts();
      return result.data || [];
    } catch (error) {
      console.error("Error getting contacts:", error);
      // Fallback to mock data
      return this.getMockContacts();
    }
  }

  async updateContact(
    contactId: string,
    updateData: Partial<ChatContact>
  ): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error("API not connected");
      }

      await apiService.updateContact(contactId, updateData);
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  }

  // Conversation management
  async createConversation(
    contactData: ChatContact
  ): Promise<ChatConversation> {
    try {
      if (!this.isConnected) {
        // Fallback to localStorage for testing
        console.log(
          "🔄 Database not connected, using localStorage fallback for conversation"
        );
        return this.createConversationInLocalStorage(contactData);
      }

      const result = await apiService.createConversation(contactData);
      return result.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Fallback to localStorage
      return this.createConversationInLocalStorage(contactData);
    }
  }

  private createConversationInLocalStorage(
    contactData: ChatContact
  ): ChatConversation {
    const conversation: ChatConversation = {
      _id: `conv_${Date.now()}_${contactData.id}`,
      contactId: contactData.id,
      contactName: contactData.name,
      contactEmail: contactData.email,
      agentId: contactData.agentId,
      agentName: contactData.agentName,
      agentEmail: contactData.agentEmail,
      status: "active",
      lastMessage: contactData.lastMessage,
      lastMessageTime: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in localStorage with a shared key that all users can access
    const conversationsKey = "shared_conversations";
    const existingConversations = JSON.parse(
      localStorage.getItem(conversationsKey) || "[]"
    );

    // Check if conversation already exists to avoid duplicates
    // Look for conversations between these two users (either direction)
    const existingConv = existingConversations.find(
      (conv: ChatConversation) =>
        (conv.contactEmail === contactData.email &&
          conv.agentEmail === contactData.agentEmail) ||
        (conv.contactEmail === contactData.agentEmail &&
          conv.agentEmail === contactData.email)
    );

    if (!existingConv) {
      existingConversations.push(conversation);
      localStorage.setItem(
        conversationsKey,
        JSON.stringify(existingConversations)
      );
      console.log("✅ New conversation saved to localStorage:", conversation);
      console.log(
        "📊 Total conversations in localStorage:",
        existingConversations.length
      );
    } else {
      console.log(
        "✅ Conversation already exists in localStorage:",
        existingConv
      );
      return existingConv;
    }

    return conversation;
  }

  async getConversations(): Promise<ChatConversation[]> {
    try {
      if (!this.isConnected) {
        // Fallback to localStorage for testing
        console.log(
          "🔄 Database not connected, using localStorage fallback for conversations"
        );
        return this.getConversationsFromLocalStorage();
      }

      const result = await apiService.getConversations();
      return result.data || [];
    } catch (error) {
      console.error("Error getting conversations:", error);
      // Fallback to localStorage
      return this.getConversationsFromLocalStorage();
    }
  }

  private getConversationsFromLocalStorage(): ChatConversation[] {
    const conversationsKey = "shared_conversations";
    const conversations = JSON.parse(
      localStorage.getItem(conversationsKey) || "[]"
    );
    console.log(
      `📋 Retrieved ${conversations.length} shared conversations from localStorage`
    );
    return conversations;
  }

  // Message management
  async createMessage(
    messageData: Omit<ChatMessage, "id">,
    conversationId: string
  ): Promise<ChatMessage> {
    try {
      if (!this.isConnected) {
        // Fallback to localStorage for testing
        console.log("🔄 Database not connected, using localStorage fallback");
        return this.createMessageInLocalStorage(messageData, conversationId);
      }

      const result = await apiService.createMessage(
        messageData,
        conversationId
      );
      return result.data;
    } catch (error) {
      console.error("Error creating message:", error);
      // Fallback to localStorage
      return this.createMessageInLocalStorage(messageData, conversationId);
    }
  }

  private createMessageInLocalStorage(
    messageData: Omit<ChatMessage, "id">,
    conversationId: string
  ): ChatMessage {
    const message: ChatMessage = {
      id: Date.now(),
      ...messageData,
      conversationId,
    };

    // Store in localStorage with shared key
    const messagesKey = `shared_messages_${conversationId}`;
    const existingMessages = JSON.parse(
      localStorage.getItem(messagesKey) || "[]"
    );
    existingMessages.push(message);
    localStorage.setItem(messagesKey, JSON.stringify(existingMessages));

    // Also update the conversation's last message
    this.updateConversationLastMessage(conversationId, messageData.text);

    console.log("✅ Message saved to shared localStorage:", message);
    return message;
  }

  private updateConversationLastMessage(
    conversationId: string,
    lastMessage: string
  ) {
    const conversationsKey = "shared_conversations";
    const conversations = JSON.parse(
      localStorage.getItem(conversationsKey) || "[]"
    );

    const conversationIndex = conversations.findIndex(
      (conv: ChatConversation) => conv._id === conversationId
    );

    if (conversationIndex !== -1) {
      conversations[conversationIndex].lastMessage = lastMessage;
      conversations[conversationIndex].lastMessageTime = new Date();
      conversations[conversationIndex].updatedAt = new Date();
      localStorage.setItem(conversationsKey, JSON.stringify(conversations));
      console.log("✅ Updated conversation last message:", lastMessage);
    }
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      if (!this.isConnected) {
        // Fallback to localStorage for testing
        console.log(
          "🔄 Database not connected, using localStorage fallback for messages"
        );
        return this.getMessagesFromLocalStorage(conversationId);
      }

      const result = await apiService.getMessages(conversationId);
      return result.data || [];
    } catch (error) {
      console.error("Error getting messages:", error);
      // Fallback to localStorage
      return this.getMessagesFromLocalStorage(conversationId);
    }
  }

  private getMessagesFromLocalStorage(conversationId: string): ChatMessage[] {
    const messagesKey = `shared_messages_${conversationId}`;
    const messages = JSON.parse(localStorage.getItem(messagesKey) || "[]");
    console.log(
      `📨 Retrieved ${messages.length} shared messages from localStorage for conversation ${conversationId}`
    );
    return messages;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      await apiService.markMessageAsRead(messageId);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }

  // Mock data fallback
  private getMockContacts(): ChatContact[] {
    return [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
        status: "Online",
        lastMessage: "Thanks for the help!",
        timestamp: "2 min ago",
        unreadCount: 2,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-2.jpg",
        status: "Away",
        lastMessage: "Can you check my ticket?",
        timestamp: "1 hour ago",
        unreadCount: 0,
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
        status: "Offline",
        lastMessage: "I need assistance",
        timestamp: "2 hours ago",
        unreadCount: 1,
      },
      {
        id: 4,
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-4.jpg",
        status: "Online",
        lastMessage: "Problem resolved",
        timestamp: "30 min ago",
        unreadCount: 0,
      },
      {
        id: 5,
        name: "David Brown",
        email: "david.brown@example.com",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
        status: "Blocked",
        lastMessage: "Inappropriate behavior",
        timestamp: "2 days ago",
        unreadCount: 0,
      },
    ];
  }

  // Health check
  async healthCheck() {
    return {
      service: "ChatService",
      connected: this.isConnected,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const chatService = new ChatService();
