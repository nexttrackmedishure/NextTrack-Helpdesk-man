import React, { useState, useRef, useEffect } from "react";
import TypingIndicator from "./TypingIndicator";
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  Circle,
  CircleDot,
  Check,
  CheckCheck,
  Reply,
  Forward,
  Copy,
  Flag,
  Trash2,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Download,
  FileText,
  Image,
  File,
  X,
  Menu,
  ChevronLeft,
  PanelLeftClose,
  Inbox,
  Plus,
} from "lucide-react";
import VideoCall from "./VideoCall";
import EmojiPicker from "./EmojiPicker";
import CreateGroupModal from "./CreateGroupModal";
import GroupManagementModal from "./GroupManagementModal";
import PhotoAlbumMessage from "./PhotoAlbumMessage";
import ForwardMessageModal from "./ForwardMessageModal";
import FileMessage from "./FileMessage";
import { chatService, ChatContact } from "../services/chatService";
import { useAuth } from "../contexts/AuthContext";
import {
  chatStorage,
  SimpleConversation,
  SimpleMessage,
} from "../utils/chatStorage";
import {
  realtimeChatService,
  RealtimeMessage,
  RealtimeConversation,
} from "../services/realtimeChatService";
import { imageUploadService } from "../services/imageUploadService";

// Type definitions
interface BaseMessage {
  id: number;
  text: string;
  sender: "agent" | "customer";
  timestamp: string;
  isRead: boolean;
}

interface VoiceMessage extends BaseMessage {
  type: "voice";
  duration: number;
  audioUrl?: string;
}

interface FileMessage extends BaseMessage {
  type: "file";
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

interface ImageMessage extends BaseMessage {
  type: "image";
  images: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

interface UrlMessage extends BaseMessage {
  type: "url";
  url: string;
  title: string;
  description: string;
  image: string;
}

type Message =
  | BaseMessage
  | VoiceMessage
  | FileMessage
  | ImageMessage
  | UrlMessage;

// Mock data for chat contacts - Empty by default
const mockContacts: ChatContact[] = [];

// Mock messages data - Empty by default to start fresh conversations
const mockMessages: { [key: number]: Message[] } = {};

const ChatApplication: React.FC = () => {
  // Get current user from auth context
  const { user: currentUser } = useAuth();

  const [contacts, setContacts] = useState<ChatContact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    mockContacts.length > 0 ? mockContacts[0] : null
  );
  const [messages, setMessages] = useState<Message[]>([]);

  // Real-time chat state
  const [simpleConversations, setSimpleConversations] = useState<
    RealtimeConversation[]
  >([]);
  const [selectedSimpleConversation, setSelectedSimpleConversation] =
    useState<RealtimeConversation | null>(null);
  const [simpleMessages, setSimpleMessages] = useState<RealtimeMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<{
    [conversationId: string]: string;
  }>({});
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'drafts' | 'contacts' | 'groups'>('all');

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Group chat state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupManagementModal, setShowGroupManagementModal] = useState(false);

  // Message action state
  const [replyToMessage, setReplyToMessage] = useState<RealtimeMessage | null>(null);
  const [forwardToConversation, setForwardToConversation] = useState<RealtimeConversation | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState<RealtimeMessage | null>(null);

