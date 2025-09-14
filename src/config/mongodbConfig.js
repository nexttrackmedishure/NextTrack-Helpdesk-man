// MongoDB Configuration for your API
import { MongoClient } from 'mongodb';

// Your MongoDB connection string
// Replace this with your actual MongoDB API connection string
const MONGODB_URI = process.env.MONGODB_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';
const MONGODB_DB = process.env.MONGODB_DB || 'nexttrack-helpdesk';

let client;
let clientPromise;

if (!MONGODB_URI || MONGODB_URI === 'YOUR_MONGODB_CONNECTION_STRING_HERE') {
  throw new Error('Please define the MONGODB_URI environment variable with your MongoDB connection string');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Database helper functions
export const getDatabase = async () => {
  const client = await clientPromise;
  return client.db(MONGODB_DB);
};

// Collections
export const getCollections = async () => {
  const db = await getDatabase();
  return {
    users: db.collection('users'),
    messages: db.collection('messages'),
    conversations: db.collection('conversations'),
    contacts: db.collection('contacts'),
    tickets: db.collection('tickets')
  };
};

// Connection status check
export const checkConnection = async () => {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to your MongoDB API!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to your MongoDB API:', error);
    return false;
  }
};

// Test your specific MongoDB API
export const testYourMongoDBAPI = async () => {
  try {
    console.log('🧪 Testing your MongoDB API connection...');
    
    const isConnected = await checkConnection();
    if (isConnected) {
      const collections = await getCollections();
      console.log('📊 Available collections:', Object.keys(collections));
      
      // Test a simple operation
      const { users } = collections;
      const userCount = await users.countDocuments();
      console.log(`👥 Current users in your database: ${userCount}`);
      
      return {
        success: true,
        message: 'Your MongoDB API connection successful',
        userCount
      };
    } else {
      return {
        success: false,
        message: 'Your MongoDB API connection failed'
      };
    }
  } catch (error) {
    console.error('❌ MongoDB API test error:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
