// WebSocket service for real-time chat functionality
export interface WebSocketMessage {
  type:
    | "message"
    | "conversation_update"
    | "user_typing"
    | "user_online"
    | "user_offline";
  data: any;
  timestamp: string;
  senderEmail: string;
  conversationId?: string;
}

export interface TypingIndicator {
  userEmail: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> =
    new Map();
  private typingHandlers: Map<string, (typing: TypingIndicator) => void> =
    new Map();
  private isConnected = false;
  private currentUserEmail: string | null = null;

  // Initialize WebSocket connection
  connect(userEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.currentUserEmail = userEmail;

        // For development, we'll use a mock WebSocket that simulates real-time behavior
        // In production, this would connect to a real WebSocket server
        console.log("🔌 Initializing WebSocket connection for:", userEmail);

        // Simulate connection success
        setTimeout(() => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log("✅ WebSocket connected successfully");
          resolve();
        }, 100);

        // Set up message broadcasting simulation
        this.setupMessageBroadcasting();
      } catch (error) {
        console.error("❌ WebSocket connection failed:", error);
        reject(error);
      }
    });
  }

  // Simulate WebSocket message broadcasting using localStorage events
  private setupMessageBroadcasting() {
    // Listen for localStorage changes to simulate real-time updates
    window.addEventListener("storage", (event) => {
      if (
        event.key?.startsWith("simple_messages_") ||
        event.key === "simple_conversations"
      ) {
        this.broadcastMessage({
          type: "conversation_update",
          data: { key: event.key, newValue: event.newValue },
          timestamp: new Date().toISOString(),
          senderEmail: this.currentUserEmail || "system",
        });
      }
    });

    // Also listen for custom events (for same-window updates)
    window.addEventListener("localStorageUpdated", (event: any) => {
      if (
        event.detail?.key?.startsWith("simple_messages_") ||
        event.detail?.key === "simple_conversations"
      ) {
        this.broadcastMessage({
          type: "conversation_update",
          data: { key: event.detail.key },
          timestamp: new Date().toISOString(),
          senderEmail: this.currentUserEmail || "system",
        });
      }
    });
  }

  // Broadcast a message to all connected clients
  private broadcastMessage(message: WebSocketMessage) {
    // Simulate broadcasting to other clients
    this.messageHandlers.forEach((handler, handlerId) => {
      try {
        handler(message);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    });
  }

  // Send a message
  sendMessage(message: WebSocketMessage): void {
    if (!this.isConnected) {
      console.warn("WebSocket not connected, cannot send message");
      return;
    }

    console.log("📤 Sending WebSocket message:", message);

    // Simulate sending to server
    // In a real implementation, this would send via WebSocket
    setTimeout(() => {
      this.broadcastMessage(message);
    }, 50);
  }

  // Send typing indicator
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.isConnected || !this.currentUserEmail) return;

    const typingMessage: WebSocketMessage = {
      type: "user_typing",
      data: {
        conversationId,
        isTyping,
        userEmail: this.currentUserEmail,
      },
      timestamp: new Date().toISOString(),
      senderEmail: this.currentUserEmail,
      conversationId,
    };

    this.sendMessage(typingMessage);
  }

  // Subscribe to messages
  onMessage(
    handlerId: string,
    handler: (message: WebSocketMessage) => void
  ): void {
    this.messageHandlers.set(handlerId, handler);
  }

  // Unsubscribe from messages
  offMessage(handlerId: string): void {
    this.messageHandlers.delete(handlerId);
  }

  // Subscribe to typing indicators
  onTyping(
    handlerId: string,
    handler: (typing: TypingIndicator) => void
  ): void {
    this.typingHandlers.set(handlerId, handler);
  }

  // Unsubscribe from typing indicators
  offTyping(handlerId: string): void {
    this.typingHandlers.delete(handlerId);
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    console.log("🔌 WebSocket disconnected");
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Simulate real-time message delivery
  simulateMessageDelivery(conversationId: string, message: any): void {
    const wsMessage: WebSocketMessage = {
      type: "message",
      data: message,
      timestamp: new Date().toISOString(),
      senderEmail: message.senderEmail,
      conversationId,
    };

    // Broadcast to all handlers
    this.broadcastMessage(wsMessage);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