  // Filter contacts based on search term (works with both old and new systems)
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter simple conversations based on search term and filter type
  const filteredSimpleConversations = simpleConversations.filter((conv) => {
    // Apply filter type first
    let matchesFilter = true;
    if (filterType === 'groups') {
      matchesFilter = conv.type === "group";
    } else if (filterType === 'contacts') {
      matchesFilter = conv.type === "direct";
    } else if (filterType === 'unread') {
      matchesFilter = (conv.unreadCount || 0) > 0;
    } else if (filterType === 'drafts') {
      // For now, no drafts functionality, so show all
      matchesFilter = true;
    }
    
    if (!matchesFilter) return false;
    
    // Apply search term
    if (conv.type === "group") {
      return (conv.groupName || "Group Chat").toLowerCase().includes(searchTerm.toLowerCase());
    } else {
    const contactName =
      conv.user1Email === currentUser?.email ? conv.user2Name : conv.user1Name;
    return contactName.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const voiceCallRingtoneRef = useRef<HTMLAudioElement | null>(null);
  const voiceCallRingtoneIntervalRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [useOutlineBubble, setUseOutlineBubble] = useState(false);
  const [isCameraTestOpen, setIsCameraTestOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isMicTestOpen, setIsMicTestOpen] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [isMicLoading, setIsMicLoading] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [isMicTestRecording, setIsMicTestRecording] = useState(false);
  const [micTestRecordedAudio, setMicTestRecordedAudio] = useState<Blob | null>(
    null
  );
  const [micTestRecordedAudioUrl, setMicTestRecordedAudioUrl] = useState<
    string | null
  >(null);
  const [isMicTestPlaying, setIsMicTestPlaying] = useState(false);
  const [micTestRecordingTime, setMicTestRecordingTime] = useState(0);
  const [isRealTimeMonitoring, setIsRealTimeMonitoring] = useState(false);
  const [realTimeAudioContext, setRealTimeAudioContext] =
    useState<AudioContext | null>(null);
  const [realTimeGainNode, setRealTimeGainNode] = useState<GainNode | null>(
    null
  );
  const [availableMicrophones, setAvailableMicrophones] = useState<
    MediaDeviceInfo[]
  >([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [allowedDevices, setAllowedDevices] = useState<Set<string>>(new Set());
  const [devicePermissions, setDevicePermissions] = useState<{
    [key: string]: boolean;
  }>({});
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const [isInboxOpen, setIsInboxOpen] = useState(true); // Inbox drawer toggle
  const [isUserSelectionOpen, setIsUserSelectionOpen] = useState(false); // User selection modal
  const [availableUsers, setAvailableUsers] = useState<any[]>([]); // Available users from database
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Loading state for users
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});
  const cameraTestRef = useRef<HTMLVideoElement>(null);
  const micTestRef = useRef<HTMLAudioElement>(null);
  const micLevelIntervalRef = useRef<number | null>(null);
  const micTestMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micTestRecordingIntervalRef = useRef<number | null>(null);
  const micTestAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto scroll to bottom when simple messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simpleMessages]);

  // Update messages when contact changes
  useEffect(() => {
    if (selectedContact) {
      // Start with empty messages for new conversations
      setMessages([]);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  // Auto-refresh messages every 3 seconds for real-time updates
  useEffect(() => {
    if (!selectedContact || !currentUser) return;

    const refreshMessages = async () => {
      try {
        console.log("🔄 Auto-refreshing messages for real-time updates");

        // Get conversation ID for this contact
        const conversationId =
          selectedContact.conversationId ||
          `conv_${selectedContact.id}_${currentUser.id}`;

        // Load messages from database
        const dbMessages = await chatService.getMessages(conversationId);

        if (dbMessages && dbMessages.length > 0) {
          // Transform database messages to local format
          const transformedMessages: Message[] = dbMessages.map((msg: any) => ({
            id: msg._id || Date.now() + Math.random(),
            text: msg.text || "",
            sender: msg.sender || "customer",
            timestamp:
              msg.timestamp ||
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            isRead: msg.isRead !== false,
            type: msg.type || "text",
            ...(msg.type === "voice" && { duration: msg.duration }),
            ...(msg.type === "url" && {
              url: msg.url,
              title: msg.title,
              description: msg.description,
              image: msg.image,
            }),
          }));

          setMessages(transformedMessages);
        }
      } catch (error) {
        console.error("❌ Error auto-refreshing messages:", error);
      }
    };

    const interval = setInterval(() => {
      // Only refresh if we have a conversation ID
      if (selectedContact.conversationId) {
        refreshMessages();
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [selectedContact, currentUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        setOpenDropdownId(null);
      }
      if (showAttachmentMenu) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId, showAttachmentMenu]);

  // Cleanup audio URLs and camera stream
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
      if (micLevelIntervalRef.current) {
        cancelAnimationFrame(micLevelIntervalRef.current);
      }
      if (micTestRecordingIntervalRef.current) {
        clearInterval(micTestRecordingIntervalRef.current);
      }
      if (micTestRecordedAudioUrl) {
        URL.revokeObjectURL(micTestRecordedAudioUrl);
      }
      // Cleanup real-time monitoring
      if (realTimeAudioContext) {
        realTimeAudioContext.close();
      }
      if (realTimeGainNode) {
        realTimeGainNode.disconnect();
      }
    };
  }, [audioUrl, previewUrls, cameraStream, micStream]);

  // Load device permissions on component mount
  useEffect(() => {
    loadDevicePermissions();
  }, []);

  // Load contacts from database on component mount
  // Load simple conversations from localStorage
  const loadSimpleConversations = () => {
    if (!currentUser) {
      console.log("No current user, using empty conversation list");
      setSimpleConversations([]);
      setSelectedSimpleConversation(null);
      return;
    }

    try {
      console.log(
        "🔄 Loading simple conversations for user:",
        currentUser.email
      );
      const userConversations = realtimeChatService.getUserConversations(
        currentUser.email
      );
      console.log(
        "📊 User conversations from real-time storage:",
        userConversations
      );

      setSimpleConversations(userConversations);

      if (userConversations.length > 0 && !selectedSimpleConversation) {
        setSelectedSimpleConversation(userConversations[0]);
      }
    } catch (error) {
      console.error("❌ Error loading simple conversations:", error);
      setSimpleConversations([]);
      setSelectedSimpleConversation(null);
    }
  };

  // Play notification sound for new messages
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log("🔊 Audio context resumed");
        });
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound (two-tone beep)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log("🔊 Played notification sound for new message");
    } catch (error) {
      console.log("🔇 Could not play notification sound:", error);
      // Fallback: try using HTML5 Audio API
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        audio.volume = 0.3;
        audio.play().catch(e => console.log("🔇 Fallback audio also failed:", e));
      } catch (fallbackError) {
        console.log("🔇 All audio methods failed:", fallbackError);
      }
    }
  };

  // Test sound function (for debugging)
  const testNotificationSound = () => {
    console.log("🧪 Testing notification sound...");
    playNotificationSound();
  };

  // Make test function globally available for debugging
  React.useEffect(() => {
    (window as any).testChatSound = testNotificationSound;
    console.log("🔧 Sound test function available: window.testChatSound()");
  }, []);

  // Initialize real-time chat
  const initializeRealtimeChat = async () => {
    if (!currentUser) return;

    try {
      console.log("🚀 Initializing real-time chat for:", currentUser.email);

      // Initialize real-time chat service
      await realtimeChatService.initialize(currentUser.email);

      // Set up event handlers
      const handlerId = `chat-app-${currentUser.email}`;

      // Handle new messages with enhanced auto-refresh
      realtimeChatService.onNewMessage(
        handlerId,
        (message: RealtimeMessage) => {
          console.log("📨 New real-time message received:", message);

          // Add message to current conversation if it matches
          if (
            selectedSimpleConversation &&
            message.conversationId === selectedSimpleConversation.id
          ) {
            setSimpleMessages((prev) => {
              // Check if message already exists to prevent duplicates
              const messageExists = prev.some(
                (existingMsg) => existingMsg.id === message.id
              );
              if (messageExists) {
                console.log("📨 Message already exists, skipping duplicate");
                return prev;
              }
              console.log("📨 Adding new message to current conversation");
              return [...prev, message];
            });

            // Auto-scroll to bottom for new messages in current conversation
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }

          // Update conversations list to show new message indicators
          loadSimpleConversations();

          // Play notification sound for new messages (if not from current user)
          if (message.senderEmail !== currentUser.email) {
            console.log("🔊 Playing notification sound for message from:", message.senderEmail);
            playNotificationSound();
          } else {
            console.log("🔇 Not playing sound for own message from:", message.senderEmail);
          }
        }
      );

      // Handle conversation updates with enhanced refresh
      realtimeChatService.onConversationUpdate(
        handlerId,
        (conversation: RealtimeConversation) => {
          console.log("🔄 Conversation updated:", conversation);
          
          // Reload conversations to show updated unread counts and last messages
          loadSimpleConversations();
          
          // If this is the currently selected conversation, refresh its messages too
          if (
            selectedSimpleConversation &&
            conversation.id === selectedSimpleConversation.id
          ) {
            const updatedMessages = realtimeChatService.getConversationMessages(
              conversation.id
            );
            setSimpleMessages(updatedMessages);
            console.log("🔄 Refreshed messages for current conversation");
          }
        }
      );

      // Handle typing indicators with enhanced animation
      realtimeChatService.onTypingIndicator(handlerId, (typing) => {
        console.log("⌨️ Typing indicator:", typing);

        if (typing.isTyping) {
          setTypingIndicator((prev) => ({
            ...prev,
            [typing.conversationId]: typing.userName,
          }));
          console.log("⌨️ Showing typing indicator for:", typing.userName);
        } else {
          setTypingIndicator((prev) => {
            const newState = { ...prev };
            delete newState[typing.conversationId];
            return newState;
          });
          console.log("⌨️ Hiding typing indicator for:", typing.userName);
        }
      });

      console.log("✅ Real-time chat initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize real-time chat:", error);
    }
  };

  // Load user-specific conversations
  const loadUserConversations = async () => {
    if (!currentUser) {
      console.log("No current user, using empty contact list");
      setContacts(mockContacts);
      setSelectedContact(null);
      return;
    }

    try {
      console.log("🔄 Loading conversations for user:", currentUser.email);

      // Get conversations specific to the current user
      const conversations = await chatService.getConversations();
      console.log("📊 All conversations from localStorage:", conversations);
      console.log("📊 Current user email:", currentUser.email);
      console.log("📊 Current user ID:", currentUser.id);

      // If no conversations found or database not connected, use empty contact list
      if (!conversations || conversations.length === 0) {
        console.log(
          "ℹ️ No conversations found in database or database not connected, using empty contact list"
        );
        setContacts(mockContacts);
        setSelectedContact(null);
        return;
      }

      // Filter conversations for the current user
      // For localStorage fallback, show all conversations where the user is either agent or contact
      const userConversations = conversations.filter((conv) => {
        const isAgent =
          conv.agentId === currentUser.id ||
          conv.agentEmail === currentUser.email;
        const isContact = conv.contactEmail === currentUser.email;
        console.log(`🔍 Checking conversation:`, {
          convId: conv._id,
          agentId: conv.agentId,
          agentEmail: conv.agentEmail,
          contactEmail: conv.contactEmail,
          currentUserEmail: currentUser.email,
          currentUserId: currentUser.id,
          isAgent,
          isContact,
          matches: isAgent || isContact,
        });
        return isAgent || isContact;
      });

      console.log("👤 User-specific conversations:", userConversations);
      console.log(
        "👤 Total user conversations found:",
        userConversations.length
      );

      // If no user-specific conversations found, use empty contact list
      if (!userConversations || userConversations.length === 0) {
        console.log(
          "ℹ️ No user-specific conversations found, using empty contact list"
        );
        setContacts(mockContacts);
        setSelectedContact(null);
        return;
      }

      // Convert conversations to contacts format
      const userContacts = userConversations.map((conv) => {
        // Determine the correct contact name and email based on who is the current user
        const isCurrentUserAgent = conv.agentId === currentUser.id;

        // For better sender name display, we need to get the actual sender name
        // If current user is the agent, show the customer name
        // If current user is the customer, show the agent name (we need to get this from user data)
        let contactName, contactEmail;

        if (isCurrentUserAgent) {
          // Current user is the agent, show customer info
          contactName = conv.contactName;
          contactEmail = conv.contactEmail;
        } else {
          // Current user is the customer, show agent info
          // Try to get agent name from the conversation or use a default
          contactName = conv.agentName || "Support Agent";
          contactEmail = conv.agentEmail || "support@nexttrack.com";
        }

        return {
          id: conv.contactId,
          name: contactName,
          email: contactEmail,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            contactName
          )}&background=8b5cf6&color=fff`,
          status: "Online",
          lastMessage: conv.lastMessage || "No messages yet",
          timestamp: conv.lastMessageTime
            ? new Date(conv.lastMessageTime).toLocaleTimeString()
            : "now",
          unreadCount: conv.unreadCount || 0,
          conversationId: conv._id,
        };
      });

      if (userContacts.length > 0) {
        // Remove duplicate contacts based on email
        const uniqueContacts = userContacts.reduce((acc, contact) => {
          const existingContact = acc.find((c) => c.email === contact.email);
          if (!existingContact) {
            acc.push(contact);
          } else {
            // If duplicate found, keep the one with more recent timestamp or higher unread count
            const existingIndex = acc.findIndex(
              (c) => c.email === contact.email
            );
            if (
              contact.unreadCount > existingContact.unreadCount ||
              (contact.unreadCount === existingContact.unreadCount &&
                contact.timestamp > existingContact.timestamp)
            ) {
              acc[existingIndex] = contact;
            }
          }
          return acc;
        }, [] as typeof userContacts);

        // Ensure we have at least some contacts
        if (uniqueContacts.length > 0) {
          setContacts(uniqueContacts);
          if (!selectedContact || selectedContact.id === 0) {
            setSelectedContact(uniqueContacts[0]);
          }
          console.log(
            "✅ Loaded",
            uniqueContacts.length,
            "unique conversations for user"
          );
        } else {
          console.log(
            "ℹ️ No unique conversations found for user, using empty contact list"
          );
          setContacts(mockContacts);
          setSelectedContact(null);
        }
      } else {
        console.log(
          "ℹ️ No conversations found for user, using empty contact list"
        );
        setContacts(mockContacts);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("❌ Error loading user conversations:", error);
      // Fallback to empty contact list
      setContacts(mockContacts);
      setSelectedContact(null);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserConversations();
      loadSimpleConversations();
      initializeRealtimeChat();
    }

    // Cleanup on unmount
    return () => {
      if (currentUser) {
        const handlerId = `chat-app-${currentUser.email}`;
        realtimeChatService.offNewMessage(handlerId);
        realtimeChatService.offConversationUpdate(handlerId);
        realtimeChatService.offTypingIndicator(handlerId);
        realtimeChatService.cleanup();
      }
    };
  }, [currentUser]);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (selectedSimpleConversation && currentUser) {
      console.log(
        "🔄 Loading messages for conversation:",
        selectedSimpleConversation.id
      );
      const messages = realtimeChatService.getConversationMessages(
        selectedSimpleConversation.id
      );
      setSimpleMessages(messages);
      console.log("📨 Loaded messages:", messages);
    } else {
      setSimpleMessages([]);
    }
  }, [selectedSimpleConversation, currentUser]);

  // Real-time updates are now handled by the WebSocket service
  // No need for auto-refresh intervals

  // Listen for localStorage changes from other windows
  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      console.log("🔄 localStorage updated from another window:", event.detail);
      // Refresh conversations when localStorage changes
      loadUserConversations();
      loadSimpleConversations();
    };

    window.addEventListener(
      "localStorageUpdated",
      handleStorageUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "localStorageUpdated",
        handleStorageUpdate as EventListener
      );
    };
  }, [currentUser]);

  // Periodic refresh to ensure conversations stay up-to-date
  useEffect(() => {
    if (!currentUser) return;

    // Set up periodic refresh every 5 seconds
    const refreshInterval = setInterval(() => {
      console.log("🔄 Periodic refresh of conversations and messages");
      loadSimpleConversations();
      
      // Also refresh messages for current conversation
      if (selectedSimpleConversation) {
        const updatedMessages = realtimeChatService.getConversationMessages(
          selectedSimpleConversation.id
        );
        setSimpleMessages(updatedMessages);
      }
    }, 5000); // Refresh every 5 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [currentUser, selectedSimpleConversation]);

  // Load messages when selected contact changes
  useEffect(() => {
    const loadMessagesForContact = async () => {
      if (!selectedContact || !currentUser) {
        console.log(
          "No selected contact or current user, using empty messages"
        );
        setMessages([]);
        return;
      }

      try {
        console.log("🔄 Loading messages for contact:", selectedContact.name);

        // Get conversation ID for this contact
        const conversationId =
          selectedContact.conversationId ||
          `conv_${selectedContact.id}_${currentUser.id}`;

        // Load messages from database
        const dbMessages = await chatService.getMessages(conversationId);
        console.log("📨 Messages from database:", dbMessages);

        if (dbMessages && dbMessages.length > 0) {
          // Transform database messages to local format
          const transformedMessages: Message[] = dbMessages.map((msg: any) => ({
            id: msg._id || Date.now() + Math.random(),
            text: msg.text || "",
            sender: msg.sender || "customer",
            timestamp:
              msg.timestamp ||
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            isRead: msg.isRead !== false,
            type: msg.type || "text",
            ...(msg.type === "voice" && { duration: msg.duration }),
            ...(msg.type === "url" && {
              url: msg.url,
              title: msg.title,
              description: msg.description,
              image: msg.image,
            }),
          }));

          setMessages(transformedMessages);
          console.log(
            "✅ Loaded",
            transformedMessages.length,
            "messages for contact"
          );
        } else {
          // No messages in database, start with empty conversation
          console.log(
            "ℹ️ No messages in database, starting with empty conversation"
          );
          setMessages([]);
        }
      } catch (error) {
        console.error("❌ Error loading messages:", error);
        // Fallback to empty messages for fresh start
        setMessages([]);
      }
    };

    loadMessagesForContact();
  }, [selectedContact, currentUser]);

  // Restart monitoring when micStream changes
  useEffect(() => {
    if (micStream && isMicTestOpen) {
      // Small delay to ensure stream is fully active
      const timer = setTimeout(() => {
        console.log("Stream changed, restarting monitoring...");
        restartAudioMonitoring(micStream);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [micStream, isMicTestOpen]);

  // Handle voice call ringtone
  useEffect(() => {
    if (isVoiceCallOpen) {
      startVoiceCallRingtone();
    } else {
      stopVoiceCallRingtone();
    }

    // Cleanup on unmount
    return () => {
      stopVoiceCallRingtone();
    };
  }, [isVoiceCallOpen]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && currentUser) {
      // Use real-time chat service if we have a selected simple conversation
      if (selectedSimpleConversation) {
        try {
          const message = await realtimeChatService.sendMessage(
            selectedSimpleConversation.id,
            newMessage
          );

          // Add to local state
          setSimpleMessages((prev) => [...prev, message]);
          setNewMessage("");

          // Mark messages as read
          realtimeChatService.markMessagesAsRead(selectedSimpleConversation.id);

          console.log("✅ Message sent using real-time service:", message);
          return;
        } catch (error) {
          console.error("❌ Error sending real-time message:", error);
          // Fallback to simple storage
          const message = chatStorage.addMessage(
            selectedSimpleConversation.id,
            currentUser.email,
            newMessage
          );
          setSimpleMessages((prev) => [...prev, message]);
          setNewMessage("");
          loadSimpleConversations();
          return;
        }
      }

      // Fallback to original logic for selectedContact
      if (selectedContact) {
        const message: Message = {
          id: Date.now() + Math.random(), // More unique ID generation
          text: newMessage,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: false,
        };

        // Add message to local state immediately for better UX
        setMessages([...messages, message]);
        setNewMessage("");

        // Save message to database with proper conversation linking
        try {
          console.log(
            "💬 Saving message to database for user:",
            currentUser.email
          );

          // Get the conversation ID for this contact
          const conversationId =
            selectedContact.conversationId ||
            `conv_${selectedContact.id}_${currentUser.id}`;

          console.log(
            "💾 Saving message with conversation ID:",
            conversationId
          );

          // Save message to database
          const savedMessage = await chatService.createMessage(
            {
              text: newMessage,
              sender: "agent",
              timestamp: message.timestamp,
              isRead: false,
            },
            conversationId
          );

          console.log("✅ Message saved to database:", savedMessage);

          // Update the contact's last message and conversation ID if it was generated
          setContacts((prevContacts) =>
            prevContacts.map((contact) =>
              contact.id === selectedContact.id
                ? {
                    ...contact,
                    lastMessage: newMessage,
                    timestamp: message.timestamp,
                    conversationId: conversationId, // Ensure conversation ID is set
                  }
                : contact
            )
          );

          // Update selectedContact with the conversation ID
          setSelectedContact((prev) =>
            prev
              ? {
                  ...prev,
                  conversationId: conversationId,
                }
              : null
          );
        } catch (error) {
          console.error("❌ Error saving message to database:", error);
          // Message is still in local state, so user experience is not affected
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicator with enhanced responsiveness
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (selectedSimpleConversation && currentUser) {
      // Send typing indicator - show when user is actively typing
      const isTyping = value.length > 0 && value.trim().length > 0;
      realtimeChatService.sendTypingIndicator(
        selectedSimpleConversation.id,
        isTyping
      );
      
      if (isTyping) {
        console.log("⌨️ User is typing in conversation:", selectedSimpleConversation.id);
      }
    }
  };

  // Group chat functions
  const handleCreateGroup = async (groupName: string, members: Array<{ email: string; name: string }>) => {
    if (!currentUser) {
      showErrorToast("Please log in to create a group");
      return;
    }

    try {
      const groupConversation = realtimeChatService.createGroupConversation(
        groupName,
        currentUser.email,
        currentUser.name || "User",
        members
      );

      // Reload conversations to show the new group
      loadSimpleConversations();
      
      // Select the new group conversation
      setSelectedSimpleConversation(groupConversation);
      
      showSuccessToast(`Group "${groupName}" created successfully`);
      console.log("✅ Created group:", groupConversation);
    } catch (error) {
      console.error("❌ Error creating group:", error);
      showErrorToast("Failed to create group. Please try again.");
    }
  };

  const handleGroupUpdated = () => {
    // Reload conversations to reflect changes
    loadSimpleConversations();
    
    // Reload current conversation if it's a group
    if (selectedSimpleConversation && selectedSimpleConversation.type === "group") {
      const conversations = realtimeChatService.getUserConversations(currentUser?.email || "");
      const updatedConversation = conversations.find(conv => conv.id === selectedSimpleConversation.id);
      if (updatedConversation) {
        setSelectedSimpleConversation(updatedConversation);
      }
    }
  };


  // Toast notification functions
  const showSuccessToast = (message: string) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const showErrorToast = (message: string) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const showInfoToast = (message: string) => {
    setToast({ show: true, message, type: 'info' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleMessageAction = (messageId: number, action: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    switch (action) {
      case "reply":
        handleReply(message);
        break;
      case "forward":
        handleForward(message);
        break;
      case "copy":
        handleCopy(message);
        break;
      case "report":
        handleReport(message);
        break;
      case "delete":
        handleDelete(messageId);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
    setOpenDropdownId(null);
  };

  // Handle user management actions
  const handleUserAction = (userId: number, action: string) => {
    const user = contacts.find((c) => c.id === userId);
    if (!user) return;

    switch (action) {
      case "view-profile":
        handleViewProfile(user);
        break;
      case "edit-user":
        handleEditUser(user);
        break;
      case "user-directory":
        handleOpenUserDirectory(user);
        break;
      case "toggle-status":
        handleToggleUserStatus(user);
        break;
      case "block-user":
        handleBlockUser(user);
        break;
      default:
        console.log(`Unknown user action: ${action}`);
    }
    setOpenDropdownId(null);
  };


  // Copy message text to clipboard
  const handleCopy = async (message: any) => {
    try {
      const textToCopy = message.text || (message.type === "image" ? "Image message" : message.type === "file" ? "File message" : "Message");
      await navigator.clipboard.writeText(textToCopy);
      // Show a brief success indicator
      const button = document.querySelector(
        `[data-message-id="${message.id}"]`
      ) as HTMLElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        button.style.color = "#10b981";
        setTimeout(() => {
          button.textContent = originalText;
          button.style.color = "";
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy message to clipboard");
    }
  };

  // Report a message
  const handleReport = (message: any) => {
    const messageText = message.text || (message.type === "image" ? "Image message" : message.type === "file" ? "File message" : "Message");
    const reportReason = prompt(
      `Report message: "${messageText}"\n\nPlease provide a reason for reporting this message:`,
      "Inappropriate content"
    );

    if (reportReason) {
      // In a real app, this would send to a moderation system
      console.log("Message reported:", {
        messageId: message.id,
        messageText: message.text,
        reason: reportReason,
        timestamp: new Date().toISOString(),
      });
      alert("Message has been reported. Thank you for your feedback.");
    }
  };

  // Handle reply to message
  const handleReply = (message: any) => {
    const replyText = message.text ? `Replying to: "${message.text}"` : "Replying to message";
    setNewMessage(replyText + "\n\n");
    setOpenDropdownId(null);
    // Focus on the message input
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[placeholder="Ask me anything..."]'
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
      }
    }, 100);
  };

  // Handle forward message
  const handleForward = (message: any) => {
    const forwardText = message.text ? `Forwarded message: "${message.text}"` : "Forwarded message";
    setNewMessage(forwardText + "\n\n");
    setOpenDropdownId(null);
    // Focus on the message input
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[placeholder="Ask me anything..."]'
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
      }
    }, 100);
  };

  // Delete a message
  const handleDelete = (message: any) => {
    const messagePreview = message.text
      ? message.text.length > 50
        ? message.text.substring(0, 50) + "..."
        : message.text
      : message.type === "image" ? "this image" : message.type === "file" ? "this file" : "this message";

    if (
      confirm(
        `Are you sure you want to delete "${messagePreview}"?\n\nThis action cannot be undone.`
      )
    ) {
      // Here you would implement the delete functionality for the real-time system
      console.log("Message deleted:", message.id);
      setOpenDropdownId(null);
      // Show a brief success message
      const originalTitle = document.title;
      document.title = "Message deleted ✓";
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
    }
  };

  // User management action functions
  const handleViewProfile = (user: any) => {
    // Create a modal or navigate to user profile
    alert(
      `Viewing profile for ${user.name}\n\nEmail: ${user.email}\nStatus: ${user.status}\nLast seen: ${user.lastSeen}`
    );
  };

  const handleEditUser = (user: any) => {
    // Open user edit modal or navigate to edit page
    alert(
      `Editing user: ${user.name}\n\nThis would open the user edit form with pre-filled data for:\n- Name: ${user.name}\n- Email: ${user.email}\n- Status: ${user.status}`
    );
  };

  const handleOpenUserDirectory = (user: any) => {
    // Navigate to user directory and highlight this user
    alert(
      `Opening User Directory\n\nThis would navigate to the User Directory tab and highlight user: ${user.name}\n\nUser ID: ${user.id}\nEmail: ${user.email}`
    );

    // In a real implementation, you would:
    // 1. Switch to the User Directory tab
    // 2. Scroll to and highlight the specific user
    // 3. Maybe open a user details modal
  };

  const handleToggleUserStatus = (user: any) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      // Update user status in the contacts list
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === user.id ? { ...contact, status: newStatus } : contact
        )
      );

      // Show success message
      alert(`User ${user.name} has been ${action}d successfully!`);
    }
  };

  const handleBlockUser = (user: any) => {
    if (
      confirm(
        `Are you sure you want to block ${user.name}?\n\nThis will prevent them from sending messages and accessing the system.`
      )
    ) {
      // Update user status to blocked
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === user.id ? { ...contact, status: "blocked" } : contact
        )
      );

      // Show success message
      alert(`User ${user.name} has been blocked successfully!`);
    }
  };

  // Function to fetch users from database
  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingUsers(true);
      console.log("🔄 Fetching users from MongoDB...");

      // Import the getAllUsers function from userService
      const { getAllUsers } = await import("../services/userService");

      // Fetch actual users from your MongoDB database
      const users = await getAllUsers();
      console.log("📊 Users fetched from database:", users);

      // Transform users to the format needed for chat selection
      const transformedUsers = users.map((user) => ({
        id: user.id,
        name: user.fullName || user.nickname || "Unknown User",
        email: user.email,
        avatar:
          user.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.fullName || user.nickname || "User"
          )}&background=8b5cf6&color=fff`,
        department: user.department || "General",
        role: user.role || "Member",
        status: user.status || "active",
        // Include additional user data
        idNumber: user.idNumber,
        nickname: user.nickname,
        branch: user.branch,
        contactNumber: user.contactNumber,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      }));

      console.log("✨ Transformed users for chat selection:", transformedUsers);

      if (transformedUsers.length === 0) {
        showInfoToast(
          "No users found in the database. Please create some users first using the User Directory."
        );
        return;
      }

      setAvailableUsers(transformedUsers);
      setIsUserSelectionOpen(true);
      console.log(
        "✅ User selection modal opened with",
        transformedUsers.length,
        "users"
      );
    } catch (error) {
      console.error("❌ Error fetching users from MongoDB:", error);
      showErrorToast(
        "Error loading users from database. Please check your connection and try again."
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Handle creating a new chat - now shows user selection
  const handleCreateNewChat = async () => {
    await fetchAvailableUsers();
  };

  // Function to start chat with selected user
  const startChatWithUser = async (user: any) => {
    if (!currentUser) {
      showErrorToast("Please log in to start a chat");
      return;
    }

    try {
      console.log(
        "🔄 Creating chat with user:",
        user.name,
        "for current user:",
        currentUser.email
      );

      // Use real-time chat service to create conversation
      const conversation = realtimeChatService.getOrCreateConversation(
        currentUser.email,
        currentUser.name || currentUser.email,
        user.email,
        user.name
      );

      console.log("✅ Created/found conversation:", conversation);

      // Refresh simple conversations
      loadSimpleConversations();

      // Select the conversation
      setSelectedSimpleConversation(conversation);

      // Load messages for this conversation
      const conversationMessages = realtimeChatService.getConversationMessages(
        conversation.id
      );
      setSimpleMessages(conversationMessages);

      // Close the user selection modal
      setIsUserSelectionOpen(false);

      // Show success toast notification
      showSuccessToast(`Chat started with ${user.name}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
      showErrorToast(
        `Error creating chat with ${user.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Voice message functions
  const startRecording = async () => {
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        alert("Voice recording requires HTTPS or localhost");
        return;
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support voice recording");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        alert("Error recording audio. Please try again.");
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      recordingIntervalRef.current = interval as any;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert(
            "Microphone access denied. Please allow microphone access and try again."
          );
        } else if (error.name === "NotFoundError") {
          alert(
            "No microphone found. Please connect a microphone and try again."
          );
        } else if (error.name === "NotReadableError") {
          alert(
            "Microphone is being used by another application. Please close other applications and try again."
          );
        } else {
          alert("Error accessing microphone: " + error.message);
        }
      } else {
        alert("Error accessing microphone. Please try again.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async () => {
    if (audioBlob && selectedSimpleConversation && currentUser?.email) {
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = formatTime(recordingTime);
        
        await realtimeChatService.sendMessage(
          selectedSimpleConversation.id,
          "", // Empty text for voice messages
          "audio",
          {
            audioUrl: audioUrl,
            duration: duration,
          }
        );

        // Add to local state
        const voiceMessage = {
          id: Date.now().toString(),
          conversationId: selectedSimpleConversation.id,
          senderEmail: currentUser.email,
          text: "",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: true,
          type: "audio" as const,
          audioUrl: audioUrl,
          duration: duration,
        };
        
        setSimpleMessages((prev) => [...prev, voiceMessage]);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsRecording(false);
        
        console.log("✅ Voice message sent successfully");
      } catch (error) {
        console.error("❌ Error sending voice message:", error);
        // Fallback to simple storage
        const voiceMessage = {
          id: Date.now().toString(),
          conversationId: selectedSimpleConversation.id,
          senderEmail: currentUser.email,
          text: "",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: true,
          type: "audio" as const,
          audioUrl: URL.createObjectURL(audioBlob),
          duration: formatTime(recordingTime),
        };
        
        setSimpleMessages((prev) => [...prev, voiceMessage]);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsRecording(false);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const playAudio = (messageId: number, audioUrl: string) => {
    if (playingAudioId === messageId) {
      // Stop current audio
      if (audioRefs.current[messageId]) {
        audioRefs.current[messageId].pause();
        audioRefs.current[messageId].currentTime = 0;
      }
      setPlayingAudioId(null);
    } else {
      // Stop any other playing audio
      Object.keys(audioRefs.current).forEach((id) => {
        if (audioRefs.current[parseInt(id)]) {
          audioRefs.current[parseInt(id)].pause();
          audioRefs.current[parseInt(id)].currentTime = 0;
        }
      });

      // Create new audio element if it doesn't exist
      if (!audioRefs.current[messageId]) {
        audioRefs.current[messageId] = new Audio();
      }

      const audio = audioRefs.current[messageId];
      audio.src = audioUrl;
      audio.volume = 1.0;
      audio.preload = "auto";

      // Add event listeners
      audio.onloadstart = () => {
        console.log("Audio loading started");
      };

      audio.oncanplay = () => {
        console.log("Audio can start playing");
      };

      audio.onerror = (error) => {
        console.error("Audio playback error:", error);
        alert("Error playing voice message. The audio file may be corrupted.");
        setPlayingAudioId(null);
      };

      audio.onended = () => {
        console.log("Audio playback ended");
        setPlayingAudioId(null);
      };

      audio.onpause = () => {
        console.log("Audio playback paused");
        setPlayingAudioId(null);
      };

      // Play the audio
      audio
        .play()
        .then(() => {
          console.log("Audio playback started");
          setPlayingAudioId(messageId);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          if (error.name === "NotAllowedError") {
            alert(
              "Audio playback blocked by browser. Please allow audio playback and try again."
            );
          } else if (error.name === "NotSupportedError") {
            alert("Audio format not supported by your browser.");
          } else {
            alert("Error playing voice message: " + error.message);
          }
          setPlayingAudioId(null);
        });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Voice call ringtone functions
  const createVoiceCallRingtone = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Create a phone ringtone pattern
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.4
      );

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.start();
      oscillator2.start();
      oscillator1.stop(audioContext.currentTime + 0.4);
      oscillator2.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error("Error creating ringtone:", error);
    }
  };

  const startVoiceCallRingtone = () => {
    const playRingtone = () => {
      createVoiceCallRingtone();
    };

    // Play ringtone immediately
    playRingtone();

    // Set interval to repeat every 2 seconds
    voiceCallRingtoneIntervalRef.current = window.setInterval(
      playRingtone,
      2000
    );
  };

  const stopVoiceCallRingtone = () => {
    if (voiceCallRingtoneIntervalRef.current) {
      clearInterval(voiceCallRingtoneIntervalRef.current);
      voiceCallRingtoneIntervalRef.current = null;
    }
  };

  // File handling functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Handle single file upload
      sendFileMessage(files[0]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      sendImageMessage(files);
    }
  };

  // Handle paste events for images
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if the pasted item is an image
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    // If images were pasted, send them as image messages
    if (imageFiles.length > 0) {
      e.preventDefault(); // Prevent default paste behavior
      sendImageMessage(imageFiles);
    }
  };


  const sendFileMessage = async (file: File) => {
    if (!selectedSimpleConversation || !currentUser?.email) {
      console.error('No conversation selected or user not logged in');
      return;
    }

    try {
      // Validate file first
      const validation = imageUploadService.validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Show loading state
      console.log('📤 Uploading file...');

      // Upload file
      const uploadResult = await imageUploadService.uploadFile(file);
      
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.message || 'Failed to upload file');
      }

      // Send message through realtime chat service
      await realtimeChatService.sendMessage(
        selectedSimpleConversation.id,
        "", // Empty text for file messages
        "file",
        {
          fileName: uploadResult.data.name,
          fileSize: uploadResult.data.size,
          fileType: file.type,
          fileUrl: uploadResult.data.url
        }
      );

      console.log('✅ File uploaded and message sent successfully');
    } catch (error) {
      console.error('Error sending file message:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload file. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('size')) {
          errorMessage = 'File is too large. Please choose a smaller file.';
        } else if (error.message.includes('format')) {
          errorMessage = 'File type not supported. Please use a different file.';
        }
      }
      
      alert(errorMessage);
    }
  };

  const sendImageMessage = async (files: File[]) => {
    if (!selectedSimpleConversation || !currentUser?.email) {
      console.error('No conversation selected or user not logged in');
      return;
    }

    try {
      // Validate files first
      for (const file of files) {
        const validation = imageUploadService.validateImageFile(file);
        if (!validation.valid) {
          alert(validation.error);
          return;
        }
      }

      // Show loading state (optional - you can add a loading indicator here)
      console.log('📤 Uploading images...');

      // Upload images to Cloudinary (with fallback to local URLs)
      const uploadResult = await imageUploadService.uploadImages(files);
      
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.message || 'Failed to upload images');
      }

      // Create image objects with URLs (Cloudinary or local)
      const images = uploadResult.data.map((uploadedImage) => ({
        name: uploadedImage.name,
        url: uploadedImage.url,
        size: uploadedImage.size,
        publicId: uploadedImage.publicId,
      }));
      
      // Send message through realtime chat service
      await realtimeChatService.sendMessage(
        selectedSimpleConversation.id,
        "", // Empty text for image messages
        "image",
        { images }
      );

      console.log('✅ Images uploaded and message sent successfully');
    } catch (error) {
      console.error('Error sending image message:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload images. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('size')) {
          errorMessage = 'Image file is too large. Please choose smaller images.';
        } else if (error.message.includes('format')) {
          errorMessage = 'Invalid image format. Please use JPEG, PNG, GIF, or WebP.';
        }
      }
      
      alert(errorMessage);
    }
  };

  // Message action functions
  const handleReplyToMessage = (message: RealtimeMessage) => {
    setReplyToMessage(message);
    setNewMessage(`Replying to: ${message.text || 'Photo album'}... `);
    // Focus on message input (you can add this if you have a ref to the input)
    console.log('📝 Replying to message:', message);
  };

  const handleForwardMessage = (message: RealtimeMessage) => {
    setMessageToForward(message);
    setShowForwardModal(true);
    console.log('📤 Forwarding message:', message);
  };

  const handleForwardToConversation = async (conversationId: string, conversationName: string) => {
    if (!messageToForward) return;

    try {
      // Forward the message to the selected conversation
      await realtimeChatService.sendMessage(
        conversationId,
        `Forwarded: ${messageToForward.text || 'Photo album'}`,
        messageToForward.type as any,
        messageToForward.type === 'image' ? { images: messageToForward.images } : undefined
      );

      showSuccessToast(`Message forwarded to ${conversationName}`);
      console.log('✅ Message forwarded to:', conversationName);
    } catch (error) {
      console.error('❌ Error forwarding message:', error);
      showErrorToast('Failed to forward message');
    }
  };

  const handleCopyMessage = (message: RealtimeMessage) => {
    const messageText = message.text || 'Photo album';
    const copyText = `Message from ${(message as any).senderName || 'User'}: ${messageText}`;
    
    navigator.clipboard.writeText(copyText).then(() => {
      showSuccessToast('Message copied to clipboard');
      console.log('📋 Message copied to clipboard');
    }).catch((error) => {
      console.error('Failed to copy message:', error);
      showErrorToast('Failed to copy message');
    });
  };

  const handleReportMessage = (message: RealtimeMessage) => {
    const reportReason = prompt('Please provide a reason for reporting this message:');
    if (reportReason) {
      // Here you would typically send the report to your backend
      console.log('🚨 Message reported:', { message, reason: reportReason });
      showSuccessToast('Message reported successfully');
    }
  };

  const handleDeleteMessage = (message: RealtimeMessage) => {
    if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      // Remove message from local state
      setSimpleMessages(prev => prev.filter(msg => msg.id !== message.id));
      
      // Here you would typically also delete from the backend
      console.log('🗑️ Message deleted:', message);
      showSuccessToast('Message deleted successfully');
    }
  };

  const sendUrlPreview = (
    url: string,
    title: string,
    description: string,
    image: string
  ) => {
    const urlMessage: UrlMessage = {
      id: messages.length + 1,
      text: "",
      sender: "agent",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
      type: "url",
      url: url,
      title: title,
      description: description,
      image: image,
    };
    setMessages((prev) => [...prev, urlMessage]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (fileType.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Camera test functions
  const testCamera = async () => {
    console.log("Testing camera...");
    setIsCameraLoading(true);

    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        alert(
          "🔒 Camera test requires HTTPS or localhost for security reasons.\n\nPlease access this application through HTTPS or localhost to test your camera."
        );
        setIsCameraLoading(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "❌ Your browser does not support camera access.\n\nPlease use a modern browser like Chrome, Firefox, Safari, or Edge to test your camera."
        );
        setIsCameraLoading(false);
        return;
      }

      // Load existing device permissions
      loadDevicePermissions();

      // Get available devices first to check if we have any allowed cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

      // Check if we have any previously allowed cameras
      const hasAllowedCameras = cameras.some((camera) =>
        isDeviceAllowed(camera.deviceId)
      );

      let permissionGranted = true;

      // Only show confirmation dialog if no cameras are previously allowed
      if (!hasAllowedCameras) {
        permissionGranted = confirm(
          "📷 Camera Permission Required\n\n" +
            "This application needs access to your camera to test video input.\n\n" +
            'Click "OK" to allow camera access, then click "Allow" in the browser permission dialog.\n\n' +
            "If you accidentally deny permission, you can:\n" +
            "• Click the lock icon in your browser's address bar\n" +
            '• Select "Allow" for camera access\n' +
            "• Refresh the page and try again"
        );
      } else {
        console.log("Using previously allowed camera device");
      }

      if (!permissionGranted) {
        setIsCameraLoading(false);
        return;
      }

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: "user",
        },
        audio: false,
      });

      // Save permission for the default camera
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const deviceId = videoTracks[0].getSettings().deviceId;
        if (deviceId) {
          saveDevicePermissions(deviceId, true);
        }
      }

      console.log("Camera access granted, setting up stream...");
      setCameraStream(stream);
      setIsCameraTestOpen(true);
      setIsCameraLoading(false);

      // Wait for the modal to render before setting the video source
      setTimeout(() => {
        if (cameraTestRef.current) {
          console.log("Setting video source...");
          cameraTestRef.current.srcObject = stream;
          cameraTestRef.current.play().catch((e) => {
            console.error("Error playing video:", e);
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraLoading(false);

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert(
            "🚫 Camera Access Denied\n\n" +
              "You have denied camera access. To enable it:\n\n" +
              "1. Click the lock icon (🔒) in your browser's address bar\n" +
              '2. Find "Camera" in the permissions list\n' +
              '3. Change it from "Block" to "Allow"\n' +
              "4. Refresh the page and try again\n\n" +
              "Alternatively, you can:\n" +
              "• Go to your browser settings\n" +
              '• Find "Site permissions" or "Privacy"\n' +
              "• Allow camera access for this site"
          );
        } else if (error.name === "NotFoundError") {
          alert(
            "📷 No Camera Found\n\n" +
              "No camera device was detected on your computer.\n\n" +
              "Please check:\n" +
              "• Is your camera connected?\n" +
              "• Is it properly plugged in?\n" +
              "• Is it enabled in your system settings?\n" +
              "• Try using a different camera"
          );
        } else if (error.name === "NotReadableError") {
          alert(
            "⚠️ Camera Busy\n\n" +
              "Your camera is being used by another application.\n\n" +
              "Please:\n" +
              "• Close other applications using the camera\n" +
              "• Check if another browser tab is using the camera\n" +
              "• Restart your browser if the problem persists"
          );
        } else if (error.name === "OverconstrainedError") {
          alert(
            "⚠️ Camera Settings Not Supported\n\nTrying with default settings..."
          );
          // Try with basic constraints
          try {
            console.log("Trying fallback camera settings...");
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            setCameraStream(basicStream);
            setIsCameraTestOpen(true);
            setTimeout(() => {
              if (cameraTestRef.current) {
                cameraTestRef.current.srcObject = basicStream;
                cameraTestRef.current.play();
              }
            }, 100);
            console.log("Fallback camera settings successful");
          } catch (basicError) {
            alert(
              "❌ Unable to access camera with any settings.\n\nPlease check your camera connection and try again."
            );
          }
        } else {
          alert(
            "❌ Error accessing camera: " +
              error.message +
              "\n\nPlease try again or contact support if the problem persists."
          );
        }
      } else {
        alert(
          "❌ Unknown error occurred while accessing the camera.\n\nPlease try again or contact support if the problem persists."
        );
      }
    }
  };

  const closeCameraTest = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraTestOpen(false);
  };

  // Mic test functions
  const testMicrophone = async () => {
    try {
      setIsMicLoading(true);

      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        alert(
          "🔒 Microphone test requires HTTPS or localhost for security reasons.\n\nPlease access this application through HTTPS or localhost to test your microphone."
        );
        setIsMicLoading(false);
        return;
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "❌ Your browser does not support microphone access.\n\nPlease use a modern browser like Chrome, Firefox, Safari, or Edge to test your microphone."
        );
        setIsMicLoading(false);
        return;
      }

      // Load existing device permissions
      loadDevicePermissions();

      // Get available devices first to check if we have any allowed devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(
        (device) => device.kind === "audioinput"
      );

      // Check if we have any previously allowed microphones
      const hasAllowedDevices = microphones.some((mic) =>
        isDeviceAllowed(mic.deviceId)
      );

      let permissionGranted = true;

      // Only show confirmation dialog if no devices are previously allowed
      if (!hasAllowedDevices) {
        permissionGranted = confirm(
          "🎤 Microphone Permission Required\n\n" +
            "This application needs access to your microphone to test audio input.\n\n" +
            'Click "OK" to allow microphone access, then click "Allow" in the browser permission dialog.\n\n' +
            "If you accidentally deny permission, you can:\n" +
            "• Click the lock icon in your browser's address bar\n" +
            '• Select "Allow" for microphone access\n' +
            "• Refresh the page and try again"
        );
      } else {
        console.log("Using previously allowed microphone device");
      }

      if (!permissionGranted) {
        setIsMicLoading(false);
        return;
      }

      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      });

      // Save permission for the default microphone
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const deviceId = audioTracks[0].getSettings().deviceId;
        if (deviceId) {
          saveDevicePermissions(deviceId, true);
        }
      }

      console.log("Microphone access granted, setting up audio monitoring...");
      console.log("Microphone stream obtained:", stream);
      console.log(
        "Audio tracks:",
        stream.getAudioTracks().map((track) => ({
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label,
          settings: track.getSettings(),
        }))
      );

      setMicStream(stream);
      setIsMicTestOpen(true);
      setIsMicLoading(false);

      // Get available microphones
      await getAvailableMicrophones();

      // Set up audio monitoring
      restartAudioMonitoring(stream);

      console.log("Microphone test initialized successfully");
      console.log("Stream active:", stream.active);
      console.log(
        "Audio tracks:",
        stream.getAudioTracks().map((track) => ({
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label,
        }))
      );

      console.log("Microphone test setup complete");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsMicLoading(false);

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert(
            "🚫 Microphone Access Denied\n\n" +
              "You have denied microphone access. To enable it:\n\n" +
              "1. Click the lock icon (🔒) in your browser's address bar\n" +
              '2. Find "Microphone" in the permissions list\n' +
              '3. Change it from "Block" to "Allow"\n' +
              "4. Refresh the page and try again\n\n" +
              "Alternatively, you can:\n" +
              "• Go to your browser settings\n" +
              '• Find "Site permissions" or "Privacy"\n' +
              "• Allow microphone access for this site"
          );
        } else if (error.name === "NotFoundError") {
          alert(
            "🎤 No Microphone Found\n\n" +
              "No microphone device was detected on your computer.\n\n" +
              "Please check:\n" +
              "• Is your microphone connected?\n" +
              "• Is it properly plugged in?\n" +
              "• Is it enabled in your system settings?\n" +
              "• Try using a different microphone"
          );
        } else if (error.name === "NotReadableError") {
          alert(
            "⚠️ Microphone Busy\n\n" +
              "Your microphone is being used by another application.\n\n" +
              "Please:\n" +
              "• Close other applications using the microphone\n" +
              "• Check if another browser tab is using the microphone\n" +
              "• Restart your browser if the problem persists"
          );
        } else {
          alert(
            "❌ Error accessing microphone: " +
              error.message +
              "\n\nPlease try again or contact support if the problem persists."
          );
        }
      } else {
        alert(
          "❌ Unknown error occurred while accessing microphone.\n\nPlease try again or contact support if the problem persists."
        );
      }
    }
  };

  const closeMicTest = () => {
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }
    if (micLevelIntervalRef.current) {
      cancelAnimationFrame(micLevelIntervalRef.current);
      micLevelIntervalRef.current = null;
    }
    if (micTestRecordingIntervalRef.current) {
      clearInterval(micTestRecordingIntervalRef.current);
      micTestRecordingIntervalRef.current = null;
    }
    if (micTestRecordedAudioUrl) {
      URL.revokeObjectURL(micTestRecordedAudioUrl);
    }
    // Stop real-time monitoring
    stopRealTimeMonitoring();
    setMicLevel(0);
    setIsMicTestRecording(false);
    setMicTestRecordedAudio(null);
    setMicTestRecordedAudioUrl(null);
    setIsMicTestPlaying(false);
    setMicTestRecordingTime(0);
    setIsMicTestOpen(false);
  };

  // Mic test recording functions
  const startMicTestRecording = () => {
    if (!micStream) {
      alert(
        "No microphone stream available. Please ensure your microphone is working."
      );
      return;
    }

    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        alert(
          "MediaRecorder is not supported in your browser. Please use a modern browser."
        );
        return;
      }

      // Check if the stream is active
      if (micStream.getAudioTracks().length === 0) {
        alert(
          "No audio tracks available. Please check your microphone connection."
        );
        return;
      }

      // Check if any audio track is enabled
      const audioTracks = micStream.getAudioTracks();
      const enabledTracks = audioTracks.filter(
        (track) => track.enabled && track.readyState === "live"
      );

      if (enabledTracks.length === 0) {
        alert(
          "No active audio tracks found. Please check your microphone permissions."
        );
        return;
      }

      // Ensure the stream is still active
      if (micStream.active === false) {
        alert(
          "Microphone stream is not active. Please try refreshing the microphone test."
        );
        return;
      }

      console.log("Starting recording with stream:", micStream);
      console.log(
        "Audio tracks:",
        audioTracks.map((track) => ({
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label,
        }))
      );

      // Try different MIME types for better compatibility
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""; // Let browser choose
          }
        }
      }

      console.log("Using MIME type:", mimeType || "browser default");

      const mediaRecorder = new MediaRecorder(
        micStream,
        mimeType ? { mimeType } : undefined
      );
      micTestMediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size, "bytes");
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log(
          "Recording stopped, creating blob from",
          chunks.length,
          "chunks"
        );
        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        console.log("Created blob:", blob.size, "bytes, type:", blob.type);
        setMicTestRecordedAudio(blob);
        setMicTestRecordedAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        const errorMessage = (event as any).error?.message || "Unknown error";
        alert(
          `Error recording audio: ${errorMessage}\n\nPlease try:\n• Refreshing the microphone test\n• Checking your microphone permissions\n• Using a different browser`
        );
        setIsMicTestRecording(false);

        // Clean up the failed recorder
        if (micTestMediaRecorderRef.current) {
          micTestMediaRecorderRef.current = null;
        }
      };

      mediaRecorder.onstart = () => {
        console.log("Recording started successfully");
      };

      // Start recording with a small time slice for better responsiveness
      mediaRecorder.start(100);
      setIsMicTestRecording(true);
      setMicTestRecordingTime(0);

      const interval = setInterval(() => {
        setMicTestRecordingTime((prev) => prev + 1);
      }, 1000);
      micTestRecordingIntervalRef.current = interval as any;
    } catch (error) {
      console.error("Error starting recording:", error);
      if (error instanceof Error) {
        alert("Error starting recording: " + error.message);
      } else {
        alert("Error starting recording. Please try again.");
      }
      setIsMicTestRecording(false);
    }
  };

  const stopMicTestRecording = () => {
    if (micTestMediaRecorderRef.current && isMicTestRecording) {
      micTestMediaRecorderRef.current.stop();
      setIsMicTestRecording(false);
    }
    if (micTestRecordingIntervalRef.current) {
      clearInterval(micTestRecordingIntervalRef.current);
      micTestRecordingIntervalRef.current = null;
    }
  };

  const playRecordedAudio = () => {
    if (!micTestRecordedAudioUrl) return;

    if (isMicTestPlaying) {
      // Stop current playback
      if (micTestAudioRef.current) {
        micTestAudioRef.current.pause();
        micTestAudioRef.current.currentTime = 0;
      }
      setIsMicTestPlaying(false);
    } else {
      // Start playback
      if (!micTestAudioRef.current) {
        micTestAudioRef.current = new Audio();
      }

      const audio = micTestAudioRef.current;
      audio.src = micTestRecordedAudioUrl;
      audio.volume = 1.0;
      audio.preload = "auto";

      audio.onended = () => {
        setIsMicTestPlaying(false);
      };

      audio.onerror = (error) => {
        console.error("Audio playback error:", error);
        alert("Error playing recorded audio. Please try again.");
        setIsMicTestPlaying(false);
      };

      audio
        .play()
        .then(() => {
          setIsMicTestPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          alert("Error playing recorded audio: " + error.message);
          setIsMicTestPlaying(false);
        });
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Real-time monitoring functions
  const startRealTimeMonitoring = async () => {
    if (!micStream) return;

    try {
      // Create audio context for real-time monitoring
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(micStream);
      const gainNode = audioContext.createGain();
      const destination = audioContext.destination;

      // Set up audio routing for real-time monitoring
      source.connect(gainNode);
      gainNode.connect(destination);

      // Set initial volume (you can adjust this)
      gainNode.gain.value = 0.3; // 30% volume to prevent feedback

      setRealTimeAudioContext(audioContext);
      setRealTimeGainNode(gainNode);
      setIsRealTimeMonitoring(true);

      console.log("Real-time monitoring started");
    } catch (error) {
      console.error("Error starting real-time monitoring:", error);
      alert("Error starting real-time monitoring. Please try again.");
    }
  };

  const stopRealTimeMonitoring = () => {
    if (realTimeAudioContext) {
      realTimeAudioContext.close();
      setRealTimeAudioContext(null);
    }
    if (realTimeGainNode) {
      realTimeGainNode.disconnect();
      setRealTimeGainNode(null);
    }
    setIsRealTimeMonitoring(false);
    console.log("Real-time monitoring stopped");
  };

  const adjustRealTimeVolume = (volume: number) => {
    if (realTimeGainNode) {
      realTimeGainNode.gain.value = volume;
    }
  };

  // Load device permissions from localStorage
  const loadDevicePermissions = () => {
    try {
      const saved = localStorage.getItem("devicePermissions");
      if (saved) {
        const permissions = JSON.parse(saved);
        setDevicePermissions(permissions);
        setAllowedDevices(
          new Set(
            Object.keys(permissions).filter((deviceId) => permissions[deviceId])
          )
        );
      }
    } catch (error) {
      console.error("Error loading device permissions:", error);
    }
  };

  // Save device permissions to localStorage
  const saveDevicePermissions = (deviceId: string, allowed: boolean) => {
    try {
      const newPermissions = { ...devicePermissions, [deviceId]: allowed };
      setDevicePermissions(newPermissions);
      localStorage.setItem("devicePermissions", JSON.stringify(newPermissions));

      if (allowed) {
        setAllowedDevices((prev) => new Set([...prev, deviceId]));
      } else {
        setAllowedDevices((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deviceId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error saving device permissions:", error);
    }
  };

  // Check if device is already allowed
  const isDeviceAllowed = (deviceId: string) => {
    return allowedDevices.has(deviceId) || devicePermissions[deviceId] === true;
  };

  // Restart audio monitoring for a given stream
  const restartAudioMonitoring = (stream: MediaStream, deviceId?: string) => {
    try {
      // Stop existing monitoring
      if (micLevelIntervalRef.current) {
        cancelAnimationFrame(micLevelIntervalRef.current);
        micLevelIntervalRef.current = null;
      }

      // Reset mic level
      setMicLevel(0);

      // Create new audio context and analyser
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Configure analyser
      microphone.connect(analyser);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Start monitoring loop
      const updateMicLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(average);
        micLevelIntervalRef.current = requestAnimationFrame(updateMicLevel);
      };

      // Start monitoring immediately
      updateMicLevel();

      console.log(
        "Audio monitoring restarted",
        deviceId ? `for device: ${deviceId}` : ""
      );
      console.log("Stream active:", stream.active);
      console.log(
        "Audio tracks:",
        stream.getAudioTracks().map((track) => ({
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label,
        }))
      );
    } catch (error) {
      console.error("Error restarting audio monitoring:", error);
    }
  };

  // Get available microphones
  const getAvailableMicrophones = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setAvailableMicrophones(microphones);

      if (microphones.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting microphones:", error);
    }
  };

  // Switch microphone
  const switchMicrophone = async (deviceId: string) => {
    try {
      // Check if this device is already allowed
      const isAllowed = isDeviceAllowed(deviceId);

      // If device is not allowed, ask for permission
      if (!isAllowed) {
        const permissionGranted = confirm(
          "🎤 New Microphone Device Detected\n\n" +
            "A new microphone device has been detected and needs permission to access.\n\n" +
            'Click "OK" to allow access to this microphone, then click "Allow" in the browser permission dialog.\n\n' +
            "This permission will be remembered for future use."
        );

        if (!permissionGranted) {
          return;
        }
      }

      // Stop current stream
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      });

      // Save permission for the new microphone
      saveDevicePermissions(deviceId, true);

      setMicStream(newStream);
      setSelectedMicrophone(deviceId);

      // Restart audio monitoring with new stream
      restartAudioMonitoring(newStream, deviceId);
    } catch (error) {
      console.error("Error switching microphone:", error);
      alert("Error switching microphone. Please try again.");
    }
  };

  // Toggle microphone mute
  const toggleMicrophoneMute = () => {
    if (micStream) {
      const audioTracks = micStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      const isMuted = !audioTracks[0]?.enabled;
      setIsMicMuted(isMuted);

      // If unmuting, restart monitoring to ensure it's working
      if (!isMuted) {
        setTimeout(() => {
          restartAudioMonitoring(micStream);
        }, 100);
      }
    }
  };

  // Emoji picker functions
  const openEmojiPicker = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setEmojiPickerPosition({
      top: rect.top,
      left: rect.left,
    });
    setIsEmojiPickerOpen(true);
  };

  const closeEmojiPicker = () => {
    setIsEmojiPickerOpen(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    console.log('Emoji selected in ChatApplication:', emoji);
    setNewMessage((prev) => prev + emoji);
  };


  // Delete conversation function
  const deleteConversation = async (conversationId: string, contactName: string) => {
    try {
      // Delete from real-time chat service
      realtimeChatService.deleteConversation(conversationId);
      
      // Update the conversations list
      setSimpleConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );
      
      // If the deleted conversation was selected, clear the selection
      if (selectedSimpleConversation?.id === conversationId) {
        setSelectedSimpleConversation(null);
        setSimpleMessages([]);
      }
      
      // Show success message
      showSuccessToast(`Conversation with ${contactName} deleted successfully`);
      
      console.log("🗑️ Deleted conversation:", conversationId);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      showErrorToast("Failed to delete conversation. Please try again.");
    }
  };

  // Inbox drawer toggle function
  const toggleInbox = () => {
    setIsInboxOpen(!isInboxOpen);
  };

  // Type guards
  const isVoiceMessage = (message: Message): message is VoiceMessage => {
    return "type" in message && message.type === "voice";
  };

  const isFileMessage = (message: Message): message is FileMessage => {
    return "type" in message && message.type === "file";
  };

  const isImageMessage = (message: Message): message is ImageMessage => {
    return "type" in message && message.type === "image";
  };

  const isUrlMessage = (message: Message): message is UrlMessage => {
    return "type" in message && message.type === "url";
  };

  // Function to check if message contains only emojis
  const isEmojiOnly = (text: string): boolean => {
    // Remove whitespace and check if the remaining characters are emojis
    const cleanText = text.trim();
    if (!cleanText) return false;

    // Regular expression to match emojis (including Unicode ranges for emojis)
    const emojiRegex =
      /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F0FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]+$/u;

    return emojiRegex.test(cleanText);
  };

  const renderMessage = (message: Message) => {
    if (!selectedContact) return null;

    const isAgent = message.sender === "agent";
    const isEmoji = isEmojiOnly(message.text);

    return (
      <div className="flex items-start gap-2.5 mb-4">
        {/* Avatar */}
        <img
          className="w-8 h-8 rounded-full flex-shrink-0"
          src={isAgent ? "/docs/images/people/profile-picture-3.jpg" : (selectedContact?.avatar || "/docs/images/people/profile-picture-3.jpg")} 
          alt={isAgent ? "You" : (selectedContact?.name || "User")}
        />

        {/* Message bubble */}
        <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {isAgent ? "You" : (selectedContact?.name || "Unknown")}
              </span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {message.timestamp}
              </span>
            </div>

            {/* Message content based on type */}
            {isVoiceMessage(message) ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                  <button
                    onClick={() =>
                      message.audioUrl &&
                      playAudio(message.id, message.audioUrl)
                    }
                className="inline-flex self-center items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                    type="button"
                  >
                    <svg
                      className="w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 12 16"
                    >
                      <path d="M3 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm7 0H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
                    </svg>
                  </button>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Voice message ({message.duration}s)
                  </span>
              </div>
            ) : isFileMessage(message) ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
              <div className="inline-flex items-center p-2 text-sm font-medium text-center rounded-lg text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-700">
                      <svg
                        className="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                  viewBox="0 0 16 20"
                      >
                  <path d="M8 0a7.992 7.992 0 0 0-6.583 12.535 1 1 0 0 0 .12.183l.12.146c.112.145.227.285.326.4l5.245 6.374a1 1 0 0 0 1.545-.003l5.092-6.205c.206-.222.4-.455.578-.7l.127-.155a.934.934 0 0 0 .122-.192A8.001 8.001 0 0 0 8 0Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                      </svg>
                  </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {message.fileName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.fileType} • {formatFileSize(message.fileSize)}
                </span>
                </div>
              </div>
            ) : isImageMessage(message) ? (
              <PhotoAlbumMessage
                message={message}
                currentUser={currentUser}
                onDownloadImage={(imageUrl, imageName) => {
                  // Handle individual image download
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = imageName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                onSaveAll={(images) => {
                  // Handle save all images
                  images.forEach((img, index) => {
                    setTimeout(() => {
                      const link = document.createElement('a');
                      link.href = img.url;
                      link.download = img.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }, index * 100);
                  });
                }}
                onReply={handleReplyToMessage}
                onForward={handleForwardMessage}
                onCopy={handleCopyMessage}
                onReport={handleReportMessage}
                onDelete={handleDeleteMessage}
              />
            ) : isUrlMessage(message) ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                  <img
                    src={message.image}
                alt="Link preview"
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {message.title}
                  </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.description}
                  </span>
              </div>
              </div>
            ) : (
            <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">
                  {message.text}
                </p>
          )}
          
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Delivered
            </span>
          </div>

        {/* Three dots menu - Only for non-image messages */}
        {!isImageMessage(message) && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => {
                console.log('🎯 Old dropdown button clicked!');
                setOpenDropdownId(
                  openDropdownId === message.id.toString() ? null : message.id.toString()
                );
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              type="button"
            >
              <svg
                style={{ width: '16px', height: '16px', color: '#6b7280' }}
                viewBox="0 0 4 15"
                fill="currentColor"
              >
                <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </button>
          </div>
        )}

            {/* Dropdown menu - Only for non-image messages */}
        {!isImageMessage(message) && openDropdownId === message.id.toString() && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '4px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              minWidth: '160px',
              zIndex: 1000,
            }}
          >
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={() => handleMessageAction(message.id, "reply")}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Reply
              </button>
              <button
                onClick={() => handleMessageAction(message.id, "forward")}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Forward
              </button>
              <button
                onClick={() => handleMessageAction(message.id, "copy")}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Copy
              </button>
              <button
                onClick={() => handleReport(message)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Report
              </button>
              <button
                onClick={() => handleDelete(message)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#dc2626',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the main chat application
  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden max-h-[calc(100vh-5rem)]">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Inbox Drawer */}
      <div className={`${isInboxOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0`}>
        <div className="h-full flex flex-col min-h-0">
        {/* Inbox Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
              <div className="flex items-center space-x-2">
              <button
                onClick={handleCreateNewChat}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Create new message"
                >
                  <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={toggleInbox}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          </div>
            
            {/* Filter Icons */}
            <div className="flex items-center space-x-1 mb-4">
              <button
                onClick={() => setFilterType('unread')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === 'unread' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterType('drafts')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === 'drafts' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilterType('contacts')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === 'contacts' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Contacts
              </button>
              <button
                onClick={() => setFilterType('groups')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === 'groups' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Groups
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
        </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredSimpleConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin</p>
              </div>
            ) : (
              filteredSimpleConversations.map((conversation) => {
                const contactName = conversation.type === "group" 
                  ? (conversation.groupName || "Group Chat")
                  : (conversation.user1Email === currentUser?.email ? conversation.user2Name : conversation.user1Name);

                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedSimpleConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedSimpleConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {conversation.type === "group" ? "G" : contactName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {contactName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete the conversation with ${contactName}?`)) {
                            deleteConversation(conversation.id, contactName);
                          }
                        }}
                        className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                </div>
              </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800">
        {/* Chat Header */}
        <div className="p-4 pb-6 pt-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            {selectedSimpleConversation ? (
              <>
            <div className="flex items-center space-x-3">
                <button
                  onClick={toggleInbox}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedSimpleConversation.type === "group" 
                      ? "G" 
                      : (selectedSimpleConversation.user1Email === currentUser?.email 
                          ? selectedSimpleConversation.user2Name.charAt(0).toUpperCase()
                          : selectedSimpleConversation.user1Name.charAt(0).toUpperCase())}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedSimpleConversation.type === "group" 
                        ? (selectedSimpleConversation.groupName || "Group Chat")
                        : (selectedSimpleConversation.user1Email === currentUser?.email 
                        ? selectedSimpleConversation.user2Name
                            : selectedSimpleConversation.user1Name)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedSimpleConversation.type === "group" ? "Group chat" : "Online"}
                    </p>
                  </div>
            </div>
            <div className="flex items-center space-x-2">
                  {selectedSimpleConversation.type === "group" && (
              <button
                      onClick={() => setShowGroupManagementModal(true)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Manage group"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsVideoCallOpen(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Video call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsVoiceCallOpen(true)}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title="Voice call"
                  >
                    <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={testCamera}
                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    title="Test camera"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              </button>
              <button
                onClick={testMicrophone}
                    className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    title="Test microphone"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                    ?
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose a chat to start messaging
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsVideoCallOpen(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Video call"
                  >
                    <Video className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsVoiceCallOpen(true)}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title="Voice call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                    onClick={testCamera}
                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    title="Test camera"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
              </button>
                  <button
                    onClick={testMicrophone}
                    className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    title="Test microphone"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
              </button>
            </div>
              </>
            )}
          </div>
        </div>

          {selectedSimpleConversation ? (
            <>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 pt-8 space-y-4 bg-white dark:bg-gray-800 min-h-0">
              {simpleMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                simpleMessages.map((message) => {
                  const isCurrentUser = message.senderEmail === currentUser?.email;
                    
                    return (
                      <div
                      key={message.id} 
                      className={`flex items-start gap-2.5 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        <img 
                          className="w-8 h-8 rounded-full" 
                        src={message.senderEmail === currentUser?.email 
                          ? "/docs/images/people/profile-picture-3.jpg" 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderEmail)}&background=8b5cf6&color=fff`}
                        alt={message.senderEmail}
                      />
                        <div className="flex flex-col gap-1">
                        <div className={`flex flex-col w-full max-w-[326px] leading-1.5 p-4 ${
                          isCurrentUser 
                            ? 'bg-blue-500 text-white rounded-s-xl rounded-ee-xl' 
                            : 'border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700'
                        }`}>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                            <span className={`text-sm font-semibold ${
                              isCurrentUser ? 'text-white' : 'text-gray-900 dark:text-white'
                            }`}>
                              {message.senderEmail === currentUser?.email ? "You" : message.senderEmail}
                              </span>
                            <span className={`text-sm font-normal ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {message.timestamp}
                              </span>
                            </div>
                            
                          {/* Message content */}
                          {message.type === 'image' && message.images && message.images.length > 0 ? (
                            <div className="grid gap-4 grid-cols-2 my-2.5">
                              {message.images.slice(0, 4).map((image, index) => (
                                <div key={index} className="group relative">
                                  <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                    <button 
                                      data-tooltip-target={`download-image-${message.id}-${index}`}
                                      className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = image.url;
                                        link.download = image.name || `image-${message.id}-${index}.jpg`;
                                        link.click();
                                      }}
                                    >
                                      <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                                      </svg>
                                    </button>
                                    <div id={`download-image-${message.id}-${index}`} role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                      Download image
                                      <div className="tooltip-arrow" data-popper-arrow></div>
                                    </div>
                                  </div>
                                  <img src={image.url} className="rounded-lg max-w-full h-auto" alt={`Shared image ${index + 1}`} />
                                </div>
                              ))}
                              {message.images.length > 4 && (
                                <div className="group relative">
                                  <button 
                                    className="absolute w-full h-full bg-gray-900/90 hover:bg-gray-900/50 transition-all duration-300 rounded-lg flex items-center justify-center"
                                    onClick={() => {
                                      // Download all remaining images
                                      if (message.images) {
                                        message.images.slice(4).forEach((image, index) => {
                                          const link = document.createElement('a');
                                          link.href = image.url;
                                          link.download = image.name || `image-${message.id}-${index + 4}.jpg`;
                                          link.click();
                                        });
                                      }
                                    }}
                                  >
                                    <span className="text-xl font-medium text-white">+{message.images.length - 4}</span>
                                    <div id="download-all" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                      Download all remaining images
                                      <div className="tooltip-arrow" data-popper-arrow></div>
                                    </div>
                                  </button>
                                  <img src={message.images[4].url} className="rounded-lg max-w-full h-auto" alt="More images" />
                                </div>
                              )}
                            </div>
                          ) : message.type === 'file' && message.fileName ? (
                <div className="relative">
                  <FileMessage
                    message={message}
                    currentUser={currentUser}
                    onDownload={(url, fileName) => {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    onReply={handleReplyToMessage}
                    onForward={handleForwardMessage}
                    onCopy={handleCopyMessage}
                    onReport={handleReportMessage}
                    onDelete={handleDeleteMessage}
                  />
                </div>
              ) : message.type === 'audio' && message.audioUrl ? (
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <button 
                                className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-600" 
                                type="button"
                                onClick={() => {
                                  // Play/pause audio functionality
                                  const audio = new Audio(message.audioUrl);
                                  audio.play();
                                }}
                              >
                                <svg className="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 12 16">
                                  <path d="M3 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm7 0H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z"/>
                                </svg>
                              </button>
                              <svg aria-hidden="true" className="w-[145px] md:w-[185px] md:h-[40px]" viewBox="0 0 185 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect y="17" width="3" height="6" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="7" y="15.5" width="3" height="9" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="21" y="6.5" width="3" height="27" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="14" y="6.5" width="3" height="27" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="28" y="3" width="3" height="34" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="35" y="3" width="3" height="34" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="42" y="5.5" width="3" height="29" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="49" y="10" width="3" height="20" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="56" y="13.5" width="3" height="13" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="63" y="16" width="3" height="8" rx="1.5" fill="#6B7280" className="dark:fill-white"/>
                                <rect x="70" y="12.5" width="3" height="15" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="77" y="3" width="3" height="34" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="84" y="3" width="3" height="34" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="91" y="0.5" width="3" height="39" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="98" y="0.5" width="3" height="39" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="105" y="2" width="3" height="36" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="112" y="6.5" width="3" height="27" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="119" y="9" width="3" height="22" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="126" y="11.5" width="3" height="17" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="133" y="2" width="3" height="36" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="140" y="2" width="3" height="36" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="147" y="7" width="3" height="26" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="154" y="9" width="3" height="22" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="161" y="9" width="3" height="22" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="168" y="13.5" width="3" height="13" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="175" y="16" width="3" height="8" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="182" y="17.5" width="3" height="5" rx="1.5" fill="#E5E7EB" className="dark:fill-gray-500"/>
                                <rect x="66" y="16" width="8" height="8" rx="4" fill="#1C64F2"/>
                              </svg>
                              <span className="inline-flex self-center items-center p-2 text-sm font-medium text-gray-900 dark:text-white">
                                {message.duration || '3:42'}
                              </span>
                            </div>
                          ) : (
                            <p className={`text-sm font-normal ${
                              isCurrentUser ? 'text-white' : 'text-gray-900 dark:text-white'
                            }`}>
                              {message.text}
                            </p>
                          )}
                          
                          {message.type === 'image' && message.images && message.images.length > 1 ? (
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-normal ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Delivered
                              </span>
                              <button 
                                className="text-sm text-blue-700 dark:text-blue-500 font-medium inline-flex items-center hover:underline"
                                onClick={() => {
                                  // Download all images
                                  if (message.images) {
                                    message.images.forEach((image, index) => {
                                      const link = document.createElement('a');
                                      link.href = image.url;
                                      link.download = image.name || `image-${message.id}-${index}.jpg`;
                                      link.click();
                                    });
                                  }
                                }}
                              >
                                <svg className="w-3 h-3 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                                </svg>
                                Save all
                              </button>
                            </div>
                          ) : (
                            <span className={`text-sm font-normal ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              Delivered
                            </span>
                          )}
                          </div>
                        </div>
                        
                          
                      {/* Dropdown menu */}
                      {openDropdownId === message.id && (
                        <div id={`dropdownDots-${message.id}`} className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600 absolute right-0 mt-8">
                          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby={`dropdownMenuIconButton-${message.id}`}>
                                <li>
                                  <button 
                                    onClick={() => handleReply(message)}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  >
                                    Reply
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => handleForward(message)}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  >
                                    Forward
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => handleCopy(message)}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  >
                                    Copy
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => handleReport(message)}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  >
                                    Report
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => handleDelete(message)}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  >
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
        </div>

            {/* Typing Indicator */}
            {typingIndicator[selectedSimpleConversation.id] && (
              <div className="px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {typingIndicator[selectedSimpleConversation.id]} is typing...
                </span>
            </div>
          </div>
        )}

        {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Text Input Area */}
              <div className="relative">
                <textarea 
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  onPaste={handlePaste}
                  className="p-3 sm:p-4 pb-12 sm:pb-12 block w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white resize-none" 
                  placeholder="Ask me anything..."
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />

                {/* Toolbar */}
                <div className="absolute bottom-px inset-x-px p-2 rounded-b-lg bg-gray-100 dark:bg-gray-700">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    {/* Button Group */}
                    <div className="flex items-center">
                      {/* Emoji Button */}
                <button
                        type="button" 
                        onClick={openEmojiPicker}
                        className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-600 focus:z-10 focus:outline-hidden focus:bg-white dark:focus:bg-gray-600"
                        title="Add emoji"
                      >
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                </button>
                      {/* End Emoji Button */}

                      {/* Attach Button */}
                    <button
                        type="button" 
                      onClick={() => {
                          // Show a menu to choose between file and image
                          const isImage = confirm("Choose attachment type:\nOK = Image\nCancel = File");
                          if (isImage) {
                        imageInputRef.current?.click();
                          } else {
                        fileInputRef.current?.click();
                          }
                      }}
                        className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-600 focus:z-10 focus:outline-hidden focus:bg-white dark:focus:bg-gray-600"
                        title="Attach file or image"
                    >
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                    </button>
                      {/* End Attach Button */}
                  </div>
                    {/* End Button Group */}

                    {/* Button Group */}
                    <div className="flex items-center gap-x-1">
                      {/* Mic Button */}
              <button
                        type="button" 
                        className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-600 focus:z-10 focus:outline-hidden focus:bg-white dark:focus:bg-gray-600"
                        title="Voice message"
                      >
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" x2="12" y1="19" y2="22"/>
                        </svg>
              </button>
                      {/* End Mic Button */}

                      {/* Send Button */}
              <button
                        type="button" 
                onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-hidden focus:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        title="Send message"
                      >
                        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                        </svg>
              </button>
                      {/* End Send Button */}
            </div>
                    {/* End Button Group */}
          </div>
        </div>
                {/* End Toolbar */}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome to Chat</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select a conversation or start a new chat</p>
              <button
                onClick={handleCreateNewChat}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="*/*"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />

      {/* Emoji Picker */}
      {isEmojiPickerOpen && (
        <EmojiPicker
          isOpen={isEmojiPickerOpen}
          onEmojiSelect={handleEmojiSelect}
          onClose={closeEmojiPicker}
          position={emojiPickerPosition}
        />
      )}

      {/* Video Call Modal */}
      {isVideoCallOpen && (
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
          contactName={selectedSimpleConversation?.type === "group" 
            ? (selectedSimpleConversation.groupName || "Group Chat")
            : (selectedSimpleConversation?.user1Email === currentUser?.email 
                ? selectedSimpleConversation?.user2Name || "Unknown"
                : selectedSimpleConversation?.user1Name || "Unknown")}
        />
      )}

      {/* User Selection Modal */}
      {isUserSelectionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select User to Chat</h3>
              <button
                onClick={() => setIsUserSelectionOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableUsers.map((user) => (
              <button
                    key={user.id}
                    onClick={() => startChatWithUser(user)}
                    className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{user.department} • {user.role}</p>
                      </div>
                    </div>
              </button>
                ))}
            </div>
            )}
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />

      {/* Group Management Modal */}
      <GroupManagementModal
        isOpen={showGroupManagementModal}
        onClose={() => setShowGroupManagementModal(false)}
        conversation={selectedSimpleConversation}
        onGroupUpdated={handleGroupUpdated}
      />

      {/* Forward Message Modal */}
      <ForwardMessageModal
        isOpen={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          setMessageToForward(null);
        }}
        onForward={handleForwardToConversation}
        conversations={simpleConversations.map(conv => ({
          id: conv.id,
          name: (conv as any).name || conv.id,
          type: conv.type as 'direct' | 'group',
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        }))}
        messageToForward={messageToForward ? {
          text: messageToForward.text,
          type: messageToForward.type || 'text',
          images: (messageToForward as any).images
        } : null}
      />

      {/* Camera Test Modal */}
      {isCameraTestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Camera Test</h3>
              <button
                onClick={closeCameraTest}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
                  <div className="text-center">
              {isCameraLoading ? (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Loading camera...</p>
                </div>
              ) : cameraStream ? (
                <div>
                <video
                  ref={cameraTestRef}
                  autoPlay
                  playsInline
                    className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Camera is working properly
                    </p>
                  </div>
              ) : (
                <div className="py-8">
                  <p className="text-gray-500 dark:text-gray-400">Camera not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Microphone Test Modal */}
      {isMicTestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Microphone Test</h3>
              <button
                onClick={closeMicTest}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              {isMicLoading ? (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Loading microphone...</p>
                </div>
              ) : micStream ? (
                <div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-100"
                        style={{ width: `${Math.min(micLevel * 2, 100)}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Microphone Level: {Math.round(micLevel)}%
                    </p>
                  </div>

                  <div className="space-y-2">
                      {!isMicTestRecording ? (
                        <button
                          onClick={startMicTestRecording}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Start Recording Test
                        </button>
                      ) : (
                        <button
                          onClick={stopMicTestRecording}
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Stop Recording ({formatRecordingTime(micTestRecordingTime)})
                        </button>
                      )}

                      {micTestRecordedAudioUrl && (
                        <button
                          onClick={playRecordedAudio}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {isMicTestPlaying ? 'Stop Playback' : 'Play Recording'}
                        </button>
                      )}
                    </div>

                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Microphone is working properly
                  </p>
                </div>
              ) : (
                <div className="py-8">
                  <p className="text-gray-500 dark:text-gray-400">Microphone not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApplication;