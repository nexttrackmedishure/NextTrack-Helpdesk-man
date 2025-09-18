// User storage utility to ensure user accounts persist properly
export interface StoredUser {
  _id: string;
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
  createdAt: Date;
  isActive: boolean;
  lastLogin?: Date;
}

class UserStorage {
  private usersKey = "nexttrack_users";
  private backupKey = "nexttrack_users_backup";

  // Get all users from localStorage
  getAllUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading users from localStorage:", error);
      return [];
    }
  }

  // Save users to localStorage
  saveUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      // Also create a backup
      localStorage.setItem(this.backupKey, JSON.stringify(users));
      console.log("✅ Users saved to localStorage:", users.length, "users");
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  }

  // Add a new user
  addUser(user: StoredUser): void {
    const users = this.getAllUsers();
    users.push(user);
    this.saveUsers(users);
  }

  // Update an existing user
  updateUser(userId: string, updates: Partial<StoredUser>): void {
    const users = this.getAllUsers();
    const userIndex = users.findIndex((user) => user._id === userId);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      this.saveUsers(users);
      console.log("✅ User updated:", userId);
    }
  }

  // Get user by email
  getUserByEmail(email: string): StoredUser | null {
    const users = this.getAllUsers();
    return (
      users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ||
      null
    );
  }

  // Get user by ID
  getUserById(id: string): StoredUser | null {
    const users = this.getAllUsers();
    return users.find((user) => user._id === id) || null;
  }

  // Delete a user
  deleteUser(userId: string): void {
    const users = this.getAllUsers();
    const filteredUsers = users.filter((user) => user._id !== userId);
    this.saveUsers(filteredUsers);
    
    // Also update the backup to prevent restoration of deleted users
    localStorage.setItem(this.backupKey, JSON.stringify(filteredUsers));
    
    console.log("✅ User deleted:", userId);
  }

  // Restore from backup if main storage is empty
  restoreFromBackup(): void {
    try {
      const mainUsers = this.getAllUsers();
      if (mainUsers.length === 0) {
        const backupData = localStorage.getItem(this.backupKey);
        if (backupData) {
          const backupUsers = JSON.parse(backupData);
          this.saveUsers(backupUsers);
          console.log(
            "✅ Restored users from backup:",
            backupUsers.length,
            "users"
          );
        }
      }
    } catch (error) {
      console.error("Error restoring from backup:", error);
    }
  }

  // Clear all user data (use with caution)
  clearAllUsers(): void {
    localStorage.removeItem(this.usersKey);
    localStorage.removeItem(this.backupKey);
    console.log("🧹 All user data cleared");
  }

  // Get user count
  getUserCount(): number {
    return this.getAllUsers().length;
  }

  // Check if user exists
  userExists(email: string): boolean {
    return this.getUserByEmail(email) !== null;
  }

  // Initialize with demo users if no users exist
  initializeWithDemoUsers(): void {
    const users = this.getAllUsers();
    if (users.length === 0) {
      const demoUsers: StoredUser[] = [
        {
          _id: "demo_admin",
          idNumber: "ADMIN001",
          fullName: "System Administrator",
          nickname: "Admin",
          department: "IT",
          branch: "Main Office",
          contactNumber: "1234567890",
          email: "admin@nexttrack.com",
          password: btoa("password123_hashed"),
          role: "Administrator",
          createdAt: new Date(),
          isActive: true,
        },
        {
          _id: "demo_support",
          idNumber: "SUPPORT001",
          fullName: "Support Agent",
          nickname: "Support",
          department: "IT Support",
          branch: "Main Office",
          contactNumber: "1234567891",
          email: "support@nexttrack.com",
          password: btoa("password123_hashed"),
          role: "IT Support",
          createdAt: new Date(),
          isActive: true,
        },
        {
          _id: "demo_user",
          idNumber: "USER001",
          fullName: "Regular User",
          nickname: "User",
          department: "General",
          branch: "Main Office",
          contactNumber: "1234567892",
          email: "user@nexttrack.com",
          password: btoa("password123_hashed"),
          role: "Member",
          createdAt: new Date(),
          isActive: true,
        },
        {
          _id: "demo_reggie",
          idNumber: "REG001",
          fullName: "Reggie Gabayno",
          nickname: "Reggie",
          department: "IT",
          branch: "Main Office",
          contactNumber: "1234567893",
          email: "reggie@medishure.com",
          password: btoa("password123_hashed"),
          role: "Administrator",
          createdAt: new Date(),
          isActive: true,
        },
      ];

      this.saveUsers(demoUsers);
      console.log("✅ Initialized with demo users:", demoUsers.length, "users");
    }
  }

  // Export users data (for backup)
  exportUsers(): string {
    return JSON.stringify(this.getAllUsers(), null, 2);
  }

  // Import users data (for restore)
  importUsers(jsonData: string): boolean {
    try {
      const users = JSON.parse(jsonData);
      if (Array.isArray(users)) {
        this.saveUsers(users);
        console.log("✅ Users imported successfully:", users.length, "users");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing users:", error);
      return false;
    }
  }
}

// Export singleton instance
export const userStorage = new UserStorage();
