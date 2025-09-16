# MongoDB Setup for Chat Application

## Overview

The chat application is now integrated with MongoDB for persistent data storage. This document explains how to set up and configure the database connection.

## Prerequisites

- MongoDB Atlas account (free tier available)
- Node.js environment with MongoDB driver

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier M0 is sufficient)
4. Create a database user with read/write permissions
5. Whitelist your IP address (or use 0.0.0.0/0 for development)

### 2. Environment Configuration

Create a `.env.local` file in your project root with the following content:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_DB=nexttrack-helpdesk
```

Replace the placeholders:

- `<username>`: Your MongoDB Atlas username
- `<password>`: Your MongoDB Atlas password
- `<cluster>`: Your cluster name (e.g., cluster0.abc123)
- `<database>`: Your database name (e.g., nexttrack-helpdesk)

### 3. Database Collections

The application will automatically create the following collections:

- `users`: User accounts and profiles
- `contacts`: Chat contacts and customer information
- `conversations`: Chat conversation metadata
- `messages`: Individual chat messages
- `tickets`: Support tickets (existing functionality)

### 4. API Endpoints

The following API endpoints are available for chat functionality:

#### Contacts

- `GET /api/chat/contacts` - Get all contacts
- `POST /api/chat/contacts` - Create a new contact
- `PUT /api/chat/contacts` - Update a contact

#### Conversations

- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/conversations` - Create a new conversation

#### Messages

- `GET /api/chat/messages?conversationId=<id>` - Get messages for a conversation
- `POST /api/chat/messages` - Create a new message
- `PUT /api/chat/messages` - Mark message as read

### 5. Features Implemented

#### Create New Chat Button

- Added a prominent "New Chat" button in the chat header
- Allows creating new customer contacts
- Automatically creates conversation and contact records
- Falls back to local storage if database is unavailable

#### Database Integration

- All new chats are saved to MongoDB
- Messages are persisted to the database
- Contact information is stored and retrieved from database
- Real-time updates (future enhancement with WebSocket)

#### Offline Support

- Application works offline with local data
- Automatically syncs when database connection is restored
- Graceful fallback for all database operations

### 6. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to the Customers tab
3. Click the "New Chat" button
4. Enter customer details
5. Send a message
6. Check your MongoDB Atlas dashboard to see the data

### 7. Troubleshooting

#### Connection Issues

- Verify your MongoDB URI is correct
- Check that your IP is whitelisted
- Ensure your database user has proper permissions
- Check the browser console for error messages

#### Data Not Appearing

- Check the Network tab in browser dev tools
- Verify API endpoints are responding
- Check MongoDB Atlas logs for errors
- Ensure collections are being created

### 8. Future Enhancements

- Real-time message synchronization with WebSocket
- Message encryption for security
- File attachment support
- Message search and filtering
- Chat history and archiving
- Multi-agent support
- Customer authentication

## Support

If you encounter issues with the MongoDB setup, check:

1. Browser console for JavaScript errors
2. Network tab for failed API requests
3. MongoDB Atlas dashboard for connection logs
4. Application logs for database service errors
