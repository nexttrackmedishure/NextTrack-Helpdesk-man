// Custom hook for MongoDB integration in your chat app
import { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService.js';

export const useMongoDB = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const result = await databaseService.healthCheck();
        
        if (result.status === 'healthy') {
          setIsConnected(true);
          setError(null);
          console.log('✅ MongoDB connected successfully');
        } else {
          setIsConnected(false);
          setError(result.error);
          console.error('❌ MongoDB connection failed:', result.error);
        }
      } catch (err) {
        setIsConnected(false);
        setError(err.message);
        console.error('❌ MongoDB connection error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    databaseService
  };
};

// Hook for managing messages with MongoDB
export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { databaseService } = useMongoDB();

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const messagesData = await databaseService.getMessagesByConversation(conversationId);
      setMessages(messagesData.reverse()); // Show oldest first
    } catch (err) {
      setError(err.message);
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (messageData) => {
    try {
      const result = await databaseService.createMessage(messageData);
      console.log('Message saved to MongoDB:', result);
      
      // Reload messages to show the new one
      await loadMessages();
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error saving message:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    saveMessage
  };
};

// Hook for managing users with MongoDB
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { databaseService } = useMongoDB();

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This would need to be implemented in your database service
      // const usersData = await databaseService.getAllUsers();
      // setUsers(usersData);
      
      console.log('Users loaded from MongoDB');
    } catch (err) {
      setError(err.message);
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const result = await databaseService.createUser(userData);
      console.log('User created in MongoDB:', result);
      
      // Reload users
      await loadUsers();
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error creating user:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    createUser
  };
};
