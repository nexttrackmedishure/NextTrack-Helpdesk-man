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
        throw new Error("API not connected");
      }

      const result = await apiService.createConversation(contactData);
      return result.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async getConversations(): Promise<ChatConversation[]> {
    try {
      if (!this.isConnected) {
        return [];
      }

      const result = await apiService.getConversations();
      return result.data || [];
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  }

  // Message management
  async createMessage(
    messageData: Omit<ChatMessage, "id">,
    conversationId: string
  ): Promise<ChatMessage> {
    try {
      if (!this.isConnected) {
        throw new Error("API not connected");
      }

      const result = await apiService.createMessage(
        messageData,
        conversationId
      );
      return result.data;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      if (!this.isConnected) {
        return [];
      }

      const result = await apiService.getMessages(conversationId);
      return result.data || [];
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
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
