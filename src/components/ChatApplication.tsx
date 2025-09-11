import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
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
  X
} from 'lucide-react';
import VideoCall from './VideoCall';

// Type definitions
interface BaseMessage {
  id: number;
  text: string;
  sender: 'agent' | 'customer';
  timestamp: string;
  isRead: boolean;
}

interface VoiceMessage extends BaseMessage {
  type: 'voice';
  duration: number;
  audioUrl?: string;
}

interface FileMessage extends BaseMessage {
  type: 'file';
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

interface ImageMessage extends BaseMessage {
  type: 'image';
  images: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

interface UrlMessage extends BaseMessage {
  type: 'url';
  url: string;
  title: string;
  description: string;
  image: string;
}

type Message = BaseMessage | VoiceMessage | FileMessage | ImageMessage | UrlMessage;

// Mock data for chat contacts
const mockContacts = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
    status: "Online",
    lastMessage: "Thanks for the help!",
    timestamp: "2 min ago",
    unreadCount: 2
  },
  {
    id: 2,
    name: "Sarah Wilson",
    avatar: "https://flowbite.com/docs/images/people/profile-picture-2.jpg",
    status: "Away",
    lastMessage: "Can you check my ticket?",
    timestamp: "1 hour ago",
    unreadCount: 0
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
    status: "Offline",
    lastMessage: "Issue resolved!",
    timestamp: "3 hours ago",
    unreadCount: 0
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "https://flowbite.com/docs/images/people/profile-picture-4.jpg",
    status: "Online",
    lastMessage: "Need assistance with login",
    timestamp: "5 min ago",
    unreadCount: 1
  }
];

// Mock messages data
const mockMessages: { [key: number]: Message[] } = {
  1: [
    { id: 1, text: "Hello! How can I help you today?", sender: "agent", timestamp: "10:30 AM", isRead: true },
    { id: 2, text: "I'm having trouble with my account login", sender: "customer", timestamp: "10:32 AM", isRead: true },
    { id: 3, text: "Let me help you with that. Can you try resetting your password?", sender: "agent", timestamp: "10:33 AM", isRead: true },
    { id: 4, text: "", sender: "customer", timestamp: "10:35 AM", isRead: false, type: "voice", duration: 15 },
    { 
      id: 5, 
      text: "", 
      sender: "customer", 
      timestamp: "10:40 AM", 
      isRead: true, 
      type: "url", 
      url: "https://github.com/themesberg/flowbite", 
      title: "GitHub - themesberg/flowbite: The most popular and open source library of interactive UI components built with Tailwind CSS", 
      description: "Check out this open-source UI component library based on Tailwind CSS:", 
      image: "https://flowbite.com/docs/images/og-image.png" 
    },
  ],
  2: [
    { id: 1, text: "Hi Sarah, how can I assist you?", sender: "agent", timestamp: "9:15 AM", isRead: true },
    { id: 2, text: "Can you check my ticket #12345?", sender: "customer", timestamp: "9:16 AM", isRead: true },
    { 
      id: 3, 
      text: "", 
      sender: "agent", 
      timestamp: "9:20 AM", 
      isRead: true, 
      type: "url", 
      url: "https://tailwindcss.com", 
      title: "Tailwind CSS - Rapidly build modern websites without ever leaving your HTML", 
      description: "Here's a great resource for styling:", 
      image: "https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg" 
    },
  ],
  3: [
    { id: 1, text: "Good morning Mike!", sender: "agent", timestamp: "8:00 AM", isRead: true },
    { id: 2, text: "The issue is resolved now, thank you!", sender: "customer", timestamp: "8:05 AM", isRead: true },
  ],
  4: [
    { id: 1, text: "Hi Emily, I see you need help with login", sender: "agent", timestamp: "2:00 PM", isRead: true },
    { id: 2, text: "Yes, I can't access my account", sender: "customer", timestamp: "2:01 PM", isRead: false },
  ]
};

