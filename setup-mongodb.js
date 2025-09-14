// MongoDB API Setup Script
// Run this script to test your MongoDB API connection

import { testYourMongoDBAPI } from './src/config/mongodbConfig.js';

console.log('🚀 MongoDB API Setup Script');
console.log('============================');

// Instructions for setting up your MongoDB API
console.log(`
📋 Setup Instructions:

1. Create a .env.local file in your project root
2. Add your MongoDB connection string:
   MONGODB_URI=your_mongodb_connection_string_here
   MONGODB_DB=nexttrack-helpdesk

3. Example .env.local file:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   MONGODB_DB=nexttrack-helpdesk

4. Replace the connection string with your actual MongoDB API
`);

// Test the connection
const testConnection = async () => {
  try {
    const result = await testYourMongoDBAPI();
    
    if (result.success) {
      console.log('🎉 MongoDB API setup successful!');
      console.log('✅ Your chat application can now use MongoDB as the database');
    } else {
      console.log('❌ MongoDB API setup failed');
      console.log('💡 Please check your connection string and try again');
    }
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
};

// Run the test
testConnection();
