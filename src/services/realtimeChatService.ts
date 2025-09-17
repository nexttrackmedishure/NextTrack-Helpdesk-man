// Real-time chat service that integrates WebSocket with localStorage
import {
  websocketService,
  WebSocketMessage,
  TypingIndicator,
} from "./websocketService";
import {
  chatStorage,
  SimpleConversation,
  SimpleMessage,
} from "../utils/chatStorage";

export interface RealtimeMessage extends SimpleMessage {
  isDelivered?: boolean;
  isRead?: boolean;
}

export interface RealtimeConversation extends SimpleConversation {
  unreadCount?: number;
  lastSeen?: string;
}

class RealtimeChatService {
  private currentUserEmail: string | null = null;
  private messageHandlers: Map<string, (message: RealtimeMessage) => void> =
    new Map();
  private conversationHandlers: Map<
    string,
    (conversation: RealtimeConversation) => void
  > = new Map();
  private typingHandlers: Map<string, (typing: TypingIndicator) => void> =
    new Map();
  private typingTimeouts: Map<string, number> = new Map();

  // Initialize real-time chat for a user
  async initialize(userEmail: string): Promise<void> {
    this.currentUserEmail = userEmail;

    try {
      // Connect to WebSocket
      await websocketService.connect(userEmail);

      // Set up message handlers
      this.setupMessageHandlers();

      console.log("✅ Real-time chat initialized for:", userEmail);
    } catch (error) {
      console.error("❌ Failed to initialize real-time chat:", error);
      throw error;
    }
  }

  // Set up WebSocket message handlers
  private setupMessageHandlers(): void {
    const handlerId = `realtime-chat-${this.currentUserEmail}`;

    websocketService.onMessage(handlerId, (message: WebSocketMessage) => {
      this.handleWebSocketMessage(message);
    });

    websocketService.onTyping(handlerId, (typing: TypingIndicator) => {
      this.handleTypingIndicator(typing);
    });
  }

  // Handle incoming WebSocket messages
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "message":
        this.handleNewMessage(message);
        break;
      case "conversation_update":
        this.handleConversationUpdate(message);
        break;
      case "user_typing":
        this.handleTypingIndicator(message.data);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  // Handle new message
  private handleNewMessage(message: WebSocketMessage): void {
    const realtimeMessage: RealtimeMessage = {
      ...message.data,
      isDelivered: true,
      isRead: false,
    };

    // Notify all message handlers
    this.messageHandlers.forEach((handler) => {
      try {
        handler(realtimeMessage);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    });
  }

  // Handle conversation updates
  private handleConversationUpdate(message: WebSocketMessage): void {
    // Reload conversations from storage
    if (this.currentUserEmail) {
      const conversations = chatStorage.getUserConversations(
        this.currentUserEmail
      );

      conversations.forEach((conv) => {
        const realtimeConv: RealtimeConversation = {
          ...conv,
          unreadCount: this.getUnreadCount(conv.id),
        };

        // Notify conversation handlers
        this.conversationHandlers.forEach((handler) => {
          try {
            handler(realtimeConv);
          } catch (error) {
            console.error("Error in conversation handler:", error);
          }
        });
      });
    }
  }

  // Handle typing indicators
  private handleTypingIndicator(typing: TypingIndicator): void {
    // Don't show typing indicator for current user
    if (typing.userEmail === this.currentUserEmail) return;

    this.typingHandlers.forEach((handler) => {
      try {
        handler(typing);
      } catch (error) {
        console.error("Error in typing handler:", error);
      }
    });
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    text: string,
    type: "text" | "image" | "file" = "text",
    additionalData?: {
      images?: Array<{ name: string; url: string; size: number }>;
      fileName?: string;
      fileSize?: number;
      fileType?: string;
      fileUrl?: string;
    }
  ): Promise<RealtimeMessage> {
    if (!this.currentUserEmail) {
      throw new Error("User not initialized");
    }

    // Add message to storage
    const message = chatStorage.addMessage(
      conversationId,
      this.currentUserEmail,
      text,
      type,
      additionalData
    );

    // Create real-time message
    const realtimeMessage: RealtimeMessage = {
      ...message,
      isDelivered: true,
      isRead: false,
    };

    // Send via WebSocket
    websocketService.sendMessage({
      type: "message",
      data: realtimeMessage,
      timestamp: new Date().toISOString(),
      senderEmail: this.currentUserEmail,
      conversationId,
    });

    // Simulate delivery to other clients
    setTimeout(() => {
      websocketService.simulateMessageDelivery(conversationId, realtimeMessage);
    }, 100);

    return realtimeMessage;
  }

  // Send typing indicator
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.currentUserEmail) return;

    // Clear existing timeout
    const timeoutKey = `${conversationId}-${this.currentUserEmail}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
    }

    // Send typing indicator
    websocketService.sendTypingIndicator(conversationId, isTyping);

    // Auto-stop typing indicator after 3 seconds
    if (isTyping) {
      const timeout = setTimeout(() => {
        websocketService.sendTypingIndicator(conversationId, false);
        this.typingTimeouts.delete(timeoutKey);
      }, 3000);

      this.typingTimeouts.set(timeoutKey, timeout);
    } else {
      this.typingTimeouts.delete(timeoutKey);
    }
  }

  // Create or get conversation
  getOrCreateConversation(
    user1Email: string,
    user1Name: string,
    user2Email: string,
    user2Name: string
  ): RealtimeConversation {
    const conversation = chatStorage.getOrCreateConversation(
      user1Email,
      user1Name,
      user2Email,
      user2Name
    );

    return {
      ...conversation,
      unreadCount: this.getUnreadCount(conversation.id),
    };
  }

  // Get user conversations
  getUserConversations(userEmail: string): RealtimeConversation[] {
    const conversations = chatStorage.getUserConversations(userEmail);

    return conversations.map((conv) => ({
      ...conv,
      unreadCount: this.getUnreadCount(conv.id),
    }));
  }

  // Get conversation messages
  getConversationMessages(conversationId: string): RealtimeMessage[] {
    const messages = chatStorage.getConversationMessages(conversationId);

    return messages.map((msg) => ({
      ...msg,
      isDelivered: true,
      isRead: true, // Mark as read when loading
    }));
  }

  // Get unread count for a conversation
  private getUnreadCount(conversationId: string): number {
    if (!this.currentUserEmail) return 0;

    const messages = chatStorage.getConversationMessages(conversationId);
    return messages.filter(
      (msg) => msg.senderEmail !== this.currentUserEmail && !msg.isRead
    ).length;
  }

  // Mark messages as read
  markMessagesAsRead(conversationId: string): void {
    if (!this.currentUserEmail) return;

    // Use the chatStorage method to mark messages as read
    chatStorage.markMessagesAsRead(conversationId, this.currentUserEmail);

    // Trigger a conversation update to refresh the UI
    websocketService.sendMessage({
      type: "conversation_update",
      data: { conversationId, action: "mark_read" },
      timestamp: new Date().toISOString(),
      senderEmail: this.currentUserEmail,
      conversationId,
    });

    console.log("📖 Marked messages as read for conversation:", conversationId);
  }

  // Subscribe to new messages
  onNewMessage(
    handlerId: string,
    handler: (message: RealtimeMessage) => void
  ): void {
    this.messageHandlers.set(handlerId, handler);
  }

  // Unsubscribe from new messages
  offNewMessage(handlerId: string): void {
    this.messageHandlers.delete(handlerId);
  }

  // Subscribe to conversation updates
  onConversationUpdate(
    handlerId: string,
    handler: (conversation: RealtimeConversation) => void
  ): void {
    this.conversationHandlers.set(handlerId, handler);
  }

  // Unsubscribe from conversation updates
  offConversationUpdate(handlerId: string): void {
    this.conversationHandlers.delete(handlerId);
  }

  // Subscribe to typing indicators
  onTypingIndicator(
    handlerId: string,
    handler: (typing: TypingIndicator) => void
  ): void {
    this.typingHandlers.set(handlerId, handler);
  }

  // Unsubscribe from typing indicators
  offTypingIndicator(handlerId: string): void {
    this.typingHandlers.delete(handlerId);
  }

  // Cleanup
  cleanup(): void {
    const handlerId = `realtime-chat-${this.currentUserEmail}`;

    websocketService.offMessage(handlerId);
    websocketService.offTyping(handlerId);

    this.messageHandlers.clear();
    this.conversationHandlers.clear();
    this.typingHandlers.clear();

    // Clear typing timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();

    websocketService.disconnect();

    console.log("🧹 Real-time chat service cleaned up");
  }
}

// Export singleton instance
export const realtimeChatService = new RealtimeChatService();