const ChatApplication: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [messages, setMessages] = useState<Message[]>((mockMessages as any)[selectedContact.id] || []);
  const [newMessage, setNewMessage] = useState('');
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
  const [micTestRecordedAudio, setMicTestRecordedAudio] = useState<Blob | null>(null);
  const [micTestRecordedAudioUrl, setMicTestRecordedAudioUrl] = useState<string | null>(null);
  const [isMicTestPlaying, setIsMicTestPlaying] = useState(false);
  const [micTestRecordingTime, setMicTestRecordingTime] = useState(0);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages when contact changes
  useEffect(() => {
    setMessages((mockMessages as any)[selectedContact.id] || []);
  }, [selectedContact]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  // Cleanup audio URLs and camera stream
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
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
    };
  }, [audioUrl, previewUrls, cameraStream, micStream]);

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

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageAction = (messageId: number, action: string) => {
    console.log(`Action: ${action} on message ${messageId}`);
    setOpenDropdownId(null);
  };

  // Voice message functions
  const startRecording = async () => {
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        alert('Voice recording requires HTTPS or localhost');
        return;
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support voice recording');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Error recording audio. Please try again.');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      recordingIntervalRef.current = interval;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError') {
          alert('Microphone is being used by another application. Please close other applications and try again.');
        } else {
          alert('Error accessing microphone: ' + error.message);
        }
      } else {
        alert('Error accessing microphone. Please try again.');
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
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        type: 'voice',
        duration: recordingTime,
        audioUrl: audioUrl || undefined
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
      Object.keys(audioRefs.current).forEach(id => {
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
      audio.preload = 'auto';
      
      // Add event listeners
      audio.onloadstart = () => {
        console.log('Audio loading started');
      };
      
      audio.oncanplay = () => {
        console.log('Audio can start playing');
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        alert('Error playing voice message. The audio file may be corrupted.');
        setPlayingAudioId(null);
      };
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setPlayingAudioId(null);
      };
      
      audio.onpause = () => {
        console.log('Audio playback paused');
        setPlayingAudioId(null);
      };
      
      // Play the audio
      audio.play().then(() => {
        console.log('Audio playback started');
        setPlayingAudioId(messageId);
      }).catch(error => {
        console.error('Error playing audio:', error);
        if (error.name === 'NotAllowedError') {
          alert('Audio playback blocked by browser. Please allow audio playback and try again.');
        } else if (error.name === 'NotSupportedError') {
          alert('Audio format not supported by your browser.');
        } else {
          alert('Error playing voice message: ' + error.message);
        }
        setPlayingAudioId(null);
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice call ringtone functions
  const createVoiceCallRingtone = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Create a phone ringtone pattern
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.start();
      oscillator2.start();
      oscillator1.stop(audioContext.currentTime + 0.4);
      oscillator2.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error('Error creating ringtone:', error);
    }
  };

  const startVoiceCallRingtone = () => {
    const playRingtone = () => {
      createVoiceCallRingtone();
    };

    // Play ringtone immediately
    playRingtone();
    
    // Set interval to repeat every 2 seconds
    voiceCallRingtoneIntervalRef.current = window.setInterval(playRingtone, 2000);
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

  const sendFileMessage = (files: File[]) => {
    files.forEach(file => {
      const fileMessage: FileMessage = {
        id: messages.length + 1,
        text: "",
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file)
      };
      setMessages(prev => [...prev, fileMessage]);
    });
  };

  const sendImageMessage = (files: File[]) => {
    const images = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size
    }));

    const imageMessage: ImageMessage = {
      id: messages.length + 1,
      text: "",
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'image',
      images: images
    };
    setMessages(prev => [...prev, imageMessage]);
  };

  const sendUrlPreview = (url: string, title: string, description: string, image: string) => {
    const urlMessage: UrlMessage = {
      id: messages.length + 1,
      text: "",
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'url',
      url: url,
      title: title,
      description: description,
      image: image
    };
    setMessages(prev => [...prev, urlMessage]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Camera test functions
  const testCamera = async () => {
    console.log('Testing camera...');
    setIsCameraLoading(true);
    
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        alert('🔒 Camera test requires HTTPS or localhost for security reasons.\n\nPlease access this application through HTTPS or localhost to test your camera.');
        setIsCameraLoading(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('❌ Your browser does not support camera access.\n\nPlease use a modern browser like Chrome, Firefox, Safari, or Edge to test your camera.');
        setIsCameraLoading(false);
        return;
      }

      // Show permission request notification
      const permissionGranted = confirm(
        '📷 Camera Permission Required\n\n' +
        'This application needs access to your camera to test video input.\n\n' +
        'Click "OK" to allow camera access, then click "Allow" in the browser permission dialog.\n\n' +
        'If you accidentally deny permission, you can:\n' +
        '• Click the lock icon in your browser\'s address bar\n' +
        '• Select "Allow" for camera access\n' +
        '• Refresh the page and try again'
      );

      if (!permissionGranted) {
        setIsCameraLoading(false);
        return;
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('Camera access granted, setting up stream...');
      setCameraStream(stream);
      setIsCameraTestOpen(true);
      setIsCameraLoading(false);

      // Wait for the modal to render before setting the video source
      setTimeout(() => {
        if (cameraTestRef.current) {
          console.log('Setting video source...');
          cameraTestRef.current.srcObject = stream;
          cameraTestRef.current.play().catch(e => {
            console.error('Error playing video:', e);
          });
        }
      }, 100);

    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraLoading(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert(
            '🚫 Camera Access Denied\n\n' +
            'You have denied camera access. To enable it:\n\n' +
            '1. Click the lock icon (🔒) in your browser\'s address bar\n' +
            '2. Find "Camera" in the permissions list\n' +
            '3. Change it from "Block" to "Allow"\n' +
            '4. Refresh the page and try again\n\n' +
            'Alternatively, you can:\n' +
            '• Go to your browser settings\n' +
            '• Find "Site permissions" or "Privacy"\n' +
            '• Allow camera access for this site'
          );
        } else if (error.name === 'NotFoundError') {
          alert(
            '📷 No Camera Found\n\n' +
            'No camera device was detected on your computer.\n\n' +
            'Please check:\n' +
            '• Is your camera connected?\n' +
            '• Is it properly plugged in?\n' +
            '• Is it enabled in your system settings?\n' +
            '• Try using a different camera'
          );
        } else if (error.name === 'NotReadableError') {
          alert(
            '⚠️ Camera Busy\n\n' +
            'Your camera is being used by another application.\n\n' +
            'Please:\n' +
            '• Close other applications using the camera\n' +
            '• Check if another browser tab is using the camera\n' +
            '• Restart your browser if the problem persists'
          );
        } else if (error.name === 'OverconstrainedError') {
          alert('⚠️ Camera Settings Not Supported\n\nTrying with default settings...');
          // Try with basic constraints
          try {
            console.log('Trying fallback camera settings...');
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(basicStream);
            setIsCameraTestOpen(true);
            setTimeout(() => {
              if (cameraTestRef.current) {
                cameraTestRef.current.srcObject = basicStream;
                cameraTestRef.current.play();
              }
            }, 100);
            console.log('Fallback camera settings successful');
          } catch (basicError) {
            alert('❌ Unable to access camera with any settings.\n\nPlease check your camera connection and try again.');
          }
        } else {
          alert('❌ Error accessing camera: ' + error.message + '\n\nPlease try again or contact support if the problem persists.');
        }
      } else {
        alert('❌ Unknown error occurred while accessing the camera.\n\nPlease try again or contact support if the problem persists.');
      }
    }
  };

  const closeCameraTest = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraTestOpen(false);
  };

  // Mic test functions
  const testMicrophone = async () => {
    try {
      setIsMicLoading(true);
      
      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        alert('🔒 Microphone test requires HTTPS or localhost for security reasons.\n\nPlease access this application through HTTPS or localhost to test your microphone.');
        setIsMicLoading(false);
        return;
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('❌ Your browser does not support microphone access.\n\nPlease use a modern browser like Chrome, Firefox, Safari, or Edge to test your microphone.');
        setIsMicLoading(false);
        return;
      }

      // Show permission request notification
      const permissionGranted = confirm(
        '🎤 Microphone Permission Required\n\n' +
        'This application needs access to your microphone to test audio input.\n\n' +
        'Click "OK" to allow microphone access, then click "Allow" in the browser permission dialog.\n\n' +
        'If you accidentally deny permission, you can:\n' +
        '• Click the lock icon in your browser\'s address bar\n' +
        '• Select "Allow" for microphone access\n' +
        '• Refresh the page and try again'
      );

      if (!permissionGranted) {
        setIsMicLoading(false);
        return;
      }

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('Microphone access granted, setting up audio monitoring...');
      setMicStream(stream);
      setIsMicTestOpen(true);
      setIsMicLoading(false);

      // Set up audio context for mic level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);
      analyser.fftSize = 256;

      // Monitor mic level
      const updateMicLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(average);
        micLevelIntervalRef.current = requestAnimationFrame(updateMicLevel);
      };
      updateMicLevel();

      console.log('Microphone test setup complete');

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsMicLoading(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert(
            '🚫 Microphone Access Denied\n\n' +
            'You have denied microphone access. To enable it:\n\n' +
            '1. Click the lock icon (🔒) in your browser\'s address bar\n' +
            '2. Find "Microphone" in the permissions list\n' +
            '3. Change it from "Block" to "Allow"\n' +
            '4. Refresh the page and try again\n\n' +
            'Alternatively, you can:\n' +
            '• Go to your browser settings\n' +
            '• Find "Site permissions" or "Privacy"\n' +
            '• Allow microphone access for this site'
          );
        } else if (error.name === 'NotFoundError') {
          alert(
            '🎤 No Microphone Found\n\n' +
            'No microphone device was detected on your computer.\n\n' +
            'Please check:\n' +
            '• Is your microphone connected?\n' +
            '• Is it properly plugged in?\n' +
            '• Is it enabled in your system settings?\n' +
            '• Try using a different microphone'
          );
        } else if (error.name === 'NotReadableError') {
          alert(
            '⚠️ Microphone Busy\n\n' +
            'Your microphone is being used by another application.\n\n' +
            'Please:\n' +
            '• Close other applications using the microphone\n' +
            '• Check if another browser tab is using the microphone\n' +
            '• Restart your browser if the problem persists'
          );
        } else {
          alert('❌ Error accessing microphone: ' + error.message + '\n\nPlease try again or contact support if the problem persists.');
        }
      } else {
        alert('❌ Unknown error occurred while accessing microphone.\n\nPlease try again or contact support if the problem persists.');
      }
    }
  };

  const closeMicTest = () => {
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
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
    if (!micStream) return;

    try {
      const mediaRecorder = new MediaRecorder(micStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      micTestMediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setMicTestRecordedAudio(blob);
        setMicTestRecordedAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Error recording audio. Please try again.');
        setIsMicTestRecording(false);
      };

      mediaRecorder.start(100);
      setIsMicTestRecording(true);
      setMicTestRecordingTime(0);

      const interval = setInterval(() => {
        setMicTestRecordingTime(prev => prev + 1);
      }, 1000);
      micTestRecordingIntervalRef.current = interval;

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error starting recording. Please try again.');
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
      audio.preload = 'auto';

      audio.onended = () => {
        setIsMicTestPlaying(false);
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        alert('Error playing recorded audio. Please try again.');
        setIsMicTestPlaying(false);
      };

      audio.play().then(() => {
        setIsMicTestPlaying(true);
      }).catch(error => {
        console.error('Error playing audio:', error);
        alert('Error playing recorded audio: ' + error.message);
        setIsMicTestPlaying(false);
      });
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Type guards
  const isVoiceMessage = (message: Message): message is VoiceMessage => {
    return 'type' in message && message.type === 'voice';
  };

  const isFileMessage = (message: Message): message is FileMessage => {
    return 'type' in message && message.type === 'file';
  };

  const isImageMessage = (message: Message): message is ImageMessage => {
    return 'type' in message && message.type === 'image';
  };

  const isUrlMessage = (message: Message): message is UrlMessage => {
    return 'type' in message && message.type === 'url';
  };

  const renderMessage = (message: Message) => {
    const isAgent = message.sender === 'agent';
    
    return (
      <div
        key={message.id}
        className={`flex items-start gap-2.5 ${isAgent ? 'justify-end' : 'justify-start'}`}
      >
        {/* Avatar for customer messages */}
        {!isAgent && (
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
                {selectedContact.name}
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
              {isAgent 
                ? (message.isRead ? 'Read' : 'Delivered')
                : 'Sent'
              }
            </span>
          </div>
        ) : (
          <div
            className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 rounded-xl ${
              isAgent
                ? 'bg-blue-500 text-white rounded-e-xl rounded-es-xl'
                : 'border-gray-200 bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
            }`}
          >
            {/* Message header */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className={`text-sm font-semibold ${
                isAgent 
                  ? 'text-white' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {isAgent ? 'You' : selectedContact.name}
              </span>
              <span className={`text-sm font-normal ${
                isAgent 
                  ? 'text-blue-100' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {message.timestamp}
              </span>
            </div>

            {/* Message content based on type */}
            {isVoiceMessage(message) ? (
              <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                isAgent 
                  ? 'bg-blue-600' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => message.audioUrl && playAudio(message.id, message.audioUrl)}
                    className={`inline-flex self-center items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 ${
                      isAgent
                        ? 'text-white bg-blue-500 hover:bg-blue-400'
                        : 'text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                    type="button"
                  >
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 12 16">
                      <path d="M3 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm7 0H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z"/>
                    </svg>
                  </button>
                  <svg className="w-[145px] md:w-[185px] md:h-[40px]" aria-hidden="true" viewBox="0 0 185 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <span className={`inline-flex self-center items-center p-2 text-sm font-medium ${
                    isAgent ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatTime(message.duration)}
                  </span>
                </div>
              </div>
            ) : isFileMessage(message) ? (
              <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                isAgent 
                  ? 'bg-blue-600' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <div className="flex items-start bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
                  <div className="me-2">
                    <span className={`flex items-center gap-2 text-sm font-medium pb-2 ${
                      isAgent ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      <svg fill="none" aria-hidden="true" className="w-5 h-5 shrink-0" viewBox="0 0 20 21">
                        <g clipPath="url(#clip0_3173_1381)">
                          <path fill="#E2E5E7" d="M5.024.5c-.688 0-1.25.563-1.25 1.25v17.5c0 .688.562 1.25 1.25 1.25h12.5c.687 0 1.25-.563 1.25-1.25V5.5l-5-5h-8.75z"/>
                          <path fill="#B0B7BD" d="M15.024 5.5h3.75l-5-5v3.75c0 .688.562 1.25 1.25 1.25z"/>
                          <path fill="#CAD1D8" d="M18.774 9.25l-3.75-3.75h3.75v3.75z"/>
                          <path fill="#F15642" d="M16.274 16.75a.627.627 0 01-.625.625H1.899a.627.627 0 01-.625-.625V10.5c0-.344.281-.625.625-.625h13.75c.344 0 .625.281.625.625v6.25z"/>
                          <path fill="#fff" d="M3.998 12.342c0-.165.13-.345.34-.345h1.154c.65 0 1.235.435 1.235 1.269 0 .79-.585 1.23-1.235 1.23h-.834v.66c0 .22-.14.344-.32.344a.337.337 0 01-.34-.344v-2.814zm.66.284v1.245h.834c.335 0 .6-.295.6-.605 0-.35-.265-.64-.6-.64h-.834zM7.706 15.5c-.165 0-.345-.09-.345-.31v-2.838c0-.18.18-.31.345-.31H8.85c2.284 0 2.234 3.458.045 3.458h-1.19zm.315-2.848v2.239h.83c1.349 0 1.409-2.24 0-2.24h-.83zM11.894 13.486h1.274c.18 0 .36.18.36.355 0 .165-.18.3-.36.3h-1.274v1.049c0 .175-.124.31-.3.31-.22 0-.354-.135-.354-.31v-2.839c0-.18.135-.31.355-.31h1.754c.22 0 .35.13.35.31 0 .16-.13.34-.35.34h-1.455v.795z"/>
                          <path fill="#CAD1D8" d="M15.649 17.375H3.774V18h11.875a.627.627 0 00.625-.625v-.625a.627.627 0 01-.625.625z"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_3173_1381">
                            <path fill="#fff" d="M0 0h20v20H0z" transform="translate(0 .5)"/>
                          </clipPath>
                        </defs>
                      </svg>
                      {message.fileName}
                    </span>
                    <span className={`flex text-xs font-normal gap-2 ${
                      isAgent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {Math.ceil(message.fileSize / 1024 / 1024 * 12)} Pages 
                      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
                        <circle cx="1.5" cy="2" r="1.5" fill="#6B7280"/>
                      </svg>
                      {formatFileSize(message.fileSize)} 
                      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
                        <circle cx="1.5" cy="2" r="1.5" fill="#6B7280"/>
                      </svg>
                      {message.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                  <div className="inline-flex self-center items-center">
                    <button
                      onClick={() => window.open(message.fileUrl, '_blank')}
                      className={`inline-flex self-center items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 ${
                        isAgent
                          ? 'text-white bg-blue-500 hover:bg-blue-400'
                          : 'text-gray-900 bg-gray-50 hover:bg-gray-100 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500'
                      }`}
                      type="button"
                    >
                      <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                        <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : isImageMessage(message) ? (
              <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                isAgent 
                  ? 'bg-blue-600' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {message.text && (
                  <p className={`text-sm font-normal mb-2 ${
                    isAgent ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {message.text}
                  </p>
                )}
                {message.images.length === 1 ? (
                  <div className="group relative my-2.5">
                    <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => window.open(message.images[0].url, '_blank')}
                        className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                        data-tooltip-target="download-image"
                      >
                        <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                        </svg>
                      </button>
                      <div id="download-image" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                        Download image
                        <div className="tooltip-arrow" data-popper-arrow></div>
                      </div>
                    </div>
                    <img 
                      src={message.images[0].url} 
                      alt="Shared image" 
                      className="rounded-lg w-full max-w-sm cursor-pointer"
                      onClick={() => window.open(message.images[0].url, '_blank')}
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 my-2.5">
                    {message.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="group relative">
                        {index === 3 && message.images.length > 4 ? (
                          <button 
                            className="absolute w-full h-full bg-gray-900/90 hover:bg-gray-900/50 transition-all duration-300 rounded-lg flex items-center justify-center"
                            onClick={() => {
                              // Handle view all images
                              message.images.forEach(img => window.open(img.url, '_blank'));
                            }}
                          >
                            <span className="text-xl font-medium text-white">+{message.images.length - 3}</span>
                            <div id="download-image" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                              Download image
                              <div className="tooltip-arrow" data-popper-arrow></div>
                            </div>
                          </button>
                        ) : (
                          <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => window.open(image.url, '_blank')}
                              className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                              data-tooltip-target={`download-image-${index + 1}`}
                            >
                              <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                              </svg>
                            </button>
                            <div id={`download-image-${index + 1}`} role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                              Download image
                              <div className="tooltip-arrow" data-popper-arrow></div>
                            </div>
                          </div>
                        )}
                        <img
                          src={image.url}
                          alt={image.name}
                          className="rounded-lg w-full h-24 object-cover cursor-pointer"
                          onClick={() => window.open(image.url, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {message.images.length > 1 && (
                  <div className="flex justify-end items-center">
                    <button 
                      className={`text-sm font-medium inline-flex items-center hover:underline ${
                        isAgent ? 'text-blue-200 hover:text-blue-100' : 'text-blue-700 dark:text-blue-500'
                      }`}
                      onClick={() => {
                        // Handle save all images
                        message.images.forEach(img => {
                          const link = document.createElement('a');
                          link.href = img.url;
                          link.download = img.name;
                          link.click();
                        });
                      }}
                    >
                      <svg className="w-3 h-3 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                      </svg>
                      Save all
                    </button>
                  </div>
                )}
              </div>
            ) : isUrlMessage(message) ? (
              <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                isAgent 
                  ? 'bg-blue-600' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <p className={`text-sm font-normal py-2.5 ${
                  isAgent ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {message.description || 'Check out this link:'}
                </p>
                <p className={`text-sm font-normal pb-2.5 ${
                  isAgent ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  <a 
                    href={message.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline hover:no-underline font-medium break-all ${
                      isAgent ? 'text-blue-200 hover:text-blue-100' : 'text-blue-700 dark:text-blue-500'
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
                    isAgent ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'bg-gray-50 dark:bg-gray-600'
                  }`}
                >
                  <img 
                    src={message.image} 
                    alt={message.title}
                    className="rounded-lg mb-2 w-full h-32 object-cover" 
                  />
                  <span className={`text-sm font-medium block mb-2 ${
                    isAgent ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {message.title}
                  </span>
                  <span className={`text-xs font-normal ${
                    isAgent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new URL(message.url).hostname}
                  </span>
                </a>
              </div>
            ) : (
              <div className={`flex flex-col leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                isAgent 
                  ? 'bg-blue-600' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <p className={`text-sm font-normal ${
                  isAgent ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Message status */}
            <span className={`text-sm font-normal ${
              isAgent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {isAgent 
                ? (message.isRead ? 'Read' : 'Delivered')
                : 'Sent'
              }
            </span>
          </div>
        )}

        {/* Three dots menu for message actions */}
        <button
          onClick={() => setOpenDropdownId(openDropdownId === message.id ? null : message.id)}
          className={`inline-flex self-center items-center p-2 text-sm font-medium text-center rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:focus:ring-gray-600 ${
            isAgent
              ? 'text-white bg-blue-500 hover:bg-blue-600'
              : 'text-gray-900 bg-white dark:text-white dark:bg-gray-900 dark:hover:bg-gray-800'
          }`}
        >
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
          </svg>
        </button>

        {/* Dropdown menu */}
        {openDropdownId === message.id && (
          <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button
                  onClick={() => handleMessageAction(message.id, 'reply')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Reply
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMessageAction(message.id, 'forward')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Forward
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMessageAction(message.id, 'copy')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Copy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMessageAction(message.id, 'report')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Report
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMessageAction(message.id, 'delete')}
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
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inbox</h2>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {mockContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedContact.id === contact.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                    contact.status === 'Online' ? 'bg-green-500' : 
                    contact.status === 'Away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {contact.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.unreadCount > 0 && (
                  <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {contact.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={selectedContact.avatar}
                alt={selectedContact.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedContact.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedContact.status}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setUseOutlineBubble(!useOutlineBubble)}
                className={`p-2 rounded-lg transition-colors ${
                  useOutlineBubble
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
                title="Toggle Bubble Style"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>
              <button 
                onClick={testCamera}
                disabled={isCameraLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isCameraLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
                title={isCameraLoading ? "Testing camera..." : "Test Camera"}
              >
                {isCameraLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              <button 
                onClick={testMicrophone}
                disabled={isMicLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isMicLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
                title={isMicLoading ? "Testing microphone..." : "Test Microphone"}
              >
                {isMicLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={() => setIsVoiceCallOpen(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                title="Voice Call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsVideoCallOpen(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                title="Video Call"
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
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
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Attachment Button */}
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                {showAttachmentMenu && (
                  <div className="absolute bottom-12 left-0 bg-white dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 rounded flex items-center"
                    >
                      <File className="w-4 h-4 mr-2" />
                      File
                    </button>
                    <button 
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 rounded flex items-center"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Photo
                    </button>
                    <button 
                      onClick={() => {
                        const url = prompt('Enter URL to share:');
                        if (url) {
                          sendUrlPreview(url, 'Link Preview', 'Click to view', 'https://flowbite.com/docs/images/og-image.png');
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 rounded flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Link
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Message Button */}
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                title="Hold to record voice message"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                className={`p-2 rounded-lg transition-colors ${
                  newMessage.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400'
                }`}
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
        contactName={selectedContact.name}
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
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Phone className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {selectedContact.name}
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
              Voice call functionality is ready. In a real application, this would connect to a WebRTC audio call.
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-sm">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>💡 Tip:</strong> If you don't see a permission dialog, check your browser's address bar for a camera icon and click "Allow".
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
                    <p className="text-gray-500 dark:text-gray-400">Loading camera...</p>
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
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Microphone Test
              </h3>
              <button
                onClick={closeMicTest}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              {isMicLoading ? (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Requesting Microphone Access
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Please allow microphone access in your browser
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-sm">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>💡 Tip:</strong> If you don't see a permission dialog, check your browser's address bar for a microphone icon and click "Allow".
                      </p>
                    </div>
                  </div>
                </div>
              ) : micStream ? (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                      micLevel > 0 ? 'scale-110 shadow-lg shadow-green-500/30' : 'scale-100'
                    }`}>
                      <Mic className={`w-10 h-10 text-green-600 dark:text-green-400 transition-all duration-200 ${
                        micLevel > 0 ? 'animate-pulse' : ''
                      }`} />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Microphone Active
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Speak into your microphone to test the audio level
                    </p>
                  </div>
                  
                  {/* Audio Level Indicator */}
                  <div className="w-full max-w-xs mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Audio Level</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(micLevel)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden shadow-inner">
                      <div 
                        className={`text-xs font-medium text-center p-0.5 leading-none rounded-full transition-all duration-300 ease-out transform shadow-sm ${
                          micLevel > 50 ? 'bg-red-500 text-red-100 animate-pulse shadow-red-500/50' : 
                          micLevel > 25 ? 'bg-yellow-500 text-yellow-100 shadow-yellow-500/50' : 'bg-blue-600 text-blue-100 shadow-blue-500/50'
                        } ${micLevel > 0 ? 'scale-105' : 'scale-100'}`}
                        style={{ 
                          width: `${Math.min(micLevel * 2, 100)}%`,
                          transition: 'width 0.3s ease-out, background-color 0.3s ease-out, transform 0.2s ease-out, box-shadow 0.3s ease-out',
                          boxShadow: micLevel > 0 ? `0 0 8px ${micLevel > 50 ? 'rgba(239, 68, 68, 0.5)' : micLevel > 25 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(37, 99, 235, 0.5)'}` : 'none'
                        }}
                      >
                        {Math.round(micLevel)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="w-full max-w-xs">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      {!isMicTestRecording ? (
                        <button
                          onClick={startMicTestRecording}
                          className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                          title="Start Recording"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={stopMicTestRecording}
                          className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors shadow-lg animate-pulse"
                          title="Stop Recording"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z"/>
                          </svg>
                        </button>
                      )}
                      
                      {micTestRecordedAudioUrl && (
                        <button
                          onClick={playRecordedAudio}
                          className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors shadow-lg ${
                            isMicTestPlaying 
                              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          title={isMicTestPlaying ? "Stop Playback" : "Play Recording"}
                        >
                          {isMicTestPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Recording Status */}
                    {isMicTestRecording && (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            Recording: {formatRecordingTime(micTestRecordingTime)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Click the stop button to finish recording
                        </p>
                      </div>
                    )}

                    {micTestRecordedAudioUrl && !isMicTestRecording && (
                      <div className="text-center">
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                          ✅ Recording saved! Click play to hear your voice
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          You can now test your microphone quality through headphones
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading microphone...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeMicTest}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeMicTest();
                  setIsVoiceCallOpen(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Start Voice Call
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
              Your microphone is working! You can now make voice calls and record voice messages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApplication;
