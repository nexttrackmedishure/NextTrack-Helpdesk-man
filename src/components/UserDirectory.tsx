import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import { getAllUsers, UserDirectoryUser } from "../services/userService";
import NewUserRegistrationModal from "./NewUserRegistrationModal";
import ViewUserModal from "./ViewUserModal";
import EditUserModal from "./EditUserModal";

const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<UserDirectoryUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showRegistrationModal, setShowRegistrationModal] =
    useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserDirectoryUser | null>(
    null
  );
  const [showUserActions, setShowUserActions] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">(
    "down"
  );

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserActions) {
        const target = event.target as Element;
        const dropdown = target.closest(".user-actions-dropdown");
        const button = target.closest("[data-user-id]");

        // If click is outside both dropdown and button, close the dropdown
        if (!dropdown && !button) {
          setShowUserActions(null);
        }
      }
    };

    // Add event listener when dropdown is open
    if (showUserActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserActions]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user creation
  const handleUserCreated = () => {
    loadUsers(); // Reload users list
  };

  // Handle user actions
  const handleUserAction = (action: string, user: UserDirectoryUser) => {
    setSelectedUser(user);
    setShowUserActions(null);

    switch (action) {
      case "view":
        setShowViewModal(true);
        break;
      case "edit":
        setShowEditModal(true);
        break;
      case "delete":
        handleDeleteUser(user);
        break;
      case "toggle-status":
        handleToggleUserStatus(user);
        break;
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user: UserDirectoryUser) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.fullName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      // Simulate API call to delete user
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove user from local state
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));

      alert(`User "${user.fullName}" has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  // Handle toggle user status
  const handleToggleUserStatus = async (user: UserDirectoryUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    const confirmToggle = window.confirm(
      `Are you sure you want to ${action} user "${user.fullName}"?`
    );

    if (!confirmToggle) return;

    try {
      // Simulate API call to update user status
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user status in local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id
            ? { ...u, status: newStatus, isActive: newStatus === "active" }
            : u
        )
      );

      alert(`User "${user.fullName}" has been ${action}d successfully.`);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  // Handle user update from edit modal
  const handleUserUpdated = (updatedUser: UserDirectoryUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  // Function to determine dropdown direction with collision detection
  const determineDropdownDirection = (userId: string) => {
    const userIndex = filteredUsers.findIndex((user) => user.id === userId);
    const totalUsers = filteredUsers.length;

    // Get the button element to check its position
    const buttonElement = document.querySelector(`[data-user-id="${userId}"]`);

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = 200; // Approximate height of dropdown menu
      const dropdownWidth = 192; // 48 * 4 (w-48 in Tailwind)

      // Check available space
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      // Check for collisions with other table elements and rows
      const tableContainer =
        buttonElement.closest("table") ||
        buttonElement.closest(".overflow-x-auto");
      let collisionDetected = false;
      let preferredDirection = "down";

      if (tableContainer) {
        const tableRect = tableContainer.getBoundingClientRect();

        // Check if dropdown would extend beyond table boundaries
        const dropdownBottom = rect.bottom + dropdownHeight;
        const dropdownTop = rect.top - dropdownHeight;

        // Check for collision with table bottom
        if (dropdownBottom > tableRect.bottom) {
          collisionDetected = true;
          preferredDirection = "up";
        }

        // Check for collision with table top
        if (dropdownTop < tableRect.top) {
          collisionDetected = true;
          preferredDirection = "down";
        }

        // Check for collision with other table rows
        const allTableRows = tableContainer.querySelectorAll("tbody tr");
        const currentRow = buttonElement.closest("tr");

        if (allTableRows && currentRow) {
          allTableRows.forEach((row) => {
            if (row !== currentRow) {
              const rowRect = row.getBoundingClientRect();

              // Check if dropdown would overlap with other rows when going down
              if (
                dropdownBottom > rowRect.top &&
                dropdownBottom < rowRect.bottom
              ) {
                collisionDetected = true;
                preferredDirection = "up";
              }

              // Check if dropdown would overlap with other rows when going up
              if (dropdownTop < rowRect.bottom && dropdownTop > rowRect.top) {
                collisionDetected = true;
                preferredDirection = "down";
              }
            }
          });
        }
      }

      // Enhanced positioning logic with collision detection
      const fitsDown = spaceBelow >= dropdownHeight && !collisionDetected;
      const fitsUp = spaceAbove >= dropdownHeight && !collisionDetected;
      const fitsRight = spaceRight >= dropdownWidth;

      // Smart direction selection
      if (collisionDetected) {
        // If collision detected, use preferred direction
        setDropdownDirection(preferredDirection);
      } else if (fitsDown && fitsRight) {
        setDropdownDirection("down");
      } else if (fitsUp && fitsRight) {
        setDropdownDirection("up");
      } else if (fitsDown && !fitsUp) {
        setDropdownDirection("down");
      } else if (fitsUp && !fitsDown) {
        setDropdownDirection("up");
      } else {
        // Neither direction fits perfectly, choose the one with more space
        setDropdownDirection(spaceBelow > spaceAbove ? "down" : "up");
      }
      return;
    }

    // Fallback: Use row position logic with more aggressive upward positioning
    const isLastRow = userIndex === totalUsers - 1;
    const isSecondLastRow = userIndex === totalUsers - 2;
    const isThirdLastRow = userIndex === totalUsers - 3;
    const isFourthLastRow = userIndex === totalUsers - 4;
    const isFifthLastRow = userIndex === totalUsers - 5;

    // More aggressive upward positioning - if it's in the bottom half, go up
    const isInBottomHalf = userIndex >= totalUsers / 2;

    // If it's one of the last 5 rows or in bottom half, show dropdown upward
    if (
      isLastRow ||
      isSecondLastRow ||
      isThirdLastRow ||
      isFourthLastRow ||
      isFifthLastRow ||
      isInBottomHalf
    ) {
      setDropdownDirection("up");
    } else {
      setDropdownDirection("down");
    }
  };

  // Enhanced function to handle user actions with smart positioning
  const handleUserActionClick = (userId: string) => {
    // Determine dropdown direction first
    determineDropdownDirection(userId);

    // Then show/hide the dropdown
    setShowUserActions(showUserActions === userId ? null : userId);

    // If opening dropdown, do a final collision check after a brief delay
    if (showUserActions !== userId) {
      setTimeout(() => {
        checkRealTimeCollision(userId);
      }, 50);
    }
  };

  // Function to re-check positioning when dropdown is open (for scroll/resize)
  const recheckDropdownPosition = () => {
    if (showUserActions) {
      // Add a small delay to ensure DOM updates are complete
      setTimeout(() => {
        determineDropdownDirection(showUserActions);
      }, 10);
    }
  };

  // Enhanced positioning with real-time collision detection
  const checkRealTimeCollision = (userId: string) => {
    const buttonElement = document.querySelector(`[data-user-id="${userId}"]`);
    if (!buttonElement) return false;

    const rect = buttonElement.getBoundingClientRect();
    const dropdownHeight = 200;
    const dropdownBottom = rect.bottom + dropdownHeight;
    const dropdownTop = rect.top - dropdownHeight;

    // Check for immediate collisions with viewport
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If there's not enough space in current direction, switch immediately
    if (dropdownDirection === "down" && spaceBelow < dropdownHeight) {
      setDropdownDirection("up");
      return true;
    }

    if (dropdownDirection === "up" && spaceAbove < dropdownHeight) {
      setDropdownDirection("down");
      return true;
    }

    return false;
  };

  // Add scroll and resize listeners to recheck positioning
  useEffect(() => {
    if (showUserActions) {
      const handleScroll = () => recheckDropdownPosition();
      const handleResize = () => recheckDropdownPosition();

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [showUserActions]);

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Administrator":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "IT Support":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "Member":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Directory
            </h1>
          </div>
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, ID, or nickname..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="md:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="Administrator">Administrator</option>
                <option value="IT Support">IT Support</option>
                <option value="Member">Member</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading users...
              </span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterRole !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first user"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.idNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.branch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            data-user-id={user.id}
                            onClick={() => handleUserActionClick(user.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showUserActions === user.id && (
                            <div
                              className={`user-actions-dropdown absolute right-0 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600 ${
                                dropdownDirection === "up"
                                  ? "bottom-full mb-2"
                                  : "top-full mt-2"
                              }`}
                            >
                              {/* Arrow indicator with smart positioning indicator */}
                              <div
                                className={`absolute right-4 w-0 h-0 border-l-4 border-r-4 border-l-transparent border-r-transparent ${
                                  dropdownDirection === "up"
                                    ? "top-full border-t-4 border-t-white dark:border-t-gray-700"
                                    : "bottom-full border-b-4 border-b-white dark:border-b-gray-700"
                                }`}
                              ></div>

                              {/* Smart positioning indicator */}
                              <div
                                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 opacity-60"
                                title="Smart positioning active"
                              ></div>
                              <div className="py-1">
                                <button
                                  onClick={() => handleUserAction("view", user)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleUserAction("edit", user)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit User
                                </button>
                                <button
                                  onClick={() =>
                                    handleUserAction("toggle-status", user)
                                  }
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  {user.status === "active" ? (
                                    <>
                                      <UserX className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleUserAction("delete", user)
                                  }
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Inactive Users
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter((u) => u.status === "inactive").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <Filter className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Administrators
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter((u) => u.role === "Administrator").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <NewUserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onUserCreated={handleUserCreated}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        user={selectedUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default UserDirectory;
