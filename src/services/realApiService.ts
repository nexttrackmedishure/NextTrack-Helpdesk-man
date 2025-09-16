// Real API service for chat operations
// This service makes actual HTTP calls to the backend API

import { ChatContact, ChatMessage, ChatConversation } from "./chatService";

// API base URL - change this to your backend server URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://your-backend-domain.com"
    : "http://localhost:5000");

export class RealApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
    database: string;
  }> {
    return this.makeRequest("/api/health");
  }

  // Contact operations
  async getContacts(): Promise<{ success: boolean; data: ChatContact[] }> {
    return this.makeRequest("/api/chat/contacts");
  }

  async createContact(
    contactData: Omit<ChatContact, "id">
  ): Promise<{ success: boolean; data: ChatContact }> {
    return this.makeRequest("/api/chat/contacts", {
      method: "POST",
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(
    contactId: string,
    updateData: Partial<ChatContact>
  ): Promise<{ success: boolean; data: ChatContact }> {
    return this.makeRequest("/api/chat/contacts", {
      method: "PUT",
      body: JSON.stringify({
        contactId,
        updateData,
      }),
    });
  }

  // Conversation operations
  async getConversations(): Promise<{
    success: boolean;
    data: ChatConversation[];
  }> {
    return this.makeRequest("/api/chat/conversations");
  }

  async createConversation(
    contactData: ChatContact
  ): Promise<{ success: boolean; data: ChatConversation }> {
    return this.makeRequest("/api/chat/conversations", {
      method: "POST",
      body: JSON.stringify({
        contactData,
      }),
    });
  }

  // Message operations
  async getMessages(
    conversationId: string
  ): Promise<{ success: boolean; data: ChatMessage[] }> {
    return this.makeRequest(
      `/api/chat/messages?conversationId=${conversationId}`
    );
  }

  async createMessage(
    messageData: Omit<ChatMessage, "id">,
    conversationId: string
  ): Promise<{ success: boolean; data: ChatMessage }> {
    return this.makeRequest("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify({
        ...messageData,
        conversationId,
      }),
    });
  }

  async markMessageAsRead(
    messageId: string
  ): Promise<{ success: boolean; data: ChatMessage }> {
    return this.makeRequest("/api/chat/messages", {
      method: "PUT",
      body: JSON.stringify({
        messageId,
      }),
    });
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
