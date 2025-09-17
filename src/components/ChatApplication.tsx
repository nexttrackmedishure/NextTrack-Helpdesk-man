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

  // Filter contacts based on search term (works with both old and new systems)
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter simple conversations based on search term
  const filteredSimpleConversations = simpleConversations.filter((conv) => {
    const contactName =
      conv.user1Email === currentUser?.email ? conv.user2Name : conv.user1Name;
    return contactName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
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
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log("🔊 Played notification sound for new message");
    } catch (error) {
      console.log("🔇 Could not play notification sound:", error);
    }
  };

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
            playNotificationSound();
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
        'textarea[placeholder="Aa"]'
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
        'textarea[placeholder="Aa"]'
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
        alert(
          "No users found in the MongoDB database. Please create some users first using the User Directory."
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
      alert(
        "Error loading users from MongoDB database. Please check your database connection and try again."
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
      alert("Please log in to start a chat");
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

      // Show success message
      alert(`New chat created with ${user.name}!`);
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert(
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

  const sendVoiceMessage = () => {
    if (audioBlob) {
      const voiceMessage: VoiceMessage = {
        id: messages.length + 1,
        text: "",
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: false,
        type: "voice",
        duration: recordingTime,
        audioUrl: audioUrl || undefined,
      };
      setMessages([...messages, voiceMessage]);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
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
      sendFileMessage(files);
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

  const sendFileMessage = async (files: File[]) => {
    if (!selectedSimpleConversation || !currentUser?.email) {
      console.error('No conversation selected or user not logged in');
      return;
    }

    for (const file of files) {
      try {
        const fileUrl = URL.createObjectURL(file);
        
        await realtimeChatService.sendMessage(
          selectedSimpleConversation.id,
          "", // Empty text for file messages
          "file",
          {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: fileUrl,
          }
        );
      } catch (error) {
        console.error('Error sending file message:', error);
      }
    }
  };

  const sendImageMessage = async (files: File[]) => {
    if (!selectedSimpleConversation || !currentUser?.email) {
      console.error('No conversation selected or user not logged in');
      return;
    }

    try {
      const images = files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      }));
      
      await realtimeChatService.sendMessage(
        selectedSimpleConversation.id,
        "", // Empty text for image messages
        "image",
        { images }
      );
    } catch (error) {
      console.error('Error sending image message:', error);
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
    setNewMessage((prev) => prev + emoji);
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
      <div
        className={`flex items-center gap-2.5 ${
          isAgent ? "justify-end" : "justify-start"
        }`}
      >
        {/* Three dots menu for agent messages - positioned on left side */}
        {isAgent && (
          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdownId(
                  openDropdownId === message.id ? null : message.id
                )
              }
              className="inline-flex items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 text-white bg-violet-300/40 hover:bg-violet-200/30"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 4 15"
              >
                <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {openDropdownId === message.id && (
              <div className="absolute z-20 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-48 dark:bg-gray-700 dark:divide-gray-600 top-full left-0 mt-2">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  {/* User Management Section */}
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "view-profile")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      👤 View Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "edit-user")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      ✏️ Edit User
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "user-directory")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      📋 User Directory
                    </button>
                  </li>

                  {/* Divider */}
                  <li>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  </li>

                  {/* Message Actions Section */}
                  <li>
                    <button
                      onClick={() => handleMessageAction(message.id, "reply")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      💬 Reply
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleMessageAction(message.id, "forward")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      ➡️ Forward
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleMessageAction(message.id, "copy")}
                      data-message-id={message.id}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      📋 Copy
                    </button>
                  </li>

                  {/* Divider */}
                  <li>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  </li>

                  {/* User Status Actions */}
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "toggle-status")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      {selectedContact.status === "active"
                        ? "🚫 Deactivate"
                        : "✅ Activate"}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "block-user")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-red-600 dark:text-red-400"
                    >
                      🚫 Block User
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Avatar for customer messages */}
        {!isAgent && selectedContact && (
          <img
            className="w-8 h-8 rounded-full"
            src={selectedContact.avatar}
            alt={selectedContact.name}
          />
        )}

        {/* Message bubble - Outline or Filled */}
        {useOutlineBubble && !isAgent ? (
          <div className="flex flex-col gap-1 w-full max-w-[320px]">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedContact?.name || "Unknown"}
              </span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {message.timestamp}
              </span>
            </div>
            <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
              <p className="text-sm font-normal text-gray-900 dark:text-white">
                {message.text}
              </p>
            </div>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {isAgent ? (message.isRead ? "Read" : "Delivered") : "Sent"}
            </span>
          </div>
        ) : (
          <div
            className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 rounded-xl ${
              isAgent
                ? "bg-violet-300/40 text-white rounded-e-xl rounded-es-xl"
                : "border-gray-200 bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl"
            }`}
          >
            {/* Message header */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span
                className={`text-sm font-semibold ${
                  isAgent ? "text-white" : "text-gray-900 dark:text-white"
                }`}
              >
                {isAgent ? "You" : selectedContact?.name || "Unknown"}
              </span>
              <span
                className={`text-sm font-normal ${
                  isAgent
                    ? "text-violet-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {message.timestamp}
              </span>
            </div>

            {/* Message content based on type */}
            {isVoiceMessage(message) ? (
              <div
                className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                  isAgent ? "bg-violet-200/30" : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() =>
                      message.audioUrl &&
                      playAudio(message.id, message.audioUrl)
                    }
                    className={`inline-flex self-center items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 ${
                      isAgent
                        ? "text-white bg-violet-300/40 hover:bg-violet-400"
                        : "text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
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
                  <svg
                    className="w-[145px] md:w-[185px] md:h-[40px]"
                    aria-hidden="true"
                    viewBox="0 0 185 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      y="17"
                      width="3"
                      height="6"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="7"
                      y="15.5"
                      width="3"
                      height="9"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="21"
                      y="6.5"
                      width="3"
                      height="27"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="14"
                      y="6.5"
                      width="3"
                      height="27"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="28"
                      y="3"
                      width="3"
                      height="34"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="35"
                      y="3"
                      width="3"
                      height="34"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="42"
                      y="5.5"
                      width="3"
                      height="29"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="49"
                      y="10"
                      width="3"
                      height="20"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="56"
                      y="13.5"
                      width="3"
                      height="13"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="63"
                      y="16"
                      width="3"
                      height="8"
                      rx="1.5"
                      fill="#6B7280"
                      className="dark:fill-white"
                    />
                    <rect
                      x="70"
                      y="12.5"
                      width="3"
                      height="15"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="77"
                      y="3"
                      width="3"
                      height="34"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="84"
                      y="3"
                      width="3"
                      height="34"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="91"
                      y="0.5"
                      width="3"
                      height="39"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="98"
                      y="0.5"
                      width="3"
                      height="39"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="105"
                      y="2"
                      width="3"
                      height="36"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="112"
                      y="6.5"
                      width="3"
                      height="27"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="119"
                      y="9"
                      width="3"
                      height="22"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="126"
                      y="11.5"
                      width="3"
                      height="17"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="133"
                      y="2"
                      width="3"
                      height="36"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="140"
                      y="2"
                      width="3"
                      height="36"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="147"
                      y="7"
                      width="3"
                      height="26"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="154"
                      y="9"
                      width="3"
                      height="22"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="161"
                      y="9"
                      width="3"
                      height="22"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="168"
                      y="13.5"
                      width="3"
                      height="13"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="175"
                      y="16"
                      width="3"
                      height="8"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="182"
                      y="17.5"
                      width="3"
                      height="5"
                      rx="1.5"
                      fill="#E5E7EB"
                      className="dark:fill-gray-500"
                    />
                    <rect
                      x="66"
                      y="16"
                      width="8"
                      height="8"
                      rx="4"
                      fill="#1C64F2"
                    />
                  </svg>
                  <span
                    className={`inline-flex self-center items-center p-2 text-sm font-medium ${
                      isAgent ? "text-white" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {formatTime(message.duration)}
                  </span>
                </div>
              </div>
            ) : isFileMessage(message) ? (
              <div
                className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                  isAgent ? "bg-violet-200/30" : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <div className="flex items-start bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
                  <div className="me-2">
                    <span
                      className={`flex items-center gap-2 text-sm font-medium pb-2 ${
                        isAgent ? "text-white" : "text-gray-900 dark:text-white"
                      }`}
                    >
                      <svg
                        fill="none"
                        aria-hidden="true"
                        className="w-5 h-5 shrink-0"
                        viewBox="0 0 20 21"
                      >
                        <g clipPath="url(#clip0_3173_1381)">
                          <path
                            fill="#E2E5E7"
                            d="M5.024.5c-.688 0-1.25.563-1.25 1.25v17.5c0 .688.562 1.25 1.25 1.25h12.5c.687 0 1.25-.563 1.25-1.25V5.5l-5-5h-8.75z"
                          />
                          <path
                            fill="#B0B7BD"
                            d="M15.024 5.5h3.75l-5-5v3.75c0 .688.562 1.25 1.25 1.25z"
                          />
                          <path
                            fill="#CAD1D8"
                            d="M18.774 9.25l-3.75-3.75h3.75v3.75z"
                          />
                          <path
                            fill="#F15642"
                            d="M16.274 16.75a.627.627 0 01-.625.625H1.899a.627.627 0 01-.625-.625V10.5c0-.344.281-.625.625-.625h13.75c.344 0 .625.281.625.625v6.25z"
                          />
                          <path
                            fill="#fff"
                            d="M3.998 12.342c0-.165.13-.345.34-.345h1.154c.65 0 1.235.435 1.235 1.269 0 .79-.585 1.23-1.235 1.23h-.834v.66c0 .22-.14.344-.32.344a.337.337 0 01-.34-.344v-2.814zm.66.284v1.245h.834c.335 0 .6-.295.6-.605 0-.35-.265-.64-.6-.64h-.834zM7.706 15.5c-.165 0-.345-.09-.345-.31v-2.838c0-.18.18-.31.345-.31H8.85c2.284 0 2.234 3.458.045 3.458h-1.19zm.315-2.848v2.239h.83c1.349 0 1.409-2.24 0-2.24h-.83zM11.894 13.486h1.274c.18 0 .36.18.36.355 0 .165-.18.3-.36.3h-1.274v1.049c0 .175-.124.31-.3.31-.22 0-.354-.135-.354-.31v-2.839c0-.18.135-.31.355-.31h1.754c.22 0 .35.13.35.31 0 .16-.13.34-.35.34h-1.455v.795z"
                          />
                          <path
                            fill="#CAD1D8"
                            d="M15.649 17.375H3.774V18h11.875a.627.627 0 00.625-.625v-.625a.627.627 0 01-.625.625z"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_3173_1381">
                            <path
                              fill="#fff"
                              d="M0 0h20v20H0z"
                              transform="translate(0 .5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      {message.fileName}
                    </span>
                    <span
                      className={`flex text-xs font-normal gap-2 ${
                        isAgent
                          ? "text-violet-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {Math.ceil((message.fileSize / 1024 / 1024) * 12)} Pages
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="self-center"
                        width="3"
                        height="4"
                        viewBox="0 0 3 4"
                        fill="none"
                      >
                        <circle cx="1.5" cy="2" r="1.5" fill="#6B7280" />
                      </svg>
                      {formatFileSize(message.fileSize)}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="self-center"
                        width="3"
                        height="4"
                        viewBox="0 0 3 4"
                        fill="none"
                      >
                        <circle cx="1.5" cy="2" r="1.5" fill="#6B7280" />
                      </svg>
                      {message.fileType.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                  <div className="inline-flex self-center items-center">
                    <button
                      onClick={() => window.open(message.fileUrl, "_blank")}
                      className={`inline-flex self-center items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 ${
                        isAgent
                          ? "text-white bg-violet-300/40 hover:bg-violet-400"
                          : "text-gray-900 bg-gray-50 hover:bg-gray-100 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500"
                      }`}
                      type="button"
                    >
                      <svg
                        className="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                        <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : isImageMessage(message) ? (
              <div
                className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                  isAgent ? "bg-violet-200/30" : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {message.text && (
                  <p
                    className={`text-sm font-normal mb-2 ${
                      isAgent ? "text-white" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                {message.images.length === 1 ? (
                  <div className="group relative my-2.5">
                    <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <button
                        onClick={() =>
                          window.open(message.images[0].url, "_blank")
                        }
                        className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                        data-tooltip-target="download-image"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 16 18"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                          />
                        </svg>
                      </button>
                      <div
                        id="download-image"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
                      >
                        Download image
                        <div className="tooltip-arrow" data-popper-arrow></div>
                      </div>
                    </div>
                    <img
                      src={message.images[0].url}
                      alt="Shared image"
                      className="rounded-lg w-full max-w-sm cursor-pointer"
                      onClick={() =>
                        window.open(message.images[0].url, "_blank")
                      }
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 my-2.5">
                    {message.images.slice(0, 4).map((image, index) => (
                      <div
                        key={`image-${message.id}-${index}`}
                        className="group relative"
                      >
                        {index === 3 && message.images.length > 4 ? (
                          <button
                            className="absolute w-full h-full bg-gray-900/90 hover:bg-gray-900/50 transition-all duration-300 rounded-lg flex items-center justify-center"
                            onClick={() => {
                              // Handle view all images
                              message.images.forEach((img) =>
                                window.open(img.url, "_blank")
                              );
                            }}
                          >
                            <span className="text-xl font-medium text-white">
                              +{message.images.length - 3}
                            </span>
                            <div
                              id="download-image"
                              role="tooltip"
                              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
                            >
                              Download image
                              <div
                                className="tooltip-arrow"
                                data-popper-arrow
                              ></div>
                            </div>
                          </button>
                        ) : (
                          <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => window.open(image.url, "_blank")}
                              className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                              data-tooltip-target={`download-image-${
                                index + 1
                              }`}
                            >
                              <svg
                                className="w-4 h-4 text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 16 18"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                                />
                              </svg>
                            </button>
                            <div
                              id={`download-image-${index + 1}`}
                              role="tooltip"
                              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
                            >
                              Download image
                              <div
                                className="tooltip-arrow"
                                data-popper-arrow
                              ></div>
                            </div>
                          </div>
                        )}
                        <img
                          src={image.url}
                          alt={image.name}
                          className="rounded-lg w-full h-24 object-cover cursor-pointer"
                          onClick={() => window.open(image.url, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {message.images.length > 1 && (
                  <div className="flex justify-end items-center">
                    <button
                      className={`text-sm font-medium inline-flex items-center hover:underline ${
                        isAgent
                          ? "text-violet-200 hover:text-violet-100"
                          : "text-violet-700 dark:text-violet-500"
                      }`}
                      onClick={() => {
                        // Handle save all images
                        message.images.forEach((img) => {
                          const link = document.createElement("a");
                          link.href = img.url;
                          link.download = img.name;
                          link.click();
                        });
                      }}
                    >
                      <svg
                        className="w-3 h-3 me-1.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 18"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                        />
                      </svg>
                      Save all
                    </button>
                  </div>
                )}
              </div>
            ) : isUrlMessage(message) ? (
              <div
                className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                  isAgent ? "bg-violet-200/30" : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <p
                  className={`text-sm font-normal py-2.5 ${
                    isAgent ? "text-white" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {message.description || "Check out this link:"}
                </p>
                <p
                  className={`text-sm font-normal pb-2.5 ${
                    isAgent ? "text-white" : "text-gray-900 dark:text-white"
                  }`}
                >
                  <a
                    href={message.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline hover:no-underline font-medium break-all ${
                      isAgent
                        ? "text-violet-200 hover:text-violet-100"
                        : "text-violet-700 dark:text-violet-500"
                    }`}
                  >
                    {message.url}
                  </a>
                </p>
                <a
                  href={message.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block rounded-xl p-4 mb-2 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors ${
                    isAgent
                      ? "bg-violet-300/40/20 hover:bg-violet-300/40/30"
                      : "bg-gray-50 dark:bg-gray-600"
                  }`}
                >
                  <img
                    src={message.image}
                    alt={message.title}
                    className="rounded-lg mb-2 w-full h-32 object-cover"
                  />
                  <span
                    className={`text-sm font-medium block mb-2 ${
                      isAgent ? "text-white" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {message.title}
                  </span>
                  <span
                    className={`text-xs font-normal ${
                      isAgent
                        ? "text-violet-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {new URL(message.url).hostname}
                  </span>
                </a>
              </div>
            ) : (
              <div
                className={`flex flex-col leading-1.5 ${
                  isEmoji
                    ? "p-2" // Less padding for emoji messages
                    : "p-4 border-gray-200 rounded-e-xl rounded-es-xl"
                } ${
                  isEmoji
                    ? "" // No background for emoji messages
                    : isAgent
                    ? "bg-violet-50/60/40 dark:bg-violet-900/30/10"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <p
                  className={`${
                    isEmoji
                      ? "text-4xl" // Larger text for emojis
                      : "text-sm font-normal"
                  } ${
                    isEmoji
                      ? "" // No color override for emojis
                      : isAgent
                      ? "text-violet-600 dark:text-violet-300"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Message status */}
            <span
              className={`text-sm font-normal ${
                isAgent
                  ? "text-violet-500 dark:text-violet-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {isAgent ? (message.isRead ? "Read" : "Delivered") : "Sent"}
            </span>
          </div>
        )}

        {/* Three dots menu for customer messages - positioned on right side */}
        {!isAgent && (
          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdownId(
                  openDropdownId === message.id ? null : message.id
                )
              }
              className="inline-flex items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 text-gray-900 bg-white dark:text-white dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 4 15"
              >
                <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {openDropdownId === message.id && (
              <div className="absolute z-20 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-48 dark:bg-gray-700 dark:divide-gray-600 top-full right-0 mt-2">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  {/* User Management Section */}
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "view-profile")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      👤 View Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "edit-user")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      ✏️ Edit User
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "user-directory")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      📋 User Directory
                    </button>
                  </li>

                  {/* Divider */}
                  <li>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  </li>

                  {/* Message Actions Section */}
                  <li>
                    <button
                      onClick={() => handleMessageAction(message.id, "reply")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      💬 Reply
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleMessageAction(message.id, "forward")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      ➡️ Forward
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleMessageAction(message.id, "copy")}
                      data-message-id={message.id}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      📋 Copy
                    </button>
                  </li>

                  {/* Divider */}
                  <li>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  </li>

                  {/* User Status Actions */}
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "toggle-status")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      {selectedContact.status === "active"
                        ? "🚫 Deactivate"
                        : "✅ Activate"}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleUserAction(selectedContact.id, "block-user")
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-red-600 dark:text-red-400"
                    >
                      🚫 Block User
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900 min-h-0">
      {/* Sidebar */}
      <div
        className={`${
          isInboxOpen ? "w-80" : "w-0"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {/* Inbox Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm flex-shrink-0 min-h-[80px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {/* Inbox Title with Icon */}
              <div className="flex items-center space-x-2">
                <Inbox className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Inbox
                </h2>
              </div>
              {/* Visual line break under the inbox title - matching sidebar style */}
              <div className="h-px w-full bg-gradient-to-r from-violet-500 to-violet-300 dark:from-violet-400 dark:to-violet-600 mt-2"></div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Create New Chat Button - moved to right before toggle button */}
              <button
                onClick={handleCreateNewChat}
                disabled={isLoadingUsers}
                className={`p-2 rounded-lg transition-colors ${
                  isLoadingUsers
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-700"
                } text-white`}
                title={isLoadingUsers ? "Loading users..." : "Create New Chat"}
              >
                {isLoadingUsers ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={toggleInbox}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Hide Inbox"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          </div>
          {isInboxOpen && (
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Contact List */}
        {isInboxOpen && (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredSimpleConversations.length > 0 ? (
              filteredSimpleConversations.map((conversation) => {
                const contactName =
                  conversation.user1Email === currentUser?.email
                    ? conversation.user2Name
                    : conversation.user1Name;
                const contactEmail =
                  conversation.user1Email === currentUser?.email
                    ? conversation.user2Email
                    : conversation.user1Email;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      console.log("🖱️ Clicked on conversation:", conversation);
                      setSelectedSimpleConversation(conversation);
                      
                      // Mark messages as read when conversation is selected
                      if (conversation.unreadCount && conversation.unreadCount > 0) {
                        realtimeChatService.markMessagesAsRead(conversation.id);
                        console.log("📖 Marked messages as read for conversation:", conversation.id);
                      }
                    }}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedSimpleConversation?.id === conversation.id
                        ? "bg-violet-50/60 dark:bg-violet-900/30/20"
                        : conversation.unreadCount && conversation.unreadCount > 0
                        ? "bg-blue-50/30 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            contactName
                          )}&background=8b5cf6&color=fff`}
                          alt={contactName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {contactName}
                          </h3>
                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(
                                conversation.lastMessageTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {/* Unread message indicator - positioned under the time */}
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5 shadow-sm animate-pulse">
                                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start a new conversation by clicking the "New Chat" button
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header - Removed sticky positioning to work with main header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm flex-shrink-0 min-h-[80px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Inbox Toggle Button (when inbox is closed) */}
              {!isInboxOpen && (
                <button
                  onClick={toggleInbox}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Show Inbox"
                >
                  <PanelLeftClose className="w-5 h-5 rotate-180" />
                </button>
              )}
              {selectedSimpleConversation ? (
                <>
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedSimpleConversation.user1Email ===
                        currentUser?.email
                        ? selectedSimpleConversation.user2Name
                        : selectedSimpleConversation.user1Name
                    )}&background=8b5cf6&color=fff`}
                    alt={
                      selectedSimpleConversation.user1Email ===
                      currentUser?.email
                        ? selectedSimpleConversation.user2Name
                        : selectedSimpleConversation.user1Name
                    }
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedSimpleConversation.user1Email ===
                      currentUser?.email
                        ? selectedSimpleConversation.user2Name
                        : selectedSimpleConversation.user1Name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Online
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No conversation selected
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a contact to start chatting
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setUseOutlineBubble(!useOutlineBubble)}
                className={`p-2 rounded-lg transition-colors ${
                  useOutlineBubble
                    ? "bg-violet-300/40 text-white hover:bg-violet-200/30"
                    : "text-gray-500 dark:text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-dark-700"
                }`}
                title="Toggle Bubble Style"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </button>
              <button
                onClick={testCamera}
                disabled={isCameraLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isCameraLoading
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                    : "text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-dark-700"
                }`}
                title={isCameraLoading ? "Testing camera..." : "Test Camera"}
              >
                {isCameraLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={testMicrophone}
                disabled={isMicLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isMicLoading
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                    : "text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-dark-700"
                }`}
                title={
                  isMicLoading ? "Testing microphone..." : "Test Microphone"
                }
              >
                {isMicLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsVoiceCallOpen(true)}
                disabled={!selectedSimpleConversation}
                className={`p-2 rounded-lg transition-colors ${
                  selectedSimpleConversation
                    ? "text-gray-500 dark:text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-dark-700"
                    : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                }`}
                title={
                  selectedSimpleConversation
                    ? "Voice Call"
                    : "Select a conversation first"
                }
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsVideoCallOpen(true)}
                disabled={!selectedSimpleConversation}
                className={`p-2 rounded-lg transition-colors ${
                  selectedSimpleConversation
                    ? "text-gray-500 dark:text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-dark-700"
                    : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                }`}
                title={
                  selectedSimpleConversation
                    ? "Video Call"
                    : "Select a conversation first"
                }
              >
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {selectedSimpleConversation ? (
            <>
              {/* Debug info */}
              {console.log(
                "🔍 Debug - selectedSimpleConversation:",
                selectedSimpleConversation
              )}
              {console.log("🔍 Debug - simpleMessages:", simpleMessages)}
              {console.log(
                "🔍 Debug - simpleMessages.length:",
                simpleMessages.length
              )}

              {simpleMessages.length > 0 ? (
                simpleMessages.map((message, index) => {
                  const isCurrentUser =
                    message.senderEmail === currentUser?.email;
                  
                  // Render image messages
                  if (message.type === "image" && message.images) {
                    const senderName = isCurrentUser 
                      ? currentUser?.name || "You" 
                      : selectedSimpleConversation?.user1Email === currentUser?.email 
                        ? selectedSimpleConversation?.user2Name 
                        : selectedSimpleConversation?.user1Name || "Unknown";
                    
                    return (
                      <div
                        key={`simple-message-${message.id}-${index}`}
                        className="flex items-start gap-2.5"
                      >
                        {/* User Avatar */}
                        <img 
                          className="w-8 h-8 rounded-full" 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=6366f1&color=fff`}
                          alt={`${senderName} image`}
                        />
                        
                        {/* Message Content */}
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-col w-full max-w-[326px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                            {/* User Name and Time */}
                            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {senderName}
                              </span>
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            
                            {/* Message Text (if any) */}
                            {message.text && (
                              <p className="text-sm font-normal text-gray-900 dark:text-white mb-2">
                                {message.text}
                              </p>
                            )}
                            
                            {/* Image Display */}
                            {message.images.length === 1 ? (
                              <div className="group relative my-2.5">
                                <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                  <button 
                                    onClick={() => window.open(message.images?.[0]?.url || "", "_blank")}
                                    className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                                    title="Download image"
                                  >
                                    <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                                    </svg>
                                  </button>
                                </div>
                                <img 
                                  src={message.images?.[0]?.url || ""} 
                                  alt="Shared image"
                                  className="rounded-lg w-full cursor-pointer" 
                                  onClick={() => window.open(message.images?.[0]?.url || "", "_blank")}
                                />
                              </div>
                            ) : (
                              <div className="grid gap-2 grid-cols-2 my-2.5">
                                {message.images.slice(0, 4).map((image, imgIndex) => (
                                  <div key={imgIndex} className="group relative">
                                    <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                      <button 
                                        onClick={() => window.open(image.url, "_blank")}
                                        className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                                        title="Download image"
                                      >
                                        <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                                        </svg>
                                      </button>
                                    </div>
                                    <img 
                                      src={image.url} 
                                      alt="Shared image"
                                      className="rounded-lg w-full cursor-pointer" 
                                      onClick={() => window.open(image.url, "_blank")}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Message Status */}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                              Delivered
                            </span>
                          </div>
                        </div>
                        
                        {/* Message Actions Dropdown */}
                        <div className="relative">
                          <button 
                            id={`dropdownMenuIconButton-${message.id}`}
                            className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" 
                            type="button"
                            onClick={() => setOpenDropdownId(openDropdownId === index ? null : index)}
                          >
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openDropdownId === index && (
                            <div className="absolute right-0 top-full z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600">
                              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
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
                      </div>
                    );
                  }
                  
                  // Render file messages
                  if (message.type === "file") {
                    return (
                      <div
                        key={`simple-message-${message.id}-${index}`}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? "bg-violet-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-3 my-2">
                            <div className="flex-shrink-0">
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {message.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(message.fileSize || 0)}
                              </p>
                            </div>
                            <button
                              onClick={() => window.open(message.fileUrl, "_blank")}
                              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser
                                ? "text-violet-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Render text messages (default)
                  return (
                    <div
                      key={`simple-message-${message.id}-${index}`}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-violet-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUser
                              ? "text-violet-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start the conversation by sending a message
                  </p>
                </div>
              )}

              {/* Animated Typing Indicator */}
              {selectedSimpleConversation && (
                <TypingIndicator
                  userName={typingIndicator[selectedSimpleConversation.id] || ""}
                  isVisible={!!typingIndicator[selectedSimpleConversation.id]}
                />
              )}

              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Welcome to your inbox
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="sticky bottom-16 z-20 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700 dark:text-red-300">
                  Recording... {formatTime(recordingTime)}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={sendVoiceMessage}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={cancelRecording}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            {/* Left Side Buttons */}
            <div className="flex items-center space-x-2">
              {/* Voice Message Button */}
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Hold to record voice message"
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Attachment Button */}
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Attachment Menu */}
                {showAttachmentMenu && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                    <button
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Image className="w-4 h-4" />
                      <span>Photo</span>
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <File className="w-4 h-4" />
                      <span>File</span>
                    </button>
                  </div>
                )}
              </div>


              {/* GIF Button */}
              <button
                onClick={() => {
                  const gifUrl = prompt("Enter GIF URL:");
                  if (gifUrl) {
                    sendUrlPreview(
                      gifUrl,
                      "GIF",
                      "Click to view",
                      gifUrl
                    );
                  }
                }}
                className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Add GIF"
              >
                <span className="text-sm font-bold">GIF</span>
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                placeholder="Aa"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center space-x-2">

              {/* Send/Like Button */}
              <button
                onClick={handleSendMessage}
                className={`p-2 rounded-lg transition-colors ${
                  newMessage.trim()
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
                title={newMessage.trim() ? "Send message" : "Send like"}
              >
                {newMessage.trim() ? (
                  <Send className="w-5 h-5" />
                ) : (
                  <span className="text-lg">👍</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Video Call Modal */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        contactName={
          selectedSimpleConversation
            ? selectedSimpleConversation.user1Email === currentUser?.email
              ? selectedSimpleConversation.user2Name
              : selectedSimpleConversation.user1Name
            : "Unknown"
        }
      />

      {/* Voice Call Modal */}
      {isVoiceCallOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Voice Call
              </h3>
              <button
                onClick={() => setIsVoiceCallOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-violet-100/50 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Phone className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {selectedSimpleConversation
                  ? selectedSimpleConversation.user1Email === currentUser?.email
                    ? selectedSimpleConversation.user2Name
                    : selectedSimpleConversation.user1Name
                  : "Unknown"}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 animate-pulse">
                🔔 Calling...
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Ringtone is playing
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  // Toggle ringtone mute/unmute
                  if (voiceCallRingtoneIntervalRef.current) {
                    stopVoiceCallRingtone();
                  } else {
                    startVoiceCallRingtone();
                  }
                }}
                className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
                title="Mute/Unmute Ringtone"
              >
                {voiceCallRingtoneIntervalRef.current ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={() => setIsVoiceCallOpen(false)}
                className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                title="End Call"
              >
                <Phone className="w-6 h-6 rotate-180" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
              Voice call functionality is ready. In a real application, this
              would connect to a WebRTC audio call.
            </p>
          </div>
        </div>
      )}

      {/* Camera Test Modal */}
      {isCameraTestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Camera Test
              </h3>
              <button
                onClick={closeCameraTest}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              {isCameraLoading ? (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Requesting Camera Access
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Please allow camera access in your browser
                    </p>
                    <div className="bg-violet-50/60 dark:bg-violet-900/30/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-sm">
                      <p className="text-sm text-blue-800 dark:text-violet-200">
                        <strong>💡 Tip:</strong> If you don't see a permission
                        dialog, check your browser's address bar for a camera
                        icon and click "Allow".
                      </p>
                    </div>
                  </div>
                </div>
              ) : cameraStream ? (
                <video
                  ref={cameraTestRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading camera...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeCameraTest}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeCameraTest();
                  setIsVideoCallOpen(true);
                }}
                className="flex-1 px-4 py-2 bg-violet-300/40 hover:bg-violet-200/30 text-white rounded-lg transition-colors"
              >
                Start Video Call
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
              Your camera is working! You can now make video calls.
            </p>
          </div>
        </div>
      )}

      {/* Microphone Test Modal */}
      {isMicTestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Microphone Test
              </h3>
              <button
                onClick={closeMicTest}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isMicLoading ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Requesting Microphone Access
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Please allow microphone access in your browser
                  </p>
                  <div className="bg-violet-50/60 dark:bg-violet-900/30/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-violet-200">
                      <strong>💡 Tip:</strong> If you don't see a permission
                      dialog, check your browser's address bar for a microphone
                      icon and click "Allow".
                    </p>
                  </div>
                </div>
              ) : micStream ? (
                <div className="space-y-6">
                  {/* Microphone Status */}
                  <div className="text-center">
                    <div
                      className={`w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                        micLevel > 0
                          ? "scale-110 shadow-lg shadow-green-500/30"
                          : "scale-100"
                      }`}
                    >
                      <Mic
                        className={`w-12 h-12 text-green-600 dark:text-green-400 transition-all duration-200 ${
                          micLevel > 0 ? "animate-pulse" : ""
                        }`}
                      />
                    </div>
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Microphone Active
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Speak into your microphone to test the audio level
                    </p>
                  </div>

                  {/* Microphone Settings Card */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                    {/* Microphone Icon and Mute Button */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={toggleMicrophoneMute}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            isMicMuted
                              ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                              : "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          }`}
                          title={
                            isMicMuted ? "Unmute Microphone" : "Mute Microphone"
                          }
                        >
                          {isMicMuted ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                              />
                            </svg>
                          ) : (
                            <Mic className="w-6 h-6" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {isMicMuted
                              ? "Microphone Muted"
                              : "Microphone Active"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(micLevel)}% input level
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Animated Audio Level Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-150 ease-out ${
                            micLevel > 70
                              ? "bg-red-500 animate-pulse"
                              : micLevel > 40
                              ? "bg-yellow-500"
                              : micLevel > 10
                              ? "bg-green-500"
                              : "bg-violet-300/40"
                          }`}
                          style={{
                            width: `${Math.min(micLevel * 1.5, 100)}%`,
                            transition:
                              "width 0.15s ease-out, background-color 0.3s ease-out",
                            boxShadow:
                              micLevel > 0
                                ? `0 0 6px ${
                                    micLevel > 70
                                      ? "rgba(239, 68, 68, 0.4)"
                                      : micLevel > 40
                                      ? "rgba(245, 158, 11, 0.4)"
                                      : micLevel > 10
                                      ? "rgba(34, 197, 94, 0.4)"
                                      : "rgba(37, 99, 235, 0.4)"
                                  }`
                                : "none",
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <span>Silent</span>
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                    </div>

                    {/* Microphone Selection Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Microphone
                      </label>
                      <select
                        value={selectedMicrophone}
                        onChange={(e) => switchMicrophone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        {availableMicrophones.map((mic) => (
                          <option key={mic.deviceId} value={mic.deviceId}>
                            {mic.label ||
                              `Microphone ${mic.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                      Test Recording & Playback
                    </h5>
                    <div className="flex items-center justify-center space-x-6 mb-4">
                      {!isMicTestRecording ? (
                        <button
                          onClick={startMicTestRecording}
                          className="flex flex-col items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg group"
                          title="Start Recording"
                        >
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                          </svg>
                          <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Record
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={stopMicTestRecording}
                          className="flex flex-col items-center justify-center w-16 h-16 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors shadow-lg animate-pulse group"
                          title="Stop Recording"
                        >
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 6h12v12H6z" />
                          </svg>
                          <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Stop
                          </span>
                        </button>
                      )}

                      {micTestRecordedAudioUrl && (
                        <button
                          onClick={playRecordedAudio}
                          className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-colors shadow-lg group ${
                            isMicTestPlaying
                              ? "bg-violet-300/40 hover:bg-violet-200/30 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                          title={
                            isMicTestPlaying
                              ? "Stop Playback"
                              : "Play Recording"
                          }
                        >
                          {isMicTestPlaying ? (
                            <svg
                              className="w-8 h-8"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-8 h-8"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                          <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isMicTestPlaying ? "Stop" : "Play"}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Recording Status */}
                    {isMicTestRecording && (
                      <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            Recording:{" "}
                            {formatRecordingTime(micTestRecordingTime)}
                          </span>
                        </div>
                        <p className="text-xs text-red-500 dark:text-red-400">
                          Click the stop button to finish recording
                        </p>
                      </div>
                    )}

                    {micTestRecordedAudioUrl && !isMicTestRecording && (
                      <div className="text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                          ✅ Recording saved! Click play to hear your voice
                        </p>
                        <p className="text-xs text-green-500 dark:text-green-400">
                          Test your microphone quality through headphones
                        </p>
                      </div>
                    )}

                    {!micTestRecordedAudioUrl &&
                      !isMicTestRecording &&
                      micStream && (
                        <div className="text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            💡 Click the record button to test your microphone
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            You can also use real-time monitoring to hear your
                            voice live
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading microphone...
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={closeMicTest}
                  className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeMicTest();
                    setIsVoiceCallOpen(true);
                  }}
                  className="flex-1 px-4 py-3 bg-violet-300/40 hover:bg-violet-200/30 text-white rounded-lg transition-colors font-medium"
                >
                  Start Voice Call
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Your microphone is working! You can now make voice calls and
                record voice messages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={closeEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />

      {/* User Selection Modal */}
      {isUserSelectionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-violet-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Select User to Chat With
                </h3>
                <button
                  onClick={() => setIsUserSelectionOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading users from MongoDB...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startChatWithUser(user)}
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                        {user.nickname && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            @{user.nickname}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 px-2 py-1 rounded">
                            {user.department}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {user.role}
                          </span>
                          {user.branch && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {user.branch}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsUserSelectionOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApplication;
