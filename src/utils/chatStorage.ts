// Simple chat storage utility for localStorage-based conversations
export interface SimpleConversation {
  id: string;
  user1Email: string;
  user2Email: string;
  user1Name: string;
  user2Name: string;
  lastMessage: string;
  lastMessageTime: string;
  createdAt: string;
  type: "direct" | "group";
  groupName?: string;
  groupMembers?: Array<{
    email: string;
    name: string;
    role: "admin" | "member";
  }>;
  createdBy?: string;
}

export interface SimpleMessage {
  id: string;
  conversationId: string;
  senderEmail: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  type?: "text" | "image" | "file" | "audio";
  images?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  audioUrl?: string;
  duration?: string;
  fileUrl?: string;
}

class ChatStorage {
  private conversationsKey = "chat_conversations";
  private messagesKey = "chat_messages";

  // Get all conversations
  getAllConversations(): SimpleConversation[] {
    try {
      const data = localStorage.getItem(this.conversationsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading conversations:", error);
      return [];
    }
  }

  // Get conversations for a specific user
  getUserConversations(userEmail: string): SimpleConversation[] {
    const allConversations = this.getAllConversations();
    return allConversations.filter((conv) => {
      if (conv.type === "direct") {
        return conv.user1Email === userEmail || conv.user2Email === userEmail;
      } else if (conv.type === "group") {
        return conv.groupMembers?.some(member => member.email === userEmail);
      }
      return false;
    });
  }

  // Create or get existing conversation between two users
  getOrCreateConversation(
    user1Email: string,
    user1Name: string,
    user2Email: string,
    user2Name: string
  ): SimpleConversation {
    const allConversations = this.getAllConversations();

    // Look for existing conversation between these two users
    let conversation = allConversations.find(
      (conv) =>
        conv.type === "direct" &&
        ((conv.user1Email === user1Email && conv.user2Email === user2Email) ||
        (conv.user1Email === user2Email && conv.user2Email === user1Email))
    );

    if (!conversation) {
      // Create new conversation
      conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user1Email,
        user2Email,
        user1Name,
        user2Name,
        lastMessage: "Conversation started",
        lastMessageTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: "direct",
      };

      allConversations.push(conversation);
      localStorage.setItem(
        this.conversationsKey,
        JSON.stringify(allConversations)
      );
      console.log("✅ Created new direct conversation:", conversation);
    } else {
      console.log("✅ Found existing direct conversation:", conversation);
    }

    return conversation;
  }

  // Create a new group conversation
  createGroupConversation(
    groupName: string,
    createdByEmail: string,
    createdByName: string,
    members: Array<{ email: string; name: string }>
  ): SimpleConversation {
    const allConversations = this.getAllConversations();
    
    // Add the creator as the first member with admin role
    const groupMembers = [
      { email: createdByEmail, name: createdByName, role: "admin" as const },
      ...members.map(member => ({ ...member, role: "member" as const }))
    ];

    const conversation: SimpleConversation = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user1Email: createdByEmail,
      user2Email: "", // Not used for groups
      user1Name: createdByName,
      user2Name: "", // Not used for groups
      lastMessage: `${createdByName} created the group`,
      lastMessageTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: "group",
      groupName,
      groupMembers,
      createdBy: createdByEmail,
    };

    allConversations.push(conversation);
    localStorage.setItem(
      this.conversationsKey,
      JSON.stringify(allConversations)
    );
    console.log("✅ Created new group conversation:", conversation);
    
