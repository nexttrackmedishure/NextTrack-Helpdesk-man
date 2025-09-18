require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://juandelarcr_db_user:p0pgN017t9R6VODJ@cluster0.selxtbr.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// MongoDB Schemas
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    status: { type: String, default: "Online" },
    lastMessage: { type: String, default: "No messages yet" },
    timestamp: { type: String, default: "now" },
    unreadCount: { type: Number, default: 0 },
    userId: { type: String, unique: true },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    contactId: { type: Number, required: true },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    agentId: { type: String },
    status: { type: String, default: "active" },
    lastMessage: { type: String },
    lastMessageTime: { type: Date },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    sender: { type: String, enum: ["agent", "customer"], required: true },
    timestamp: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    conversationId: { type: String, required: true },
    messageId: { type: String, unique: true },
  },
  { timestamps: true }
);

// User Schema for user management
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

// Models
const Contact = mongoose.model("Contact", contactSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);
const User = mongoose.model("User", userSchema);

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Contact routes
app.get("/api/chat/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/chat/contacts", async (req, res) => {
  try {
    const { name, email, avatar, status, lastMessage, timestamp, unreadCount } =
      req.body;

    const newContact = new Contact({
      name,
      email,
      avatar,
      status: status || "Online",
      lastMessage: lastMessage || "New conversation started",
      timestamp: timestamp || "now",
      unreadCount: unreadCount || 0,
      userId: `user_${Date.now()}`,
    });

    const savedContact = await newContact.save();
    res.status(201).json({ success: true, data: savedContact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/chat/contacts", async (req, res) => {
  try {
    const { contactId, updateData } = req.body;

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      updateData,
      { new: true }
    );

    if (!updatedContact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact not found" });
    }

    res.json({ success: true, data: updatedContact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Conversation routes
app.get("/api/chat/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find({}).sort({ updatedAt: -1 });
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/chat/conversations", async (req, res) => {
  try {
    const { contactData } = req.body;

    const newConversation = new Conversation({
      contactId: contactData.id,
      contactName: contactData.name,
      contactEmail: contactData.email || "",
      status: "active",
      unreadCount: 0,
    });

    const savedConversation = await newConversation.save();
    res.status(201).json({ success: true, data: savedConversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Message routes
app.get("/api/chat/messages", async (req, res) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res
        .status(400)
        .json({ success: false, error: "Conversation ID required" });
    }

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/chat/messages", async (req, res) => {
  try {
    const { text, sender, timestamp, isRead, conversationId } = req.body;

    const newMessage = new Message({
      text,
      sender,
      timestamp,
      isRead: isRead || false,
      conversationId,
      messageId: `msg_${Date.now()}`,
    });

    const savedMessage = await newMessage.save();

    // Update conversation's last message
    await Conversation.findOneAndUpdate(
      { _id: conversationId },
      {
        lastMessage: text,
        lastMessageTime: new Date(),
      }
    );

    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/chat/messages", async (req, res) => {
  try {
    const { messageId } = req.body;

    const updatedMessage = await Message.findOneAndUpdate(
      { messageId },
      { isRead: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });
    }

    res.json({ success: true, data: updatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Management Routes

// Register new user
app.post("/api/users/register", async (req, res) => {
  try {
    const {
      idNumber,
      fullName,
      nickname,
      department,
      branch,
      contactNumber,
      email,
      password,
      role,
      profileImage
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { idNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? "Email already exists" 
          : "ID Number already exists"
      });
    }

    // Hash password (simple base64 encoding for now)
    const hashedPassword = Buffer.from(password + "_hashed").toString('base64');

    // Create new user
    const newUser = new User({
      idNumber,
      fullName,
      nickname,
      department,
      branch,
      contactNumber,
      email,
      password: hashedPassword,
      role,
      profileImage,
      isActive: true
    });

    const savedUser = await newUser.save();

    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message
    });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by email (for login)
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const hashedPassword = Buffer.from(password + "_hashed").toString('base64');
    if (user.password !== hashedPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle password update if provided
    if (updateData.password) {
      // Hash the new password
      const hashedPassword = Buffer.from(updateData.password + "_hashed").toString('base64');
      updateData.password = hashedPassword;
    } else {
      // Remove password from update data if not provided
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("User update error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("User deletion error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
