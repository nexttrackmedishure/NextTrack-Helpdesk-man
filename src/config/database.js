import { MongoClient } from 'mongodb';

// MongoDB Atlas connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority';
const MONGODB_DB = process.env.MONGODB_DB || 'nexttrack-helpdesk';

let client;
let clientPromise;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
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
    console.log('✅ Successfully connected to MongoDB Atlas!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    return false;
  }
};
