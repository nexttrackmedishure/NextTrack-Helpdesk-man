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

### 5. User Registration

The registration form includes:

- **Full Name** (required)
- **Email** (required, validated)
- **Department** (dropdown selection)
- **Password** (required, strong validation)
- **Confirm Password** (required)
- **Terms Agreement** (required)

### 6. Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Special characters allowed: @$!%\*?&

### 7. API Endpoints

- `POST /api/users/register` - Register new user
- `GET /api/users` - Get all users (admin only)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - Get all tickets

### 8. Testing the Registration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the registration page
3. Fill out the form with valid data
4. Submit the form
5. Check your MongoDB database for the new user

### 9. MongoDB Queries for Testing

```javascript
// Connect to MongoDB shell
mongosh

// Use the database
use nextrack-helpdesk

// View all users
db.users.find().pretty()

// View users by department
db.users.find({department: "IT"}).pretty()

// Count total users
db.users.countDocuments()

// Find user by email
db.users.findOne({email: "user@example.com"})
```

### 10. Security Notes

- Passwords are hashed using bcryptjs with 12 salt rounds
- Email addresses are stored in lowercase
- Input validation is performed on both client and server
- CORS is configured for API endpoints
- Environment variables are used for sensitive data

### 11. Production Deployment

For production deployment:

1. Use MongoDB Atlas or a managed MongoDB service
2. Set strong JWT secrets
3. Configure proper CORS settings
4. Use HTTPS
5. Set up proper error logging
6. Configure email service for notifications
7. Set up database backups

### 12. Troubleshooting

#### Common Issues:

1. **MongoDB Connection Error**

   - Check if MongoDB is running
   - Verify connection string
   - Check firewall settings

2. **Password Validation Error**

   - Ensure password meets requirements
   - Check for special characters

3. **Email Already Exists**

   - Check if user already registered
   - Verify email format

4. **API Route Not Found**
   - Ensure API routes are in `pages/api/` directory
   - Check file naming conventions

### 13. Next Steps

After setting up the registration:

1. Implement user authentication
2. Add user login functionality
3. Create user dashboard
4. Implement ticket creation
5. Add email notifications
6. Set up user roles and permissions
