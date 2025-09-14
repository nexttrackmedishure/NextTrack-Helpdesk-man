import { MongoClient, Db } from "mongodb";

// MongoDB connection configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/nextrack-helpdesk";
const MONGODB_DB = process.env.MONGODB_DB || "nextrack-helpdesk";

// Global variables to cache the connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Connect to MongoDB
export async function connectToDatabase() {
  // Check if we have a cached connection
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new MongoDB client
  const client = new MongoClient(MONGODB_URI, {
    // Connection options
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Select the database
    const db = client.db(MONGODB_DB);

    // Cache the client and database
    cachedClient = client;
    cachedDb = db;

    console.log("✅ Connected to MongoDB");
    return { client, db };
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// Close the MongoDB connection
export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("🔌 MongoDB connection closed");
  }
}

// Get the database instance
export function getDatabase(): Db | null {
  return cachedDb;
}

// Get the client instance
export function getClient(): MongoClient | null {
  return cachedClient;
}

// Database collections
export const COLLECTIONS = {
  USERS: "users",
  TICKETS: "tickets",
  DEPARTMENTS: "departments",
  CATEGORIES: "categories",
  ASSIGNEES: "assignees",
} as const;

// User schema validation
export const validateUser = (user: any) => {
  const errors: string[] = [];

  if (
    !user.fullName ||
    typeof user.fullName !== "string" ||
    user.fullName.trim().length < 2
  ) {
    errors.push("Full name must be at least 2 characters");
  }

  if (
    !user.email ||
    typeof user.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
  ) {
    errors.push("Valid email is required");
  }

  if (
    !user.password ||
    typeof user.password !== "string" ||
    user.password.length < 8
  ) {
    errors.push("Password must be at least 8 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Ticket schema validation
export const validateTicket = (ticket: any) => {
  const errors: string[] = [];

  if (
    !ticket.title ||
    typeof ticket.title !== "string" ||
    ticket.title.trim().length < 3
  ) {
    errors.push("Ticket title must be at least 3 characters");
  }

  if (
    !ticket.requestor ||
    typeof ticket.requestor !== "string" ||
    ticket.requestor.trim().length < 2
  ) {
    errors.push("Requestor name is required");
  }

  if (!ticket.department || typeof ticket.department !== "string") {
    errors.push("Department is required");
  }

  if (!ticket.category || typeof ticket.category !== "string") {
    errors.push("Category is required");
  }

  if (!ticket.severity || typeof ticket.severity !== "string") {
    errors.push("Severity level is required");
  }

  if (!ticket.assignee || typeof ticket.assignee !== "string") {
    errors.push("Assignee is required");
  }

  if (
    !ticket.description ||
    typeof ticket.description !== "string" ||
    ticket.description.trim().length < 10
  ) {
    errors.push("Description must be at least 10 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
