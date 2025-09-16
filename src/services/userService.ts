// User Service for handling user registration and management
// This service handles user operations with MongoDB integration

import { userStorage } from "../utils/userStorage";

export interface User {
  _id?: string;
  idNumber: string;
  fullName: string;
  nickname: string;
  department: string;
  branch: string;
  contactNumber: string;
  email: string;
  password: string;
  role: "Administrator" | "IT Support" | "Member";
  profileImage?: string;
  createdAt?: Date;
  isActive?: boolean;
  lastLogin?: Date;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
}

export interface UserDirectoryUser extends Omit<User, "password"> {
  id: string;
  status: "active" | "inactive";
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Hash password (in a real app, this would be done on the server)
const hashPassword = async (password: string): Promise<string> => {
  // Simple hash simulation - in production, use proper hashing
  return btoa(password + "_hashed");
};

// Register new user
export const registerUser = async (
  userData: Omit<User, "createdAt" | "isActive" | "lastLogin" | "_id">
): Promise<RegisterResponse> => {
  try {
    // Simulate API delay
    await delay(1000);

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user object
    const newUser: User = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true,
    };

    try {
      // Try to save to MongoDB first
      const { DatabaseService } = await import("./databaseService.js");
      const dbService = new DatabaseService();
      const result = await dbService.createUser(newUser);
      console.log("User registered in MongoDB:", result);
    } catch (dbError) {
      console.warn(
        "MongoDB not available, using localStorage fallback:",
        dbError
      );

      // Fallback to localStorage using userStorage
      const newUserWithId = {
        ...newUser,
        _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      userStorage.addUser(newUserWithId);
      console.log("User saved to localStorage:", newUserWithId);
    }

    // Return success response (without password)
    const { password, ...userWithoutPassword } = newUser;

    return {
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Registration failed. Please try again.",
    };
  }
};

// Get all users (for user directory)
export const getAllUsers = async (): Promise<UserDirectoryUser[]> => {
  try {
    await delay(500);

    try {
      // Try to fetch from MongoDB first
      const { DatabaseService } = await import("./databaseService.js");
      const dbService = new DatabaseService();
      const users = await dbService.getAllUsers();
      console.log("Fetched users from MongoDB:", users);

      // Transform database users to UserDirectoryUser format
      const transformedUsers: UserDirectoryUser[] = users.map((user: any) => ({
        id: user._id?.toString() || Math.random().toString(),
        idNumber: user.idNumber || "",
        fullName: user.fullName || "",
        nickname: user.nickname || "",
        department: user.department || "",
        branch: user.branch || "",
        contactNumber: user.contactNumber || "",
        email: user.email || "",
        role: user.role || "Member",
        profileImage: user.profileImage || null,
        createdAt: user.createdAt || new Date(),
        isActive: user.isActive !== false, // Default to true if not specified
        lastLogin: user.lastLogin || null,
        status: user.isActive !== false ? "active" : "inactive",
      }));

      return transformedUsers;
    } catch (dbError) {
      console.warn(
        "MongoDB not available, using localStorage fallback:",
        dbError
      );

      // Fallback to localStorage using userStorage
      const localUsers = userStorage.getAllUsers();
      console.log("Fetched users from localStorage:", localUsers);

      // Transform localStorage users to UserDirectoryUser format
      const transformedUsers: UserDirectoryUser[] = localUsers.map(
        (user: any) => ({
          id: user._id || Math.random().toString(),
          idNumber: user.idNumber || "",
          fullName: user.fullName || "",
          nickname: user.nickname || "",
          department: user.department || "",
          branch: user.branch || "",
          contactNumber: user.contactNumber || "",
          email: user.email || "",
          role: user.role || "Member",
          profileImage: user.profileImage || null,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          isActive: user.isActive !== false, // Default to true if not specified
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          status: user.isActive !== false ? "active" : "inactive",
        })
      );

      return transformedUsers;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array if both database and localStorage fail
    return [];
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    await delay(300);

    // Mock implementation - in real app, this would query the database
    const users = await getAllUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      return user as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
};

// Validate user data
export const validateUserData = (
  userData: Partial<User>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!userData.idNumber || userData.idNumber.trim().length < 3) {
    errors.push("ID Number must be at least 3 characters");
  }

  if (!userData.fullName || userData.fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  }

  if (!userData.nickname || userData.nickname.trim().length < 2) {
    errors.push("Nickname must be at least 2 characters");
  }

  if (!userData.department || userData.department.trim().length < 2) {
    errors.push("Department is required");
  }

  if (!userData.branch || userData.branch.trim().length < 2) {
    errors.push("Branch is required");
  }

  if (!userData.contactNumber || userData.contactNumber.trim().length < 8) {
    errors.push("Contact number must be at least 8 characters");
  }

  if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push("Valid email is required");
  }

  if (!userData.password || userData.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (
    userData.password &&
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(
      userData.password
    )
  ) {
    errors.push("Password must contain uppercase, lowercase, and number");
  }

  if (!userData.role) {
    errors.push("Role is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// For MongoDB integration (when backend is ready)
export const registerUserWithMongoDB = async (
  userData: Omit<User, "createdAt" | "isActive" | "lastLogin" | "_id">
): Promise<RegisterResponse> => {
  try {
    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message,
        user: result.user,
      };
    } else {
      return {
        success: false,
        message: result.message || "Registration failed",
      };
    }
  } catch (error) {
    console.error("MongoDB registration error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};
