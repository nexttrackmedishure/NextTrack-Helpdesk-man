// Script to create multiple test users for chat application testing
const mongoose = require('mongoose');
require('dotenv').config();

// User schema (matching your server.js)
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  branch: { type: String, required: true },
  idNumber: { type: String, required: true },
  contactNumber: { type: String, required: true },
  role: { type: String, required: true, default: "Member" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const User = mongoose.model("User", userSchema);

// Test users data
const testUsers = [
  {
    fullName: "Alice Johnson",
    nickname: "Alice",
    email: "alice@test.com",
    password: "Test123!",
    department: "IT",
    branch: "Philippines | Manila",
    idNumber: "JIAI-1001",
    contactNumber: "+63 912 345 6789",
    role: "Administrator"
  },
  {
    fullName: "Bob Smith",
    nickname: "Bob",
    email: "bob@test.com",
    password: "Test123!",
    department: "Digital Marketing",
    branch: "Philippines | Bacolod",
    idNumber: "JIAI-1002",
    contactNumber: "+63 923 456 7890",
    role: "IT Support"
  },
  {
    fullName: "Carol Davis",
    nickname: "Carol",
    email: "carol@test.com",
    password: "Test123!",
    department: "Sales and Renewals",
    branch: "Indonesia | Jakarta",
    idNumber: "PLMI-1001",
    contactNumber: "+62 812 345 6789",
    role: "Member"
  },
  {
    fullName: "David Wilson",
    nickname: "David",
    email: "david@test.com",
    password: "Test123!",
    department: "Placement",
    branch: "Indonesia | Bali",
    idNumber: "PLMI-1002",
    contactNumber: "+62 823 456 7890",
    role: "Member"
  },
  {
    fullName: "Eva Brown",
    nickname: "Eva",
    email: "eva@test.com",
    password: "Test123!",
    department: "Claims",
    branch: "Singapore | Tampines",
    idNumber: "BAPL-1001",
    contactNumber: "+65 9123 4567",
    role: "IT Support"
  },
  {
    fullName: "Frank Miller",
    nickname: "Frank",
    email: "frank@test.com",
    password: "Test123!",
    department: "General Insurance (GI)",
    branch: "Philippines | Manila",
    idNumber: "JIAI-1003",
    contactNumber: "+63 934 567 8901",
    role: "Member"
  },
  {
    fullName: "Grace Lee",
    nickname: "Grace",
    email: "grace@test.com",
    password: "Test123!",
    department: "Management",
    branch: "Singapore | Tampines",
    idNumber: "BAPL-1002",
    contactNumber: "+65 9234 5678",
    role: "Administrator"
  },
  {
    fullName: "Henry Chen",
    nickname: "Henry",
    email: "henry@test.com",
    password: "Test123!",
    department: "Administrative",
    branch: "Indonesia | Jakarta",
    idNumber: "PLMI-1003",
    contactNumber: "+62 834 567 8901",
    role: "Member"
  }
];

// Simple password hashing (matching your server.js)
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

async function createTestUsers() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://juandelarcr_db_user:p0pgN017t9R6VODJ@cluster0.selxtbr.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority&appName=Cluster0";
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing test users (optional - remove this if you want to keep existing users)
    console.log("🧹 Clearing existing test users...");
    await User.deleteMany({ 
      email: { $in: testUsers.map(user => user.email) } 
    });

    // Create test users
    console.log("👥 Creating test users...");
    for (const userData of testUsers) {
      const hashedPassword = hashPassword(userData.password);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      console.log(`✅ Created user: ${userData.fullName} (${userData.email})`);
    }

    console.log("\n🎉 All test users created successfully!");
    console.log("\n📋 Test User Credentials:");
    console.log("=" .repeat(50));
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Branch: ${user.branch}`);
      console.log("");
    });

    console.log("🚀 You can now test the chat application with these users!");
    console.log("💡 Open multiple browser windows/tabs and login with different users to test group chats.");

  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createTestUsers();
