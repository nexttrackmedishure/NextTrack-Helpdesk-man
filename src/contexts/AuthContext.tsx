import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userStorage } from "../utils/userStorage";

// Define the user interface
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "support";
  avatar?: string;
}

// Define the authentication context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // No longer initialize demo users - prioritize MongoDB database
        // All users should be managed through MongoDB cloud database

        const storedUser = localStorage.getItem("helpdesk_user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("helpdesk_user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email && password) {
        // No more demo credentials - all authentication through MongoDB

        // Check against registered users using MongoDB API
        try {
          console.log("🔄 Attempting login via MongoDB API for:", email);
          
          // Use MongoDB login API
          const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          console.log("📡 Login API response status:", response.status);

          if (response.ok) {
            const result = await response.json();
            const foundUser = result.user;

            // Map database role to frontend role
            let mappedRole: "admin" | "user" | "support";
            switch (foundUser.role.toLowerCase()) {
              case "administrator":
                mappedRole = "admin";
                break;
              case "it support":
                mappedRole = "support";
                break;
              case "member":
              default:
                mappedRole = "user";
                break;
            }

            const authUser: User = {
              id: foundUser._id?.toString() || Math.random().toString(),
              email: foundUser.email,
              name: foundUser.fullName,
              role: mappedRole,
              avatar:
                foundUser.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  foundUser.fullName
                )}&background=6366f1&color=fff`,
            };

            setUser(authUser);
            localStorage.setItem("helpdesk_user", JSON.stringify(authUser));
            console.log("✅ Login successful via MongoDB API");
            return true;
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.warn("❌ MongoDB login failed:", response.status, errorData);
            console.warn("Checking localStorage fallback...");
          }
        } catch (dbError) {
          console.error("MongoDB login error:", dbError);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("helpdesk_user");
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("helpdesk_user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
