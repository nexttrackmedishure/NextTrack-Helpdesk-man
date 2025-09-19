require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dtywyqkfg',
  api_key: '765689473539249',
  api_secret: process.env.CLOUDINARY_API_SECRET || '**********' // You need to provide the actual API secret
});

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

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

// Image upload endpoints
app.post("/api/upload/image", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'nexttrack-chat',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload image",
      error: error.message 
    });
  }
});

// Multiple image upload for chat albums
app.post("/api/upload/images", upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No image files provided" 
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'nexttrack-chat/albums',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              size: result.bytes,
              name: file.originalname
            });
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Multiple image upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload images",
      error: error.message 
    });
  }
});

// General file upload
app.post("/api/upload/file", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file provided" 
      });
    }

    // For non-image files, we'll store them locally or use a different service
    // For now, we'll create a simple file info response
    const fileInfo = {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      url: `/uploads/${req.file.originalname}`, // This would be the actual file URL
      publicId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    res.json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload file",
      error: error.message 
    });
  }
});

// User avatar upload
app.post("/api/upload/avatar", upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No avatar file provided" 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'nexttrack-users/avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload avatar",
      error: error.message 
    });
  }
});

// Delete image from Cloudinary
app.delete("/api/upload/image/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: "Image deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }
  } catch (error) {
    console.error("Image deletion error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete image",
      error: error.message 
    });
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
