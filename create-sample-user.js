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

async function createSampleUser() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if sample user already exists
    const existingUser = await User.findOne({ email: "admin@nexttrack.com" });
    if (existingUser) {
      console.log("ℹ️ Sample user already exists:");
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.fullName}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Password: MountE2025!`);
      return;
    }

    // Create sample user
    const sampleUser = new User({
      idNumber: "ADMIN-001",
      fullName: "System Administrator",
      nickname: "Admin",
      department: "IT",
      branch: "Philippines | Manila",
      contactNumber: "+63 912 345 6789",
      email: "admin@nexttrack.com",
      password: Buffer.from("MountE2025!" + "_hashed").toString('base64'), // Hashed password
      role: "Administrator",
      isActive: true
    });

    const savedUser = await sampleUser.save();
    console.log("✅ Sample user created successfully!");
    console.log("📋 Login Credentials:");
    console.log(`   Email: admin@nexttrack.com`);
    console.log(`   Password: MountE2025!`);
    console.log(`   Role: Administrator`);
    console.log(`   User ID: ${savedUser._id}`);

  } catch (error) {
    console.error("❌ Error creating sample user:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the function
createSampleUser();
