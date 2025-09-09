import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
      // Simulate API call - replace with actual authentication logic
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication - replace with real validation
      // Demo credentials: admin@nexttrack.com / password123
      if (email && password) {
        // Simple demo validation
        const isValidCredentials =
          (email === "admin@nexttrack.com" && password === "password123") ||
          (email === "user@nexttrack.com" && password === "password123") ||
          (email === "support@nexttrack.com" && password === "password123");

        if (isValidCredentials) {
          const role =
            email === "admin@nexttrack.com"
              ? "admin"
              : email === "support@nexttrack.com"
              ? "support"
              : "user";

          const mockUser: User = {
            id: "1",
            email: email,
            name:
              email.split("@")[0].charAt(0).toUpperCase() +
              email.split("@")[0].slice(1),
            role: role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              email.split("@")[0]
            )}&background=6366f1&color=fff`,
          };

          setUser(mockUser);
          localStorage.setItem("helpdesk_user", JSON.stringify(mockUser));
          return true;
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
