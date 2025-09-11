import { getDatabase, getCollections, checkConnection } from '../config/database.js';

// Database service for chat application
export class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.init();
  }

  async init() {
    this.isConnected = await checkConnection();
    if (this.isConnected) {
      console.log('🗄️ Database service initialized successfully');
    }
  }

  // User management
  async createUser(userData) {
    try {
      const { users } = await getCollections();
      const result = await users.insertOne({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const { users } = await getCollections();
      return await users.findOne({ _id: userId });
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const { users } = await getCollections();
      return await users.updateOne(
        { _id: userId },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Message management
  async createMessage(messageData) {
    try {
      const { messages } = await getCollections();
      const result = await messages.insertOne({
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessagesByConversation(conversationId, limit = 50, skip = 0) {
    try {
      const { messages } = await getCollections();
      return await messages
        .find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async updateMessage(messageId, updateData) {
    try {
      const { messages } = await getCollections();
      return await messages.updateOne(
        { _id: messageId },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  // Conversation management
  async createConversation(conversationData) {
    try {
      const { conversations } = await getCollections();
      const result = await conversations.insertOne({
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversationsByUser(userId) {
    try {
      const { conversations } = await getCollections();
      return await conversations
        .find({ 
          $or: [
            { userId1: userId },
            { userId2: userId }
          ]
        })
        .sort({ updatedAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  async updateConversation(conversationId, updateData) {
    try {
      const { conversations } = await getCollections();
      return await conversations.updateOne(
        { _id: conversationId },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  // Contact management
  async createContact(contactData) {
    try {
      const { contacts } = await getCollections();
      const result = await contacts.insertOne({
        ...contactData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async getContactsByUser(userId) {
    try {
      const { contacts } = await getCollections();
      return await contacts
        .find({ userId })
        .sort({ name: 1 })
        .toArray();
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  // Ticket management (for helpdesk functionality)
  async createTicket(ticketData) {
    try {
      const { tickets } = await getCollections();
      const result = await tickets.insertOne({
        ...ticketData,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async getTicketsByUser(userId) {
    try {
      const { tickets } = await getCollections();
      return await tickets
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting tickets:', error);
      throw error;
    }
  }

  async updateTicket(ticketId, updateData) {
    try {
      const { tickets } = await getCollections();
      return await tickets.updateOne(
        { _id: ticketId },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  // Real-time message streaming (for future WebSocket implementation)
  async watchMessages(conversationId, callback) {
    try {
      const { messages } = await getCollections();
      const changeStream = messages.watch([
        { $match: { 'fullDocument.conversationId': conversationId } }
      ]);
      
      changeStream.on('change', (change) => {
        callback(change);
      });

      return changeStream;
    } catch (error) {
      console.error('Error watching messages:', error);
      throw error;
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const db = await getDatabase();
      const result = await db.admin().ping();
      return {
        status: 'healthy',
        timestamp: new Date(),
        result
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
