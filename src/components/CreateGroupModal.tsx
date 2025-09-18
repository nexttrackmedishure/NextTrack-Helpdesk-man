import React, { useState, useEffect } from "react";
import { X, Users, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers } from "../services/userService";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, members: Array<{ email: string; name: string }>) => void;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  department: string;
  branch: string;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Array<{ email: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Load available users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      // Filter out current user and already selected members
      const filteredUsers = users.filter(
        (u) => 
          u.email !== user?.email && 
          !selectedMembers.some(member => member.email === u.email)
      );
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = (user: User) => {
    const newMember = { email: user.email, name: user.fullName };
    setSelectedMembers([...selectedMembers, newMember]);
    // Remove from available users
    setAvailableUsers(availableUsers.filter(u => u.email !== user.email));
  };

  const handleRemoveMember = (memberEmail: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.email !== memberEmail));
    // Add back to available users
    const removedMember = selectedMembers.find(m => m.email === memberEmail);
    if (removedMember) {
      const user = availableUsers.find(u => u.email === memberEmail);
      if (user) {
        setAvailableUsers([...availableUsers, user]);
      }
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup(groupName.trim(), selectedMembers);
      setGroupName("");
      setSelectedMembers([]);
      setSearchTerm("");
      onClose();
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Group Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Members ({selectedMembers.length})
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedMembers.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.email)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Members
            </label>
            <div className="relative mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    {searchTerm ? "No users found" : "No users available"}
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {user.department} • {user.branch}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddMember(user)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-blue-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
