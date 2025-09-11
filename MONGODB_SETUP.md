# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas as your online database for the NextTrack Helpdesk chat application.

## 🚀 Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**: Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Sign Up**: Create a free account or sign in if you already have one
3. **Choose Plan**: Select the **FREE M0 Sandbox** tier (perfect for development)

## 🏗️ Step 2: Create a Cluster

1. **Create Cluster**: Click "Create a Cluster"
2. **Choose Provider**: Select your preferred cloud provider (AWS, Azure, or Google Cloud)
3. **Select Region**: Choose a region closest to your users
4. **Cluster Name**: Give your cluster a name (e.g., "nexttrack-helpdesk")
5. **Create**: Click "Create Cluster" (takes 3-5 minutes)

## 🔐 Step 3: Configure Security

### Create Database User
1. **Database Access**: Go to "Database Access" in the left sidebar
2. **Add New User**: Click "Add New Database User"
3. **Authentication Method**: Choose "Password"
4. **Username**: Create a username (e.g., "nexttrack-user")
5. **Password**: Generate a secure password (save it!)
6. **Database User Privileges**: Select "Read and write to any database"
7. **Add User**: Click "Add User"

### Configure Network Access
1. **Network Access**: Go to "Network Access" in the left sidebar
2. **Add IP Address**: Click "Add IP Address"
3. **Allow Access**: Choose "Allow access from anywhere" (0.0.0.0/0) for development
   - **For Production**: Add only your server's IP addresses
4. **Confirm**: Click "Confirm"

## 🔗 Step 4: Get Connection String

1. **Clusters**: Go to "Clusters" in the left sidebar
2. **Connect**: Click "Connect" on your cluster
3. **Connect Your Application**: Choose "Connect your application"
4. **Driver**: Select "Node.js" and version "4.1 or later"
5. **Connection String**: Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority`

## ⚙️ Step 5: Configure Your Application

### Create Environment File
1. **Create `.env.local`** in your project root:
```bash
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority
MONGODB_DB=nexttrack-helpdesk
```

2. **Replace Placeholders**:
   - `<username>`: Your database username
   - `<password>`: Your database password
   - `<cluster>`: Your cluster name (e.g., cluster0.abc123)

### Example Connection String
```
MONGODB_URI=mongodb+srv://nexttrack-user:MySecurePassword123@cluster0.abc123.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority
```

## 🧪 Step 6: Test Connection

### Test Database Connection
```javascript
// Add this to your main component or create a test file
import { checkConnection } from './src/config/database.js';

const testConnection = async () => {
  const isConnected = await checkConnection();
  if (isConnected) {
    console.log('✅ MongoDB Atlas connection successful!');
  } else {
    console.log('❌ MongoDB Atlas connection failed!');
  }
};

testConnection();
```

## 📊 Step 7: Database Collections

Your chat application will use these collections:

### Collections Structure
```javascript
// Users collection
{
  _id: ObjectId,
  name: String,
  email: String,
  avatar: String,
  status: String, // 'Online', 'Away', 'Offline'
  createdAt: Date,
  updatedAt: Date
}

// Conversations collection
{
  _id: ObjectId,
  userId1: ObjectId,
  userId2: ObjectId,
  lastMessage: String,
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Messages collection
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  type: String, // 'text', 'voice', 'file', 'image', 'url'
  content: String,
  metadata: Object, // For file info, voice duration, etc.
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Contacts collection
{
  _id: ObjectId,
  userId: ObjectId,
  contactId: ObjectId,
  name: String,
  avatar: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}

// Tickets collection (for helpdesk)
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  status: String, // 'open', 'in-progress', 'resolved', 'closed'
  priority: String, // 'low', 'medium', 'high', 'urgent'
  assignedTo: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Step 8: Integration with Chat App

### Update ChatApplication Component
```javascript
// In your ChatApplication.tsx
import { databaseService } from '../services/databaseService.js';

// Example: Save a message to database
const saveMessage = async (messageData) => {
  try {
    const result = await databaseService.createMessage(messageData);
    console.log('Message saved:', result);
  } catch (error) {
    console.error('Error saving message:', error);
  }
};

// Example: Load messages from database
const loadMessages = async (conversationId) => {
  try {
    const messages = await databaseService.getMessagesByConversation(conversationId);
    setMessages(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};
```

## 🚨 Security Best Practices

### Environment Variables
- ✅ **Never commit** `.env.local` to version control
- ✅ **Add** `.env.local` to your `.gitignore` file
- ✅ **Use strong passwords** for database users
- ✅ **Limit IP access** in production

### Database Security
- ✅ **Use least privilege** principle for database users
- ✅ **Enable encryption** in transit and at rest
- ✅ **Regular backups** (available in Atlas)
- ✅ **Monitor access** through Atlas dashboard

## 📈 Monitoring & Maintenance

### Atlas Dashboard
- **Metrics**: Monitor database performance
- **Logs**: View connection and query logs
- **Alerts**: Set up alerts for performance issues
- **Backups**: Configure automatic backups

### Performance Optimization
- **Indexes**: Create indexes for frequently queried fields
- **Connection Pooling**: Use connection pooling for better performance
- **Query Optimization**: Monitor slow queries

## 🆘 Troubleshooting

### Common Issues
1. **Connection Timeout**: Check IP whitelist and network access
2. **Authentication Failed**: Verify username and password
3. **Database Not Found**: Ensure database name is correct
4. **SSL Issues**: Make sure connection string includes SSL parameters

### Support Resources
- **MongoDB Atlas Documentation**: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- **MongoDB Community**: [https://community.mongodb.com/](https://community.mongodb.com/)
- **Stack Overflow**: Tag questions with `mongodb` and `atlas`

## 🎯 Next Steps

1. **Test Connection**: Verify your database connection works
2. **Create Sample Data**: Add some test users and messages
3. **Implement CRUD Operations**: Use the database service in your chat app
4. **Add Real-time Features**: Implement WebSocket for live messaging
5. **Deploy**: Deploy your app with the MongoDB Atlas connection

---

**Need Help?** Check the MongoDB Atlas documentation or create an issue in your project repository.
