// Test MongoDB Atlas connection
import { checkConnection, getCollections } from '../config/database.js';

export const testDatabaseConnection = async () => {
  console.log('🧪 Testing MongoDB Atlas connection...');
  
  try {
    // Test basic connection
    const isConnected = await checkConnection();
    
    if (isConnected) {
      console.log('✅ MongoDB Atlas connection successful!');
      
      // Test collections access
      const collections = await getCollections();
      console.log('📊 Available collections:', Object.keys(collections));
      
      // Test a simple operation
      const { users } = collections;
      const userCount = await users.countDocuments();
      console.log(`👥 Current users in database: ${userCount}`);
      
      return {
        success: true,
        message: 'Database connection and operations successful',
        userCount
      };
    } else {
      console.log('❌ MongoDB Atlas connection failed!');
      return {
        success: false,
        message: 'Database connection failed'
      };
    }
  } catch (error) {
    console.error('❌ Database test error:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
};

// Test database operations
export const testDatabaseOperations = async () => {
  console.log('🧪 Testing database operations...');
  
  try {
    const collections = await getCollections();
    
    // Test creating a sample user
    const sampleUser = {
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://via.placeholder.com/150',
      status: 'Online'
    };
    
    const userResult = await collections.users.insertOne(sampleUser);
    console.log('✅ Sample user created:', userResult.insertedId);
    
    // Test creating a sample message
    const sampleMessage = {
      conversationId: 'test-conversation',
      senderId: userResult.insertedId,
      type: 'text',
      content: 'Hello from MongoDB Atlas!',
      isRead: false
    };
    
    const messageResult = await collections.messages.insertOne(sampleMessage);
    console.log('✅ Sample message created:', messageResult.insertedId);
    
    // Clean up test data
    await collections.users.deleteOne({ _id: userResult.insertedId });
    await collections.messages.deleteOne({ _id: messageResult.insertedId });
    console.log('🧹 Test data cleaned up');
    
    return {
      success: true,
      message: 'All database operations successful',
      operations: ['create_user', 'create_message', 'cleanup']
    };
  } catch (error) {
    console.error('❌ Database operations test error:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
};

// Run all tests
export const runAllDatabaseTests = async () => {
  console.log('🚀 Running all database tests...');
  
  const connectionTest = await testDatabaseConnection();
  const operationsTest = await testDatabaseOperations();
  
  const results = {
    connection: connectionTest,
    operations: operationsTest,
    overall: connectionTest.success && operationsTest.success
  };
  
  if (results.overall) {
    console.log('🎉 All database tests passed!');
  } else {
    console.log('⚠️ Some database tests failed. Check the logs above.');
  }
  
  return results;
};