    return conversation;
  }

  // Get messages for a conversation
  getConversationMessages(conversationId: string): SimpleMessage[] {
    try {
      const data = localStorage.getItem(this.messagesKey);
      const allMessages: SimpleMessage[] = data ? JSON.parse(data) : [];
      return allMessages.filter((msg) => msg.conversationId === conversationId);
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }

  // Add a message to a conversation
  addMessage(
    conversationId: string,
    senderEmail: string,
    text: string,
    type: "text" | "image" | "file" | "audio" = "text",
    additionalData?: {
      images?: Array<{ name: string; url: string; size: number }>;
      fileName?: string;
      fileSize?: number;
      fileType?: string;
      fileUrl?: string;
      audioUrl?: string;
      duration?: string;
    }
  ): SimpleMessage {
    const message: SimpleMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderEmail,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
      type,
      ...additionalData,
    };

    // Add message to storage
    const allMessages = this.getAllMessages();
    allMessages.push(message);
    localStorage.setItem(this.messagesKey, JSON.stringify(allMessages));

    // Update conversation's last message
    const lastMessageText = type === "image" ? "📷 Image" : 
                           type === "file" ? `📎 ${additionalData?.fileName || "File"}` : 
                           type === "audio" ? "🎤 Voice message" :
                           text;
    this.updateConversationLastMessage(conversationId, lastMessageText);

    console.log("✅ Added message:", message);
    return message;
  }

  // Get all messages
  private getAllMessages(): SimpleMessage[] {
    try {
      const data = localStorage.getItem(this.messagesKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }

  // Update conversation's last message
  private updateConversationLastMessage(
    conversationId: string,
    lastMessage: string
  ) {
    const conversations = this.getAllConversations();
    const conversationIndex = conversations.findIndex(
      (conv) => conv.id === conversationId
    );

    if (conversationIndex !== -1) {
      conversations[conversationIndex].lastMessage = lastMessage;
      conversations[conversationIndex].lastMessageTime =
        new Date().toISOString();
      localStorage.setItem(
        this.conversationsKey,
        JSON.stringify(conversations)
      );
      console.log("✅ Updated conversation last message");
    }
  }

  // Clear all chat data
  clearAllData() {
    localStorage.removeItem(this.conversationsKey);
    localStorage.removeItem(this.messagesKey);
    console.log("🧹 Cleared all chat data");
  }

  // Get contact name for a user in a conversation
  getContactName(
    conversation: SimpleConversation,
    currentUserEmail: string
  ): string {
    if (conversation.type === "group") {
      return conversation.groupName || "Group Chat";
    }
    return conversation.user1Email === currentUserEmail
      ? conversation.user2Name
      : conversation.user1Name;
  }

  // Get contact email for a user in a conversation
  getContactEmail(
    conversation: SimpleConversation,
    currentUserEmail: string
  ): string {
    return conversation.user1Email === currentUserEmail
      ? conversation.user2Email
      : conversation.user1Email;
  }

  // Mark messages as read for a conversation
  markMessagesAsRead(conversationId: string, currentUserEmail: string): void {
    try {
      const allMessages = this.getAllMessages();
      let hasUpdates = false;

      // Mark all unread messages from other users as read
      allMessages.forEach((message) => {
        if (
          message.conversationId === conversationId &&
          message.senderEmail !== currentUserEmail &&
          !message.isRead
        ) {
          message.isRead = true;
          hasUpdates = true;
        }
      });

      // Save updated messages if there were changes
      if (hasUpdates) {
        localStorage.setItem(this.messagesKey, JSON.stringify(allMessages));
        console.log("✅ Marked messages as read for conversation:", conversationId);
        
        // Trigger storage event for cross-window synchronization
        window.dispatchEvent(
          new CustomEvent("localStorageUpdated", {
            detail: { key: this.messagesKey, conversationId },
          })
        );
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  // Delete all messages for a conversation
  deleteMessages(conversationId: string): void {
    try {
      const allMessages = this.getAllMessages();
      const filteredMessages = allMessages.filter(
        (msg) => msg.conversationId !== conversationId
      );
      
      localStorage.setItem(this.messagesKey, JSON.stringify(filteredMessages));
      console.log("🗑️ Deleted messages for conversation:", conversationId);
      
      // Trigger storage event for cross-window synchronization
      window.dispatchEvent(
        new CustomEvent("localStorageUpdated", {
          detail: { key: this.messagesKey, conversationId },
        })
      );
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  }

  // Delete a conversation
  deleteConversation(userEmail: string, conversationId: string): void {
    try {
      const allConversations = this.getAllConversations();
      const filteredConversations = allConversations.filter(
        (conv) => conv.id !== conversationId
      );
      
      localStorage.setItem(this.conversationsKey, JSON.stringify(filteredConversations));
      console.log("🗑️ Deleted conversation:", conversationId);
      
      // Trigger storage event for cross-window synchronization
      window.dispatchEvent(
        new CustomEvent("localStorageUpdated", {
          detail: { key: this.conversationsKey, conversationId },
        })
      );
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  }

  // Add member to group
  addMemberToGroup(conversationId: string, member: { email: string; name: string }): boolean {
    try {
      const allConversations = this.getAllConversations();
      const conversationIndex = allConversations.findIndex(conv => conv.id === conversationId);
      
      if (conversationIndex === -1 || allConversations[conversationIndex].type !== "group") {
        return false;
      }

      const conversation = allConversations[conversationIndex];
      if (!conversation.groupMembers) {
        conversation.groupMembers = [];
      }

      // Check if member already exists
      const memberExists = conversation.groupMembers.some(m => m.email === member.email);
      if (memberExists) {
        return false;
      }

      conversation.groupMembers.push({ ...member, role: "member" });
      localStorage.setItem(this.conversationsKey, JSON.stringify(allConversations));
      console.log("✅ Added member to group:", member);
      return true;
    } catch (error) {
      console.error("Error adding member to group:", error);
      return false;
    }
  }

  // Remove member from group
  removeMemberFromGroup(conversationId: string, memberEmail: string): boolean {
    try {
      const allConversations = this.getAllConversations();
      const conversationIndex = allConversations.findIndex(conv => conv.id === conversationId);
      
      if (conversationIndex === -1 || allConversations[conversationIndex].type !== "group") {
        return false;
      }

      const conversation = allConversations[conversationIndex];
      if (!conversation.groupMembers) {
        return false;
      }

      conversation.groupMembers = conversation.groupMembers.filter(m => m.email !== memberEmail);
      localStorage.setItem(this.conversationsKey, JSON.stringify(allConversations));
      console.log("✅ Removed member from group:", memberEmail);
      return true;
    } catch (error) {
      console.error("Error removing member from group:", error);
      return false;
    }
  }

  // Check if user is member of group
  isGroupMember(conversationId: string, userEmail: string): boolean {
    try {
      const allConversations = this.getAllConversations();
      const conversation = allConversations.find(conv => conv.id === conversationId);
      
      if (!conversation || conversation.type !== "group" || !conversation.groupMembers) {
        return false;
      }

      return conversation.groupMembers.some(member => member.email === userEmail);
    } catch (error) {
      console.error("Error checking group membership:", error);
      return false;
    }
  }
}

// Export singleton instance
export const chatStorage = new ChatStorage();
