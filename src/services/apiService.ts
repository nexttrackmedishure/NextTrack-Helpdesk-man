// Simple API service for chat operations
// This service simulates API calls and can be easily replaced with real API endpoints

import { ChatContact, ChatMessage, ChatConversation } from "./chatService";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data storage (in a real app, this would be replaced with actual API calls)
let mockContacts: ChatContact[] = [
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
];

let mockConversations: ChatConversation[] = [];
let mockMessages: ChatMessage[] = [];

export class ApiService {
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    await delay(100);
    return {
      status: "healthy",
      timestamp: new Date(),
    };
  }

  // Contact operations
  async getContacts(): Promise<{ success: boolean; data: ChatContact[] }> {
    await delay(200);
    return {
      success: true,
      data: [...mockContacts],
    };
  }

  async createContact(
    contactData: Omit<ChatContact, "id">
  ): Promise<{ success: boolean; data: ChatContact }> {
    await delay(300);

    const newContact: ChatContact = {
      id: Math.max(...mockContacts.map((c) => c.id), 0) + 1,
      ...contactData,
    };

    mockContacts.push(newContact);

    return {
      success: true,
      data: newContact,
    };
  }

  async updateContact(
    contactId: string,
    updateData: Partial<ChatContact>
  ): Promise<{ success: boolean; message: string }> {
    await delay(200);

    const contactIndex = mockContacts.findIndex(
      (c) => c.id.toString() === contactId
    );
    if (contactIndex !== -1) {
      mockContacts[contactIndex] = {
        ...mockContacts[contactIndex],
        ...updateData,
      };
      return {
        success: true,
        message: "Contact updated successfully",
      };
    }

    return {
      success: false,
      message: "Contact not found",
    };
  }

  // Conversation operations
  async getConversations(): Promise<{
    success: boolean;
    data: ChatConversation[];
  }> {
    await delay(200);
    return {
      success: true,
      data: [...mockConversations],
    };
  }

  async createConversation(
    contactData: ChatContact
  ): Promise<{ success: boolean; data: ChatConversation }> {
    await delay(300);

    const newConversation: ChatConversation = {
      _id: `conv_${Date.now()}`,
      contactId: contactData.id,
      contactName: contactData.name,
      contactEmail: contactData.email || "",
      status: "active",
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockConversations.push(newConversation);

    return {
      success: true,
      data: newConversation,
    };
  }

  // Message operations
  async getMessages(
    conversationId: string
  ): Promise<{ success: boolean; data: ChatMessage[] }> {
    await delay(200);

    const messages = mockMessages.filter(
      (m) => m.conversationId === conversationId
    );

    return {
      success: true,
      data: messages,
    };
  }

  async createMessage(
    messageData: Omit<ChatMessage, "id">,
    conversationId: string
  ): Promise<{ success: boolean; data: ChatMessage }> {
    await delay(200);

    const newMessage: ChatMessage = {
      id: Math.max(...mockMessages.map((m) => m.id), 0) + 1,
      ...messageData,
      conversationId,
    };

    mockMessages.push(newMessage);

    // Update contact's last message
    const contact = mockContacts.find((c) => c.userId === conversationId);
    if (contact) {
      contact.lastMessage = messageData.text;
      contact.timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return {
      success: true,
      data: newMessage,
    };
  }

  async markMessageAsRead(
    messageId: string
  ): Promise<{ success: boolean; message: string }> {
    await delay(100);

    const message = mockMessages.find((m) => m.id.toString() === messageId);
    if (message) {
      message.isRead = true;
      return {
        success: true,
        message: "Message marked as read",
      };
    }

    return {
      success: false,
      message: "Message not found",
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
