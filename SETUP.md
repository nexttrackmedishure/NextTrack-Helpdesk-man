# NexTrack Helpdesk - Setup Guide

## MongoDB Setup

### 1. Install MongoDB

#### Option A: Local MongoDB Installation

```bash
# Windows (using Chocolatey)
choco install mongodb

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nextrack-helpdesk
MONGODB_DB=nextrack-helpdesk

# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextrack-helpdesk?retryWrites=true&w=majority

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (for notifications)
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM=noreply@nextrack.com

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Development/Production Environment
NODE_ENV=development
```

### 3. Install Dependencies

```bash
# Install bcryptjs for password hashing
npm install bcryptjs
npm install @types/bcryptjs --save-dev

# Install MongoDB driver
npm install mongodb
npm install @types/mongodb --save-dev
```

### 4. Database Collections

The application will automatically create these collections:

- **users** - User accounts and profiles
- **tickets** - Support tickets
- **departments** - Department information
- **categories** - Ticket categories
- **assignees** - IT support assignees

### 5. API Endpoints

- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - Get all tickets

### 6. MongoDB Queries for Testing

```javascript
// Connect to MongoDB shell
mongosh

// Use the database
use nextrack-helpdesk

// View all tickets
db.tickets.find().pretty()

// View tickets by status
db.tickets.find({status: "open"}).pretty()

// Count total tickets
db.tickets.countDocuments()
```

### 7. Security Notes

- Input validation is performed on both client and server
- CORS is configured for API endpoints
- Environment variables are used for sensitive data

### 8. Production Deployment

For production deployment:

1. Use MongoDB Atlas or a managed MongoDB service
2. Set strong JWT secrets
3. Configure proper CORS settings
4. Use HTTPS
5. Set up proper error logging
6. Configure email service for notifications
7. Set up database backups

### 9. Troubleshooting

#### Common Issues:

1. **MongoDB Connection Error**

   - Check if MongoDB is running
   - Verify connection string
   - Check firewall settings

2. **API Route Not Found**
   - Ensure API routes are in `pages/api/` directory
   - Check file naming conventions

### 10. Next Steps

After setting up the system:

1. Implement user authentication
2. Add user login functionality
3. Create user dashboard
4. Implement ticket creation
5. Add email notifications
6. Set up user roles and permissions
