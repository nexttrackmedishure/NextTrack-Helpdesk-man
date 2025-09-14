// User Service for handling user registration
// This is a client-side service that would typically call a backend API

export interface User {
  fullName: string;
  email: string;
  password: string;
  department?: string;
  role?: string;
  createdAt?: Date;
  isActive?: boolean;
  lastLogin?: Date;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
}

// Mock user storage (in a real app, this would be replaced with API calls)
let mockUsers: User[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if email already exists
const emailExists = (email: string): boolean => {
  return mockUsers.some(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
};

// Hash password (in a real app, this would be done on the server)
const hashPassword = async (password: string): Promise<string> => {
  // Simple hash simulation - in production, use proper hashing
  return btoa(password + "_hashed");
};

// Register new user
export const registerUser = async (
  userData: Omit<User, "createdAt" | "isActive" | "lastLogin">
): Promise<RegisterResponse> => {
  try {
    // Simulate API delay
    await delay(1000);

    // Check if email already exists
    if (emailExists(userData.email)) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user object
    const newUser: User = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true,
    };

    // Add to mock storage
    mockUsers.push(newUser);

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

// Get all users (for testing)
export const getAllUsers = (): User[] => {
  return mockUsers.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  });
};

// Get user by email
export const getUserByEmail = (email: string): User | null => {
  const user = mockUsers.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  return null;
};

// Validate user data
export const validateUserData = (
  userData: Partial<User>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!userData.fullName || userData.fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
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

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// For MongoDB integration (when backend is ready)
export const registerUserWithMongoDB = async (
  userData: Omit<User, "createdAt" | "isActive" | "lastLogin">
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
