# 🚀 Chat Application Testing Guide

This guide will help you set up and test the group chat functionality with multiple user accounts.

## 📋 Prerequisites

- Node.js installed
- MongoDB connection (already configured)
- Your development environment set up

## 🛠️ Quick Setup (Automated)

### Option 1: Windows Batch Script
```bash
# Double-click or run in command prompt
setup-test-environment.bat
```

### Option 2: PowerShell Script
```powershell
# Run in PowerShell
.\setup-test-environment.ps1
```

### Option 3: Manual Setup
```bash
# 1. Create test users
node create-test-users.js

# 2. Start backend server (in one terminal)
node server.js

# 3. Start frontend server (in another terminal)
npm run dev

# 4. Open test setup page
# Open test-chat-setup.html in your browser
```

## 👥 Test User Accounts

The setup creates 8 test users with different roles and locations:

| Name | Email | Password | Role | Branch |
|------|-------|----------|------|--------|
| Alice Johnson | alice@test.com | Test123! | Administrator | Philippines \| Manila |
| Bob Smith | bob@test.com | Test123! | IT Support | Philippines \| Bacolod |
| Carol Davis | carol@test.com | Test123! | Member | Indonesia \| Jakarta |
| David Wilson | david@test.com | Test123! | Member | Indonesia \| Bali |
| Eva Brown | eva@test.com | Test123! | IT Support | Singapore \| Tampines |
| Frank Miller | frank@test.com | Test123! | Member | Philippines \| Manila |
| Grace Lee | grace@test.com | Test123! | Administrator | Singapore \| Tampines |
| Henry Chen | henry@test.com | Test123! | Member | Indonesia \| Jakarta |

## 🧪 Testing Scenarios

### 1. Direct Message Testing
1. Open 2 browser windows
2. Login as Alice in one window, Bob in another
3. Start a conversation between them
4. Send messages back and forth
5. Verify messages appear in real-time

### 2. Group Chat Creation
1. Login as Alice (Administrator)
2. Click "Create Group" or "+" button
3. Name the group "Project Team"
4. Add Bob, Carol, and David as members
5. Create the group
6. Verify the group appears in Alice's conversation list

### 3. Group Management
1. As Alice, open the group settings
2. Add Eva to the group
3. Remove David from the group
4. Verify changes are reflected immediately

### 4. Multi-User Group Chat
1. Have Alice, Bob, Carol, and Eva all join the group
2. Send messages from different users
3. Verify all users see messages in real-time
4. Test typing indicators

### 5. Real-time Updates
1. Add/remove members from a group
2. Verify all users see the changes instantly
3. Test message delivery and read status

## 🔧 Manual Testing Steps

### Step 1: Open Multiple Browser Windows
- Open 3-4 browser windows or tabs
- Use the test setup page to open login windows with pre-filled credentials

### Step 2: Login Different Users
- Window 1: Login as Alice (alice@test.com / Test123!)
- Window 2: Login as Bob (bob@test.com / Test123!)
- Window 3: Login as Carol (carol@test.com / Test123!)
- Window 4: Login as Eva (eva@test.com / Test123!)

### Step 3: Test Direct Messages
1. In Alice's window, start a chat with Bob
2. Send a message from Alice
3. Check Bob's window - message should appear
4. Reply from Bob's window
5. Verify real-time message delivery

### Step 4: Test Group Creation
1. In Alice's window, click "Create Group"
2. Name: "Development Team"
3. Add members: Bob, Carol, Eva
4. Create the group
5. Verify group appears in all users' conversation lists

### Step 5: Test Group Chat
1. All users join the group conversation
2. Send messages from different users
3. Verify all users see all messages
4. Test typing indicators

### Step 6: Test Group Management
1. As Alice (admin), open group settings
2. Add Henry to the group
3. Remove Carol from the group
4. Verify changes appear for all users

## 🐛 Troubleshooting

### Common Issues

**1. Users not appearing in group creation**
- Check if test users were created successfully
- Run `node create-test-users.js` again
- Verify MongoDB connection

**2. Messages not appearing in real-time**
- Check if both frontend and backend servers are running
- Verify WebSocket connection in browser dev tools
- Check console for errors

**3. Group management not working**
- Ensure you're logged in as an admin (Alice or Grace)
- Check if the user has proper permissions
- Verify group membership

**4. Login issues**
- Make sure backend server is running on port 5000
- Check MongoDB connection
- Verify user credentials in the database

### Debug Commands

```bash
# Check if users exist in MongoDB
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(() => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  User.find({}).then(users => {
    console.log('Users in database:', users.length);
    users.forEach(u => console.log(u.email, u.fullName));
    process.exit();
  });
});
"

# Check server status
curl http://localhost:5000/api/health
curl http://localhost:3000
```

## 📊 Expected Results

### ✅ Success Indicators
- All 8 test users can login successfully
- Direct messages work between any two users
- Groups can be created with multiple members
- Group management (add/remove members) works
- Real-time message delivery across all users
- Typing indicators appear for other users
- Group conversations show member count and names

### ❌ Failure Indicators
- Users cannot login
- Messages don't appear in real-time
- Group creation fails
- Group management doesn't work
- Console errors in browser or server

## 🎯 Advanced Testing

### Performance Testing
- Create groups with 10+ members
- Send rapid messages to test real-time performance
- Test with multiple groups simultaneously

### Edge Cases
- Try to add users who are already in the group
- Remove the group creator (admin)
- Test with users from different branches
- Test group deletion

### Browser Compatibility
- Test in Chrome, Firefox, Safari, Edge
- Test on mobile devices
- Test with different screen sizes

## 📝 Notes

- All test users use the same password: `Test123!`
- Users are created with realistic data matching your system
- The test setup automatically handles user creation and cleanup
- You can modify the test users in `create-test-users.js` if needed

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server console for errors
3. Verify MongoDB connection
4. Ensure all servers are running
5. Try recreating the test users

Happy testing! 🎉
