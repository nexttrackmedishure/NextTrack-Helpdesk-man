# 🗄️ MongoDB Setup Guide for NextTrack Helpdesk Chat

This guide will help you configure your MongoDB database to work with the chat application.

## 📋 Prerequisites

1. **MongoDB Atlas Account** - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Database Created** - You mentioned you already have users in your MongoDB database
3. **Connection String** - Your MongoDB Atlas connection string

## 🔧 Configuration Steps

### Step 1: Get Your MongoDB Connection String

1. **Login to MongoDB Atlas**
2. **Go to your cluster** → Click "Connect"
3. **Choose "Connect your application"**
4. **Copy the connection string** - it should look like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority
MONGODB_DB=nexttrack-helpdesk
```

**⚠️ Important:** Replace the placeholders with your actual credentials:

- `yourusername` - Your MongoDB Atlas username
- `yourpassword` - Your MongoDB Atlas password
- `yourcluster` - Your cluster name
- `nexttrack-helpdesk` - Your database name (or change to match your existing database)

### Step 3: Test the Connection

1. **Open the test tool**: Open `test-mongodb-connection.html` in your browser
2. **Enter your connection details** in the configuration section
3. **Click "Test Connection"** to verify the format
4. **Click "Save Configuration"** to store the settings

### Step 4: Verify Your Database Structure

Your MongoDB database should have these collections:

```javascript
// users collection
{
  _id: ObjectId,
  idNumber: String,
  fullName: String,
  nickname: String,
  department: String,
  branch: String,
  contactNumber: String,
  email: String,
  password: String, // hashed
  role: String, // "Administrator", "IT Support", "Member"
  profileImage: String, // optional
  createdAt: Date,
  isActive: Boolean,
  lastLogin: Date // optional
}

// messages collection (for chat)
{
  _id: ObjectId,
  conversationId: String,
  senderId: String,
  senderEmail: String,
  text: String,
  timestamp: Date,
  isRead: Boolean,
  createdAt: Date
}

// conversations collection (for chat)
{
  _id: ObjectId,
  userId1: String,
  userId2: String,
  user1Email: String,
  user2Email: String,
  user1Name: String,
  user2Name: String,
  lastMessage: String,
  lastMessageTime: Date,
  createdAt: Date
}
```

## 🚀 How the Chat System Works with MongoDB

### Current Implementation

The chat system is already configured to use your MongoDB database:

1. **User Directory** → Fetches users from MongoDB via `getAllUsers()`
2. **New Chat** → Shows users from your MongoDB database
3. **Real-time Chat** → Uses localStorage for now (can be upgraded to MongoDB)

### User Flow

1. **Login** → User authenticates with credentials from MongoDB
2. **User Directory** → Shows all users from your MongoDB database
3. **New Chat** → Click "New Chat" → Select user from MongoDB → Start conversation
4. **Real-time Messaging** → Messages are stored and synced across windows

## 🔍 Troubleshooting

### Issue: "MongoDB not available, using localStorage fallback"

**Cause:** The MongoDB connection is not properly configured.

**Solution:**

1. Check your `.env.local` file has the correct `MONGODB_URI`
2. Verify your MongoDB Atlas cluster is running
3. Check your IP whitelist in MongoDB Atlas
4. Ensure your username/password are correct

### Issue: "No users found" in chat

**Cause:** The `getAllUsers()` function can't connect to MongoDB.

**Solution:**

1. Check the browser console for connection errors
2. Verify your database has a `users` collection
3. Test the connection using the test tool

### Issue: Users appear in User Directory but not in Chat

**Cause:** The chat system is using a different data source.

**Solution:**

1. The chat system should automatically use MongoDB users
2. Check if `fetchAvailableUsers()` is being called
3. Look for console logs showing "Fetching users from MongoDB..."

## 📊 Testing Your Setup

### Test 1: User Directory

1. Go to **User Directory** tab
2. You should see all your MongoDB users listed
3. If empty, check MongoDB connection

### Test 2: Chat with MongoDB Users

1. Go to **Customers** tab
2. Click **"New Chat"**
3. You should see a list of users from your MongoDB database
4. Select a user and start chatting

### Test 3: Real-time Messaging

1. Open chat in 2 browser windows
2. Login as different users
3. Send messages - they should appear instantly in both windows

## 🔄 Migration from Demo Users

If you have demo users in localStorage that you want to migrate to MongoDB:

1. **Export demo users** from localStorage
2. **Import them** into your MongoDB database
3. **Clear localStorage** to use only MongoDB users

## 📞 Support

If you're still having issues:

1. **Check the browser console** for error messages
2. **Use the test tool** (`test-mongodb-connection.html`) to diagnose issues
3. **Verify your MongoDB Atlas settings** (IP whitelist, user permissions)
4. **Check your network connection** to MongoDB Atlas

## 🎯 Next Steps

Once MongoDB is working:

1. **Test user authentication** with your real users
2. **Test chat functionality** between different users
3. **Consider upgrading** to full MongoDB-based real-time chat (optional)
4. **Set up production environment** with proper security

---

**Your chat system is already configured to use MongoDB users! Just need to set up the connection string.** 🚀
