# MongoDB Setup Guide for Chat Application

## Overview

This guide shows you how to set up MongoDB integration for the chat application with real database persistence.

## Prerequisites

- MongoDB Atlas account (free tier available)
- Node.js installed
- Basic understanding of Express.js

## Setup Instructions

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account or sign in
   - Create a new cluster (free tier M0 is sufficient)

2. **Configure Database Access**

   - Create a database user with read/write permissions
   - Whitelist your IP address (or use 0.0.0.0/0 for development)

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### 2. Backend Server Setup

1. **Install Backend Dependencies**

   ```bash
   # Copy the server package.json
   cp server-package.json package.json

   # Install dependencies
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in your project root:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the Backend Server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

### 3. Frontend Integration

1. **Switch to Real API Service**

   Create a `.env` file in your project root:

   ```env
   # Set to "true" to use real MongoDB API, "false" to use mock data
   VITE_USE_REAL_API=true

   # Backend API URL
   VITE_API_BASE_URL=http://localhost:5000
   ```

   The application will automatically use the real API when `VITE_USE_REAL_API=true`.

2. **Update Vite Configuration**

   Add to `vite.config.js`:

   ```javascript
   export default {
     // ... existing config
     server: {
       proxy: {
         "/api": {
           target: "http://localhost:5000",
           changeOrigin: true,
         },
       },
     },
   };
   ```

### 4. Database Collections

The backend will automatically create these collections:

- **contacts**: Chat contacts and customer information
- **conversations**: Chat conversation metadata
- **messages**: Individual chat messages

### 5. API Endpoints

The backend provides these endpoints:

#### Health Check

- `GET /api/health` - Check server and database status

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

### 6. Testing the Setup

1. **Start Backend Server**

   ```bash
   npm run dev
   ```

   You should see: `✅ Connected to MongoDB`

2. **Start Frontend**

   ```bash
   npm run dev
   ```

3. **Test Chat Functionality**
   - Navigate to the Customers tab
   - Click "New Chat" button
   - Create a new contact
   - Send messages
   - Check MongoDB Atlas dashboard to see the data

### 7. Production Deployment

#### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to your hosting service (Netlify, Vercel, etc.)
```

### 8. Features Implemented

✅ **Real Database Persistence**

- All chats saved to MongoDB
- Contact information stored permanently
- Message history preserved
- Conversation metadata tracked

✅ **Scalable Architecture**

- RESTful API design
- Proper error handling
- Database connection management
- Production-ready code

✅ **Development Features**

- Hot reloading with nodemon
- Environment configuration
- Health check endpoints
- CORS enabled for frontend

### 9. Troubleshooting

#### Connection Issues

- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions
- Check network connectivity

#### API Errors

- Verify backend server is running on port 5000
- Check browser console for CORS errors
- Ensure frontend proxy configuration is correct
- Check backend logs for errors

#### Data Not Appearing

- Check MongoDB Atlas dashboard
- Verify API endpoints are responding
- Check browser network tab for failed requests
- Ensure database collections are being created

### 10. Next Steps

- **Real-time Updates**: Add WebSocket support for live messaging
- **Authentication**: Implement user authentication and authorization
- **File Attachments**: Add support for file uploads
- **Message Encryption**: Implement end-to-end encryption
- **Analytics**: Add chat analytics and reporting
- **Multi-agent Support**: Support for multiple support agents

## Support

If you encounter issues:

1. Check the backend server logs
2. Verify MongoDB Atlas connection
3. Test API endpoints with Postman or curl
4. Check browser console for frontend errors
5. Ensure all environment variables are set correctly
