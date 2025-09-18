import React, { useState, useEffect } from "react";
import { X, Users, Crown, UserMinus, UserPlus, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers } from "../services/userService";
import { realtimeChatService } from "../services/realtimeChatService";
import { SimpleConversation } from "../utils/chatStorage";

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: SimpleConversation | null;
  onGroupUpdated: () => void;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  department: string;
  branch: string;
}

const GroupManagementModal: React.FC<GroupManagementModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onGroupUpdated,
}) => {
  const { user } = useAuth();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load available users when modal opens
  useEffect(() => {
    if (isOpen && conversation) {
      loadUsers();
    }
  }, [isOpen, conversation]);

  const loadUsers = async () => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      const users = await getAllUsers();
      // Filter out current group members
      const groupMemberEmails = conversation.groupMembers?.map(m => m.email) || [];
      const filteredUsers = users.filter(
        (u) => !groupMemberEmails.includes(u.email)
      );
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userToAdd: User) => {
    if (!conversation) return;
    
    try {
      setActionLoading(userToAdd.email);
      const success = realtimeChatService.addMemberToGroup(
        conversation.id,
        { email: userToAdd.email, name: userToAdd.fullName }
      );
      
      if (success) {
        // Remove from available users
        setAvailableUsers(availableUsers.filter(u => u.email !== userToAdd.email));
        onGroupUpdated();
      }
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberEmail: string) => {
    if (!conversation) return;
    
    try {
      setActionLoading(memberEmail);
      const success = realtimeChatService.removeMemberFromGroup(
        conversation.id,
        memberEmail
      );
      
      if (success) {
        // Add back to available users
        const removedMember = conversation.groupMembers?.find(m => m.email === memberEmail);
        if (removedMember) {
          const user = availableUsers.find(u => u.email === memberEmail);
          if (user) {
            setAvailableUsers([...availableUsers, user]);
          }
        }
        onGroupUpdated();
      }
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const isCurrentUserAdmin = conversation?.groupMembers?.find(
    m => m.email === user?.email
  )?.role === "admin";

  const filteredUsers = availableUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !conversation || conversation.type !== "group") return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Group Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {conversation.groupName}
              </p>
            </div>
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
          {/* Group Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Group Members ({conversation.groupMembers?.length || 0})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {conversation.groupMembers?.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </p>
                        {member.role === "admin" && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  {isCurrentUserAdmin && member.email !== user?.email && (
                    <button
                      onClick={() => handleRemoveMember(member.email)}
                      disabled={actionLoading === member.email}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === member.email ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <UserMinus className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Members */}
          {isCurrentUserAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                    filteredUsers.map((userToAdd) => (
                      <div
                        key={userToAdd.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userToAdd.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {userToAdd.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {userToAdd.department} • {userToAdd.branch}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddMember(userToAdd)}
                          disabled={actionLoading === userToAdd.email}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading === userToAdd.email ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          ) : (
                            <UserPlus className="w-4 h-4 text-blue-500" />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupManagementModal;
