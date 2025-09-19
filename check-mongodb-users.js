const mongoose = require("mongoose");

// MongoDB connection
const MONGODB_URI = "mongodb+srv://juandelarcr_db_user:p0pgN017t9R6VODJ@cluster0.selxtbr.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority&appName=Cluster0";

// User Schema
const userSchema = new mongoose.Schema(
  {
    idNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    nickname: { type: String, required: true },
    department: { type: String, required: true },
    branch: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Administrator", "IT Support", "Member"], required: true },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

async function checkUsers() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all users
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    console.log(`\n📊 Found ${users.length} users in MongoDB:`);
    console.log("=" * 50);
    
    if (users.length === 0) {
      console.log("❌ No users found in the database!");
      console.log("💡 Run 'node create-sample-user.js' to create a sample user.");
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User Details:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.fullName} (${user.nickname})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Department: ${user.department}`);
        console.log(`   Branch: ${user.branch}`);
        console.log(`   ID Number: ${user.idNumber}`);
        console.log(`   Contact: ${user.contactNumber}`);
        console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
      });
    }

  } catch (error) {
    console.error("❌ Error checking users:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the function
checkUsers();
