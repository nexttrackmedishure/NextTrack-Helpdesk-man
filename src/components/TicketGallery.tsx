import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  Pause,
  AlertTriangle,
  X,
  Minus,
  Eye,
  ChevronRight,
  Edit,
  Bookmark,
  MoreVertical,
  Link,
  Flag,
  Sprout,
  Save,
  Smile,
  RotateCcw,
} from "lucide-react";
import ReactApexChart from "react-apexcharts";

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

const TicketGallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus] = useState("all");
  const [selectedPriority] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Form state for new request
  const [newRequestForm, setNewRequestForm] = useState({
    ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    requestor: "",
    department: "",
    ticketTitle: "",
    category: "",
    severity: "",
    description: "",
  });

  // State for custom category input
  const [customCategory, setCustomCategory] = useState("");

  // State for requestor dropdown
  const [isRequestorDropdownOpen, setIsRequestorDropdownOpen] = useState(false);
  const [requestorSearchTerm, setRequestorSearchTerm] = useState("");
  const [selectedRequestors, setSelectedRequestors] = useState<string[]>([]);

  // State for category dropdown
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // State for severity dropdown
  const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest("#dropdownRadioHelper") &&
        !target.closest("#dropdownRadioHelperButton")
      ) {
        setIsSeverityDropdownOpen(false);
      }
    };

    if (isSeverityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSeverityDropdownOpen]);

  // Department options (sorted A to Z)
  const departmentOptions = [
    "Accounting",
    "Administrative",
    "Claims",
    "Digital Marketing",
    "GI Team",
    "HR",
    "IT",
    "Management",
    "Placement",
    "Renewals",
    "Sales",
  ];

  // Category options
  const categoryOptions = [
    "Computer / Laptop",
    "Monitor / Display",
    "Keyboard / Mouse",
    "Printer / Scanner",
    "Storage Device (HDD, SSD, USB, External Drive)",
    "Peripheral Device",
    "Motherboard / CPU",
    "Memory / RAM",
    "Power Supply",
    "Cooling Fan",
    "Application Error",
    "System Crash",
    "Installation / Update Problem",
    "Configuration Error",
    "Compatibility Issue",
    "Performance / Slowness",
    "Software Corruption",
    "OS Patch / Update Failed",
    "Driver Issue",
    "Blue Screen Error",
    "Email Sending / Receiving",
    "Spam / Phishing",
    "Email Storage Full",
    "Distribution List Issue",
    "Calendar / Meeting Invite Problem",
    "Mailbox Login Issue",
    "Mailbox Sync Problem",
    "Mailbox Quota Exceeded",
    "Email Delay / Bounce Back",
    "NAS Connection Problem",
    "NAS File Access Denied",
    "NAS Storage Full",
    "NAS Backup / Restore Failure",
    "NAS Permission Issue",
    "NAS Slow Response",
    "NAS Drive Failure",
    "Mobile Device (Phone / Tablet)",
    "Projector / Meeting Room Device",
    "Webcam / Headset Issue",
    "Smart Device (IoT)",
    "External Hard Drive",
    "Docking Station",
    "Software License Activation",
    "Expired License",
    "Missing License",
    "License Renewal Required",
    "License Key Invalid",
    "Over-licensed / Under-licensed",
    "Windows Update Error",
    "Driver Problem",
    "Boot / Startup Error",
    "OS Crash",
    "Kernel Panic (Mac/Linux)",
    "File System Corruption",
    "Login Loop Error",
    "Internet Connection",
    "Wi-Fi Problem",
    "LAN / Cable Connection",
    "VPN Access",
    "DNS / IP Issue",
    "Server Down",
    "Proxy Issue",
    "Bandwidth / Latency Problem",
    "Network Congestion",
    "Password Reset",
    "Account Lockout",
    "Account Disabled",
    "Account Expired",
    "Account Creation Issue",
    "Profile Corruption",
    "OTP Not Received",
    "OTP Invalid",
    "OTP Expired",
    "OTP Delivery Delay",
    "Permission Request",
    "File / Folder Access Denied",
    "System Access Denied",
    "Shared Drive Access Required",
    "Database Access Error",
    "Unauthorized Access",
    "Security Breach",
    "Antivirus Not Updating",
    "Antivirus Scan Failure",
    "Virus / Malware Infection",
    "Ransomware Attack",
    "Firewall Block",
    "Phishing Attempt",
  ];

  // Severity options
  const severityOptions = [
    {
      value: "Critical",
      label: "Critical",
      description: "System down, data loss, or security breach",
    },
    {
      value: "Urgent",
      label: "Urgent",
      description: "Major functionality affected, business impact",
    },
    {
      value: "High",
      label: "High",
      description: "Important issue affecting multiple users",
    },
    {
      value: "Normal",
      label: "Normal",
      description: "Standard issue with moderate impact",
    },
    {
      value: "Low",
      label: "Low",
      description: "Minor issue with minimal business impact",
    },
  ];

  // Requestor options (mock data - in real app would come from user accounts)
  const requestorOptions = [
    "John Smith",
    "Sarah Johnson",
    "Mike Davis",
    "Lisa Wilson",
    "David Brown",
    "Emma Taylor",
    "Alex Chen",
    "Tom Wilson",
  ];

  // Emoji options for the picker
  const emojiOptions = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "✋",
    "🤚",
    "🖐",
    "🖖",
    "👋",
    "🤝",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤜",
    "🤛",
    "✊",
    "👊",
    "👎",
    "👌",
    "✌️",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
    "🆔",
    "⚛️",
    "🉑",
    "☢️",
    "☣️",
    "📴",
    "📳",
    "🈶",
    "🈚",
    "🈸",
    "🈺",
    "🈷️",
    "✴️",
    "🆚",
    "💮",
    "🉐",
    "㊙️",
    "㊗️",
    "🈴",
    "🈵",
    "🈹",
    "🈲",
    "🅰️",
    "🅱️",
    "🆎",
    "🆑",
    "🅾️",
    "🆘",
    "❌",
    "⭕",
    "🛑",
    "⛔",
    "📛",
    "🚫",
    "💯",
    "💢",
    "♨️",
    "🚷",
    "🚯",
    "🚳",
    "🚱",
    "🔞",
    "📵",
    "🚭",
    "❗",
    "❕",
    "❓",
    "❔",
    "‼️",
    "⁉️",
    "🔅",
    "🔆",
    "〽️",
    "⚠️",
    "🚸",
    "🔱",
    "⚜️",
    "🔰",
    "♻️",
    "✅",
    "🈯",
    "💹",
    "❇️",
    "✳️",
    "❎",
    "🌐",
    "💠",
    "Ⓜ️",
    "🌀",
    "💤",
    "🏧",
    "🚾",
    "♿",
    "🅿️",
    "🈳",
    "🈂️",
    "🛂",
    "🛃",
    "🛄",
    "🛅",
    "🚹",
    "🚺",
    "🚼",
    "🚻",
    "🚮",
    "🎦",
    "📶",
    "🈁",
    "🔣",
    "ℹ️",
    "🔤",
    "🔡",
    "🔠",
    "🆖",
    "🆗",
    "🆙",
    "🆒",
    "🆕",
    "🆓",
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
    "🔢",
    "#️⃣",
    "*️⃣",
    "⏏️",
    "▶️",
    "⏸",
    "⏯",
    "⏹",
    "⏺",
    "⏭",
    "⏮",
    "⏩",
    "⏪",
    "⏫",
    "⏬",
    "◀️",
    "🔼",
    "🔽",
    "➡️",
    "⬅️",
    "⬆️",
    "⬇️",
    "↗️",
    "↘️",
    "↙️",
    "↖️",
    "↕️",
    "↔️",
    "↩️",
    "↪️",
    "⤴️",
    "⤵️",
    "🔀",
    "🔁",
    "🔂",
    "🔃",
    "🔄",
    "🔅",
    "🔆",
    "🎵",
    "🎶",
    "➕",
    "➖",
    "➗",
    "✖️",
    "♾",
    "💲",
    "💱",
    "™️",
    "©️",
    "®️",
    "〰️",
    "➰",
    "➿",
    "🔚",
    "🔙",
    "🔛",
    "🔝",
    "🔜",
    "✔️",
    "☑️",
    "🔘",
    "⚪",
    "⚫",
    "🔴",
    "🔵",
    "🟠",
    "🟡",
    "🟢",
    "🟣",
    "🟤",
    "⚫",
    "⚪",
    "🟥",
    "🟧",
    "🟨",
    "🟩",
    "🟦",
    "🟪",
    "🟫",
    "⬛",
    "⬜",
    "◼️",
    "◻️",
    "◾",
    "◽",
    "▪️",
    "▫️",
    "🔶",
    "🔷",
    "🔸",
    "🔹",
    "🔺",
    "🔻",
    "💠",
    "🔘",
    "🔳",
    "🔲",
    "🏁",
    "🚩",
    "🎌",
    "🏴",
    "🏳️",
    "🏳️‍🌈",
    "🏳️‍⚧️",
    "🏴‍☠️",
    "🇦🇨",
    "🇦🇩",
    "🇦🇪",
    "🇦🇫",
    "🇦🇬",
    "🇦🇮",
    "🇦🇱",
    "🇦🇲",
    "🇦🇴",
    "🇦🇶",
    "🇦🇷",
    "🇦🇸",
    "🇦🇹",
    "🇦🇺",
    "🇦🇼",
    "🇦🇽",
    "🇦🇿",
    "🇧🇦",
    "🇧🇧",
    "🇧🇩",
    "🇧🇪",
    "🇧🇫",
    "🇧🇬",
    "🇧🇭",
    "🇧🇮",
    "🇧🇯",
    "🇧🇱",
    "🇧🇲",
    "🇧🇳",
    "🇧🇴",
    "🇧🇶",
    "🇧🇷",
    "🇧🇸",
    "🇧🇹",
    "🇧🇻",
    "🇧🇼",
    "🇧🇾",
    "🇧🇿",
    "🇨🇦",
    "🇨🇨",
    "🇨🇩",
    "🇨🇫",
    "🇨🇬",
    "🇨🇭",
    "🇨🇮",
    "🇨🇰",
    "🇨🇱",
    "🇨🇲",
    "🇨🇳",
    "🇨🇴",
    "🇨🇵",
    "🇨🇷",
    "🇨🇺",
    "🇨🇻",
    "🇨🇼",
    "🇨🇽",
    "🇨🇾",
    "🇨🇿",
    "🇩🇪",
    "🇩🇬",
    "🇩🇯",
    "🇩🇰",
    "🇩🇲",
    "🇩🇴",
    "🇩🇿",
    "🇪🇦",
    "🇪🇨",
    "🇪🇪",
    "🇪🇬",
    "🇪🇭",
    "🇪🇷",
    "🇪🇸",
    "🇪🇹",
    "🇪🇺",
    "🇫🇮",
    "🇫🇯",
    "🇫🇰",
    "🇫🇲",
    "🇫🇴",
    "🇫🇷",
    "🇬🇦",
    "🇬🇧",
    "🇬🇩",
    "🇬🇪",
    "🇬🇫",
    "🇬🇬",
    "🇬🇭",
    "🇬🇮",
    "🇬🇱",
    "🇬🇲",
    "🇬🇳",
    "🇬🇵",
    "🇬🇶",
    "🇬🇷",
    "🇬🇸",
    "🇬🇹",
    "🇬🇺",
    "🇬🇼",
    "🇬🇾",
    "🇭🇰",
    "🇭🇲",
    "🇭🇳",
    "🇭🇷",
    "🇭🇹",
    "🇭🇺",
    "🇮🇨",
    "🇮🇩",
    "🇮🇪",
    "🇮🇱",
    "🇮🇲",
    "🇮🇳",
    "🇮🇴",
    "🇮🇶",
    "🇮🇷",
    "🇮🇸",
    "🇮🇹",
    "🇯🇪",
    "🇯🇲",
    "🇯🇴",
    "🇯🇵",
    "🇰🇪",
    "🇰🇬",
    "🇰🇭",
    "🇰🇮",
    "🇰🇲",
    "🇰🇳",
    "🇰🇵",
    "🇰🇷",
    "🇰🇼",
    "🇰🇾",
    "🇰🇿",
    "🇱🇦",
    "🇱🇧",
    "🇱🇨",
    "🇱🇮",
    "🇱🇰",
    "🇱🇷",
    "🇱🇸",
    "🇱🇹",
    "🇱🇺",
    "🇱🇻",
    "🇱🇾",
    "🇲🇦",
    "🇲🇨",
    "🇲🇩",
    "🇲🇪",
    "🇲🇫",
    "🇲🇬",
    "🇲🇭",
    "🇲🇰",
    "🇲🇱",
    "🇲🇲",
    "🇲🇳",
    "🇲🇴",
    "🇲🇵",
    "🇲🇶",
    "🇲🇷",
    "🇲🇸",
    "🇲🇹",
    "🇲🇺",
    "🇲🇻",
    "🇲🇼",
    "🇲🇽",
    "🇲🇾",
    "🇲🇿",
    "🇳🇦",
    "🇳🇨",
    "🇳🇪",
    "🇳🇫",
    "🇳🇬",
    "🇳🇮",
    "🇳🇱",
    "🇳🇴",
    "🇳🇵",
    "🇳🇷",
    "🇳🇺",
    "🇳🇿",
    "🇴🇲",
    "🇵🇦",
    "🇵🇪",
    "🇵🇫",
    "🇵🇬",
    "🇵🇭",
    "🇵🇰",
    "🇵🇱",
    "🇵🇲",
    "🇵🇳",
    "🇵🇷",
    "🇵🇸",
    "🇵🇹",
    "🇵🇼",
    "🇵🇾",
    "🇶🇦",
    "🇷🇪",
    "🇷🇴",
    "🇷🇸",
    "🇷🇺",
    "🇷🇼",
    "🇸🇦",
    "🇸🇧",
    "🇸🇨",
    "🇸🇩",
    "🇸🇪",
    "🇸🇬",
    "🇸🇭",
    "🇸🇮",
    "🇸🇯",
    "🇸🇰",
    "🇸🇱",
    "🇸🇲",
    "🇸🇳",
    "🇸🇴",
    "🇸🇷",
    "🇸🇸",
    "🇸🇹",
    "🇸🇻",
    "🇸🇽",
    "🇸🇾",
    "🇸🇿",
    "🇹🇦",
    "🇹🇨",
    "🇹🇩",
    "🇹🇫",
    "🇹🇬",
    "🇹🇭",
    "🇹🇯",
    "🇹🇰",
    "🇹🇱",
    "🇹🇲",
    "🇹🇳",
    "🇹🇴",
    "🇹🇷",
    "🇹🇹",
    "🇹🇻",
    "🇹🇼",
    "🇹🇿",
    "🇺🇦",
    "🇺🇬",
    "🇺🇲",
    "🇺🇳",
    "🇺🇸",
    "🇺🇾",
    "🇺🇿",
    "🇻🇦",
    "🇻🇨",
    "🇻🇪",
    "🇻🇬",
    "🇻🇮",
    "🇻🇳",
    "🇻🇺",
    "🇼🇫",
    "🇼🇸",
    "🇽🇰",
    "🇾🇪",
    "🇾🇹",
    "🇿🇦",
    "🇿🇲",
    "🇿🇼",
    "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  ];

  // Function to calculate relative time
  const getRelativeTime = (createdDate: Date, lastUpdateDate: Date) => {
    const now = new Date();
    const timeToUse =
      lastUpdateDate > createdDate ? lastUpdateDate : createdDate;
    const diffInMs = now.getTime() - timeToUse.getTime();

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
    }
  };

  // Function to handle ticket updates (resets the time)
  const handleTicketUpdate = (ticketId: string) => {
    // In a real application, this would update the ticket in the database
    // For demo purposes, we'll just show an alert
    alert(
      `Ticket ${ticketId} has been updated. The "Created" time will reset to show the update time.`
    );
  };

  // Form handlers for new request
  const handleFormChange = (field: string, value: string) => {
    setNewRequestForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitRequest = () => {
    // Get description from Tiptap editor if available
    let description = newRequestForm.description;
    if ((window as any).tiptapEditor) {
      description = (window as any).tiptapEditor.getHTML();
    }

    // Validate required fields
    if (
      selectedRequestors.length === 0 ||
      !newRequestForm.department ||
      !newRequestForm.ticketTitle ||
      selectedCategories.length === 0 ||
      !newRequestForm.severity ||
      !description ||
      description === "<p></p>" ||
      description === "<p><br></p>"
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // In a real application, this would submit to the backend
    const formData = {
      ...newRequestForm,
      requestor: selectedRequestors.join(", "), // Join multiple selected requestors
      category: selectedCategories.join(", "), // Join multiple selected categories
      description: description,
    };
    console.log("New Request Submitted:", formData);
    alert("Request submitted successfully!");

    // Reset form and close modal
    setNewRequestForm({
      ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      requestor: "",
      department: "",
      ticketTitle: "",
      category: "",
      severity: "",
      description: "",
    });
    setCustomCategory("");
    setSelectedRequestors([]);
    setRequestorSearchTerm("");
    setIsRequestorDropdownOpen(false);
    setSelectedCategories([]);
    setCategorySearchTerm("");
    setIsCategoryDropdownOpen(false);
    setIsNewRequestModalOpen(false);
  };

  // Emoji handler
  const handleEmojiClick = (emoji: string) => {
    // Insert emoji into Tiptap editor if available and mounted
    const editor = (window as any).tiptapEditor;
    if (editor && editor.view && !editor.isDestroyed) {
      editor.chain().focus().insertContent(emoji).run();
    } else {
      // Fallback to form state if editor not available
      setNewRequestForm((prev) => ({
        ...prev,
        description: prev.description + emoji,
      }));
    }
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        const target = event.target as Element;
        if (!target.closest(".emoji-picker-container")) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Requestor dropdown handlers
  const handleRequestorSelect = (requestor: string) => {
    setSelectedRequestors((prev) => {
      if (prev.includes(requestor)) {
        return prev.filter((r) => r !== requestor);
      } else {
        return [...prev, requestor];
      }
    });
    // Auto-close dropdown when an item is selected
    setIsRequestorDropdownOpen(false);
  };

  const handleRequestorSearch = (term: string) => {
    setRequestorSearchTerm(term);
  };

  // Filter requestors based on search term
  const filteredRequestors = requestorOptions.filter((requestor) =>
    requestor.toLowerCase().includes(requestorSearchTerm.toLowerCase())
  );

  // Category dropdown handlers
  const handleCategorySelect = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
    // Auto-close dropdown when an item is selected
    setIsCategoryDropdownOpen(false);
  };

  const handleCategorySearch = (term: string) => {
    setCategorySearchTerm(term);
  };

  // Filter categories based on search term
  const filteredCategories = categoryOptions.filter((category) =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Reset category selection
  const handleCategoryReset = () => {
    setSelectedCategories([]);
    setCategorySearchTerm("");
    setCustomCategory("");
  };

  // Reset requestor selection
  const handleRequestorReset = () => {
    setSelectedRequestors([]);
    setRequestorSearchTerm("");
  };

  // Initialize Tiptap editor when modal opens
  useEffect(() => {
    if (isNewRequestModalOpen) {
      const initializeTiptap = async () => {
        try {
          // Dynamically import Tiptap modules using string literals to avoid TypeScript errors
          const coreModule = "https://esm.sh/@tiptap/core";
          const starterKitModule = "https://esm.sh/@tiptap/starter-kit";
          const placeholderModule =
            "https://esm.sh/@tiptap/extension-placeholder";
          const paragraphModule = "https://esm.sh/@tiptap/extension-paragraph";
          const boldModule = "https://esm.sh/@tiptap/extension-bold";
          const underlineModule = "https://esm.sh/@tiptap/extension-underline";
          const linkModule = "https://esm.sh/@tiptap/extension-link";
          const bulletListModule =
            "https://esm.sh/@tiptap/extension-bullet-list";
          const orderedListModule =
            "https://esm.sh/@tiptap/extension-ordered-list";
          const listItemModule = "https://esm.sh/@tiptap/extension-list-item";

          const { Editor, Node } = (await import(coreModule)) as any;
          const StarterKit = (await import(starterKitModule)) as any;
          const Placeholder = (await import(placeholderModule)) as any;
          const Paragraph = (await import(paragraphModule)) as any;
          const Bold = (await import(boldModule)) as any;
          const Underline = (await import(underlineModule)) as any;
          const Link = (await import(linkModule)) as any;
          const BulletList = (await import(bulletListModule)) as any;
          const OrderedList = (await import(orderedListModule)) as any;
          const ListItem = (await import(listItemModule)) as any;

          const CustomBlockquote = Node.create({
            name: "customBlockquote",
            group: "block",
            content: "block+",
            defining: true,
            parseHTML() {
              return [{ tag: "blockquote" }];
            },
            addOptions() {
              return {
                HTMLAttributes: {},
              };
            },
            addNodeView() {
              return ({ node: _node }: { node: any }) => {
                const blockquote = document.createElement("blockquote");

                Object.entries(this.options.HTMLAttributes).forEach(
                  ([key, value]) => {
                    blockquote.setAttribute(key, value as string);
                  }
                );

                const svg = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "svg"
                );
                svg.setAttribute(
                  "class",
                  "absolute top-0 start-0 size-16 text-gray-100 dark:text-neutral-700"
                );
                svg.setAttribute("width", "16");
                svg.setAttribute("height", "16");
                svg.setAttribute("viewBox", "0 0 16 16");
                svg.setAttribute("fill", "none");
                svg.setAttribute("aria-hidden", "true");

                const path = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "path"
                );
                path.setAttribute(
                  "d",
                  "M7.39762 10.3C7.39762 11.0733 7.14888 11.7 6.6514 12.18C6.15392 12.6333 5.52552 12.86 4.76621 12.86C3.84979 12.86 3.09047 12.5533 2.48825 11.94C1.91222 11.3266 1.62421 10.4467 1.62421 9.29999C1.62421 8.07332 1.96459 6.87332 2.64535 5.69999C3.35231 4.49999 4.33418 3.55332 5.59098 2.85999L6.4943 4.25999C5.81354 4.73999 5.26369 5.27332 4.84476 5.85999C4.45201 6.44666 4.19017 7.12666 4.05926 7.89999C4.29491 7.79332 4.56983 7.73999 4.88403 7.73999C5.61716 7.73999 6.21938 7.97999 6.69067 8.45999C7.16197 8.93999 7.39762 9.55333 7.39762 10.3ZM14.6242 10.3C14.6242 11.0733 14.3755 11.7 13.878 12.18C13.3805 12.6333 12.7521 12.86 11.9928 12.86C11.0764 12.86 10.3171 12.5533 9.71484 11.94C9.13881 11.3266 8.85079 10.4467 8.85079 9.29999C8.85079 8.07332 9.19117 6.87332 9.87194 5.69999C10.5789 4.49999 11.5608 3.55332 12.8176 2.85999L13.7209 4.25999C13.0401 4.73999 12.4903 5.27332 12.0713 5.85999C11.6786 6.44666 11.4168 7.12666 11.2858 7.89999C11.5215 7.79332 11.7964 7.73999 12.1106 7.73999C12.8437 7.73999 13.446 7.97999 13.9173 8.45999C14.3886 8.93999 14.6242 9.55333 14.6242 10.3Z"
                );
                path.setAttribute("fill", "currentColor");
                svg.appendChild(path);

                blockquote.appendChild(svg);

                const contentWrapper = document.createElement("div");
                contentWrapper.classList.add("relative", "z-10", "italic");
                blockquote.appendChild(contentWrapper);

                return {
                  dom: blockquote,
                  contentDOM: contentWrapper,
                };
              };
            },
          });

          const editor = new Editor({
            element: document.querySelector(
              "#hs-editor-tiptap-blockquote-alt [data-hs-editor-field]"
            ),
            editorProps: {
              attributes: {
                class: "relative min-h-40 p-3",
              },
            },
            extensions: [
              StarterKit.default.configure({
                blockquote: false,
                history: false,
              }),
              Placeholder.default.configure({
                placeholder: "Describe your issue in detail...",
                emptyNodeClass: "before:text-gray-400",
              }),
              Paragraph.default.configure({
                HTMLAttributes: {
                  class: "text-sm text-gray-800 dark:text-neutral-200",
                },
              }),
              Bold.default.configure({
                HTMLAttributes: {
                  class: "font-bold",
                },
              }),
              Underline.default,
              Link.default.configure({
                HTMLAttributes: {
                  class:
                    "inline-flex items-center gap-x-1 text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-white",
                },
              }),
              BulletList.default.configure({
                HTMLAttributes: {
                  class: "list-disc list-inside text-gray-800 dark:text-white",
                },
              }),
              OrderedList.default.configure({
                HTMLAttributes: {
                  class:
                    "list-decimal list-inside text-gray-800 dark:text-white",
                },
              }),
              ListItem.default.configure({
                HTMLAttributes: {
                  class: "marker:text-sm",
                },
              }),
              CustomBlockquote.configure({
                HTMLAttributes: {
                  class: "relative sm:[&>div>p]:text-xl pt-6 pb-4 pe-4 ps-8",
                },
              }),
            ],
          });

          const actions = [
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-bold]",
              fn: () => editor.chain().focus().toggleBold().run(),
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-italic]",
              fn: () => editor.chain().focus().toggleItalic().run(),
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-underline]",
              fn: () => editor.chain().focus().toggleUnderline().run(),
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-strike]",
              fn: () => editor.chain().focus().toggleStrike().run(),
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-link]",
              fn: () => {
                const url = window.prompt("URL");
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
              },
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-ol]",
              fn: () => editor.chain().focus().toggleOrderedList().run(),
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-ul]",
              fn: () => editor.chain().focus().toggleBulletList().run(),
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-blockquote]",
              fn: () =>
                editor.chain().focus().toggleWrap("customBlockquote").run(),
            },
            {
              id: "#hs-editor-tiptap-blockquote-alt [data-hs-editor-code]",
              fn: () => editor.chain().focus().toggleCode().run(),
            },
          ];

          actions.forEach(({ id, fn }) => {
            const action = document.querySelector(id);

            if (action === null) return;

            action.addEventListener("click", (e) => {
              e.preventDefault();
              // Check if editor is mounted and has focus capability
              if (editor && editor.view && !editor.isDestroyed) {
                fn();
              }
            });
          });

          // Store editor reference for cleanup
          (window as any).tiptapEditor = editor;
        } catch (error) {
          console.error("Failed to initialize Tiptap editor:", error);
        }
      };

      // Small delay to ensure DOM is ready
      setTimeout(initializeTiptap, 100);
    }

    return () => {
      // Cleanup editor when modal closes
      if ((window as any).tiptapEditor) {
        (window as any).tiptapEditor.destroy();
        (window as any).tiptapEditor = null;
      }
    };
  }, [isNewRequestModalOpen]);

  // Location selection state
  const [selectedLocation, setSelectedLocation] = useState({
    philippines: "",
    indonesia: "",
    singapore: "",
  });

  // Location data with ticket values
  const locationData = {
    philippines: {
      Manila: { created: 250, closed: 180, resolved: 160 },
      Bacolod: { created: 168, closed: 132, resolved: 138 },
    },
    indonesia: {
      Jakarta: { created: 180, closed: 140, resolved: 120 },
      Bali: { created: 118, closed: 94, resolved: 78 },
    },
    singapore: {
      Tampines: { created: 89, closed: 67, resolved: 54 },
    },
  };

  // Chart options for country charts
  const philippinesOptions = {
    chart: {
      height: 200,
      type: "bar" as const,
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    series: [
      {
        name: "Created Tickets",
        data: [
          selectedLocation.philippines
            ? locationData.philippines[
                selectedLocation.philippines as keyof typeof locationData.philippines
              ].created
            : locationData.philippines.Manila.created +
              locationData.philippines.Bacolod.created,
        ],
      },
      {
        name: "Closed",
        data: [
          selectedLocation.philippines
            ? locationData.philippines[
                selectedLocation.philippines as keyof typeof locationData.philippines
              ].closed
            : locationData.philippines.Manila.closed +
              locationData.philippines.Bacolod.closed,
        ],
      },
      {
        name: "Resolved",
        data: [
          selectedLocation.philippines
            ? locationData.philippines[
                selectedLocation.philippines as keyof typeof locationData.philippines
              ].resolved
            : locationData.philippines.Manila.resolved +
              locationData.philippines.Bacolod.resolved,
        ],
      },
    ],
    fill: {
      type: ["solid", "solid", "solid"],
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
    },
    xaxis: {
      type: "category" as const,
      categories: ["Philippines"],
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "12px",
          fontFamily: "Inter, ui-sans-serif",
          fontWeight: 600,
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        align: "right" as const,
        style: {
          colors: "#9ca3af",
          fontSize: "11px",
          fontFamily: "Inter, ui-sans-serif",
          fontWeight: 400,
        },
        formatter: (value: number) => `${value}`,
      },
    },
    colors: ["#3b82f6", "#10b981", "#f59e0b"],
    grid: {
      strokeDashArray: 2,
      borderColor: "#e5e7eb",
    },
  };

  const indonesiaOptions = {
    ...philippinesOptions,
    xaxis: {
      ...philippinesOptions.xaxis,
      categories: ["Indonesia"],
    },
    series: [
      {
        name: "Created Tickets",
        data: [
          selectedLocation.indonesia
            ? locationData.indonesia[
                selectedLocation.indonesia as keyof typeof locationData.indonesia
              ].created
            : locationData.indonesia.Jakarta.created +
              locationData.indonesia.Bali.created,
        ],
      },
      {
        name: "Closed",
        data: [
          selectedLocation.indonesia
            ? locationData.indonesia[
                selectedLocation.indonesia as keyof typeof locationData.indonesia
              ].closed
            : locationData.indonesia.Jakarta.closed +
              locationData.indonesia.Bali.closed,
        ],
      },
      {
        name: "Resolved",
        data: [
          selectedLocation.indonesia
            ? locationData.indonesia[
                selectedLocation.indonesia as keyof typeof locationData.indonesia
              ].resolved
            : locationData.indonesia.Jakarta.resolved +
              locationData.indonesia.Bali.resolved,
        ],
      },
    ],
  };

  const singaporeOptions = {
    ...philippinesOptions,
    xaxis: {
      ...philippinesOptions.xaxis,
      categories: ["Singapore"],
    },
    series: [
      {
        name: "Created Tickets",
        data: [
          selectedLocation.singapore
            ? locationData.singapore[
                selectedLocation.singapore as keyof typeof locationData.singapore
              ].created
            : locationData.singapore.Tampines.created,
        ],
      },
      {
        name: "Closed",
        data: [
          selectedLocation.singapore
            ? locationData.singapore[
                selectedLocation.singapore as keyof typeof locationData.singapore
              ].closed
            : locationData.singapore.Tampines.closed,
        ],
      },
      {
        name: "Resolved",
        data: [
          selectedLocation.singapore
            ? locationData.singapore[
                selectedLocation.singapore as keyof typeof locationData.singapore
              ].resolved
            : locationData.singapore.Tampines.resolved,
        ],
      },
    ],
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load Leaflet and initialize Southeast Asia map
  useEffect(() => {
    // Check if map is already initialized
    if ((window as any).ticketMap) {
      return; // Exit early if map already exists
    }

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    document.head.appendChild(script);

    script.onload = () => {
      if (window.L && !(window as any).ticketMap) {
        // Initialize map with default zoom level
        const defaultCenter = [2.0, 110.0]; // Center for wider Southeast Asia view
        const defaultZoom = 4; // Zoomed out to show entire Southeast Asia region

        const map = window.L.map("leaflet_map", {
          zoomControl: true,
          center: defaultCenter,
          zoom: defaultZoom,
        });

        // Use light theme by default (as shown in the image)
        const tileLayer = window.L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution: "&copy; OSM & CARTO",
            maxZoom: 20,
          }
        );

        tileLayer.addTo(map);

        // Main countries with orange markers
        const mainCountries = [
          {
            name: "Philippines",
            capital: "Manila",
            latlng: [14.5995, 120.9842],
          },
          {
            name: "Indonesia",
            capital: "Jakarta",
            latlng: [-6.2088, 106.8456],
          },
          {
            name: "Singapore",
            capital: "Singapore",
            latlng: [1.3521, 103.8198],
          },
        ];

        // Additional countries with blue markers
        const additionalCountries = [
          {
            name: "Malaysia",
            capital: "Kuala Lumpur",
            latlng: [3.139, 101.6869],
          },
          { name: "Thailand", capital: "Bangkok", latlng: [13.7563, 100.5018] },
          { name: "Vietnam", capital: "Hanoi", latlng: [21.0285, 105.8542] },
          { name: "Myanmar", capital: "Naypyidaw", latlng: [19.7633, 96.0785] },
          {
            name: "Cambodia",
            capital: "Phnom Penh",
            latlng: [11.5564, 104.9282],
          },
          { name: "Laos", capital: "Vientiane", latlng: [17.9757, 102.6331] },
          {
            name: "Brunei",
            capital: "Bandar Seri Begawan",
            latlng: [4.9036, 114.9398],
          },
        ];

        // Add main countries with orange markers
        mainCountries.forEach((country) => {
          const marker = window.L.circleMarker(country.latlng, {
            radius: 10,
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
            color: "#f97316", // Orange color
            fillColor: "#f97316",
          }).addTo(map);

          marker.bindPopup(`
              <strong style="font-size: 16px; color: #f97316;">${country.name}</strong><br/>
              <small style="color: #6b7280;">Capital: ${country.capital}</small>
          `);
        });

        // Add additional countries with blue markers
        additionalCountries.forEach((country) => {
          const marker = window.L.circleMarker(country.latlng, {
            radius: 8,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            color: "#3b82f6", // Blue color
            fillColor: "#3b82f6",
          }).addTo(map);

          marker.bindPopup(`
            <strong style="font-size: 16px; color: #3b82f6;">${country.name}</strong><br/>
            <small style="color: #6b7280;">Capital: ${country.capital}</small>
          `);
        });

        // Store map instance for cleanup
        (window as any).ticketMap = map;
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if ((window as any).ticketMap) {
        (window as any).ticketMap.remove();
        delete (window as any).ticketMap;
      }
    };
  }, []); // Remove isDark dependency to prevent re-initialization

  // Mock ticket data
  const tickets = [
    {
      id: "TKT-001",
      title: "Cannot access email account",
      customer: "John Smith",
      email: "john.smith@company.com",
      severity: "High",
      status: "Open",
      category: "Email Issues",
      created: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (updated)
      assignee: "Sarah Johnson",
      description:
        "User is unable to log into their email account. Getting authentication error.",
    },
    {
      id: "TKT-002",
      title: "Software installation failed",
      customer: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      severity: "Normal",
      status: "In Progress",
      category: "Software",
      created: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (updated)
      assignee: "Mike Davis",
      description:
        "Office 365 installation keeps failing with error code 0x80070005.",
    },
    {
      id: "TKT-003",
      title: "Network connectivity problems",
      customer: "Mike Davis",
      email: "mike.davis@company.com",
      severity: "Critical",
      status: "Open",
      category: "Network",
      created: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago (not updated)
      assignee: "Unassigned",
      description:
        "Complete network outage in the marketing department. No internet access.",
    },
    {
      id: "TKT-004",
      title: "Password reset request",
      customer: "Lisa Wilson",
      email: "lisa.wilson@company.com",
      severity: "Low",
      status: "Resolved",
      category: "Account Access",
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (updated)
      assignee: "Alex Chen",
      description: "User forgot their password and needs it reset.",
    },
    {
      id: "TKT-005",
      title: "Printer not working",
      customer: "David Brown",
      email: "david.brown@company.com",
      severity: "Normal",
      status: "In Progress",
      category: "Hardware",
      created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      lastUpdate: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago (updated)
      assignee: "Tom Wilson",
      description:
        "HP LaserJet printer in office 205 is not responding to print jobs.",
    },
    {
      id: "TKT-006",
      title: "VPN connection issues",
      customer: "Emma Taylor",
      email: "emma.taylor@company.com",
      severity: "Urgent",
      status: "Open",
      category: "Network",
      created: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), // 2 weeks ago
      lastUpdate: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), // 2 weeks ago (not updated)
      assignee: "Unassigned",
      description: "Cannot connect to company VPN from home office.",
    },
  ];

  const getSeverityRating = (severity: string) => {
    switch (severity) {
      case "Critical":
        return {
          value: 5,
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
          tooltip: "🚨 Highest severity, immediate attention",
        };
      case "Urgent":
        return {
          value: 4,
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
          tooltip: "🔴 Very high priority, near-critical",
        };
      case "High":
        return {
          value: 3,
          color:
            "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
          tooltip: "🟠 Important, but not urgent",
        };
      case "Normal":
        return {
          value: 2,
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
          tooltip: "🟡 Standard issue, moderate impact",
        };
      case "Low":
        return {
          value: 1,
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
          tooltip: "🟢 Minor issue, low impact",
        };
      default:
        return {
          value: 0,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
          tooltip: "Unknown severity",
        };
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "Open":
        return {
          progress: 10,
          color: "bg-orange-500",
          textColor: "text-orange-600 dark:text-orange-400",
          tooltip: "Ticket created, not yet worked on",
        };
      case "Pending":
        return {
          progress: 25,
          color: "bg-yellow-500",
          textColor: "text-yellow-600 dark:text-yellow-400",
          tooltip: "Waiting for customer or initial review",
        };
      case "In Progress":
        return {
          progress: 50,
          color: "bg-blue-500",
          textColor: "text-blue-600 dark:text-blue-400",
          tooltip: "Actively being worked on",
        };
      case "On Hold":
        return {
          progress: 60,
          color: "bg-purple-500",
          textColor: "text-purple-600 dark:text-purple-400",
          tooltip: "Temporarily paused, waiting for 3rd party or user",
        };
      case "Escalated":
        return {
          progress: 75,
          color: "bg-red-500",
          textColor: "text-red-600 dark:text-red-400",
          tooltip: "Moved to higher support level",
        };
      case "Resolved":
        return {
          progress: 90,
          color: "bg-green-500",
          textColor: "text-green-600 dark:text-green-400",
          tooltip: "Issue fixed, awaiting confirmation",
        };
      case "Closed":
        return {
          progress: 100,
          color: "bg-gray-500",
          textColor: "text-gray-600 dark:text-gray-400",
          tooltip: "Ticket officially completed",
        };
      case "Cancelled":
        return {
          progress: 0,
          color: "bg-gray-300",
          textColor: "text-gray-500 dark:text-gray-500",
          tooltip: "Ticket invalid or withdrawn",
        };
      default:
        return {
          progress: 0,
          color: "bg-gray-300",
          textColor: "text-gray-500 dark:text-gray-500",
          tooltip: "Unknown status",
        };
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesSeverity =
      selectedPriority === "all" || ticket.severity === selectedPriority;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, rowsPerPage]);

  return (
    <>
      <style>
        {`
          .ProseMirror:focus {
            outline: none;
          }

          .tiptap ul p,
          .tiptap ol p {
            display: inline;
          }

          .tiptap p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}
      </style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ticket Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all support tickets
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>

        {/* Stats Cards Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ticket Statistics
          </h2>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Eye className="w-4 h-4" />
            Status Flow
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer group"
            title="All support requests"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                +12.5%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Total Tickets
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {tickets.length}
              </p>
            </div>
            {/* Chart */}
            <div className="mt-3 h-8 rounded-lg p-2">
              <ReactApexChart
                options={{
                  chart: {
                    type: "area",
                    height: 24,
                    width: "100%",
                    sparkline: { enabled: true },
                    toolbar: { show: false },
                    background: "transparent",
                    animations: {
                      enabled: true,
                      speed: 800,
                      animateGradually: { enabled: true, delay: 150 },
                      dynamicAnimation: { enabled: true, speed: 350 },
                    },
                  },
                  dataLabels: { enabled: false },
                  stroke: { curve: "smooth", width: 2, colors: ["#3B82F6"] },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.4,
                      opacityTo: 0.05,
                      stops: [0, 100],
                      colorStops: [
                        { offset: 0, color: "#3B82F6", opacity: 0.4 },
                        { offset: 100, color: "#3B82F6", opacity: 0.05 },
                      ],
                    },
                  },
                  colors: ["#3B82F6"],
                  tooltip: { enabled: false },
                  grid: { show: false },
                  xaxis: {
                    labels: { show: false },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: { labels: { show: false } },
                  markers: {
                    size: 0,
                    colors: ["#3B82F6"],
                    strokeColors: "#3B82F6",
                    strokeWidth: 2,
                    hover: { size: 4 },
                  },
                }}
                series={[
                  {
                    name: "Total Tickets",
                    data: [4, 5, 3, 6, 4, 5, 6, 5, 4, 6, 5, 6],
                  },
                ]}
                type="area"
                height={24}
                width="100%"
              />
            </div>
          </div>
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 cursor-pointer group"
            title="Awaiting response"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors duration-300">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
                <TrendingDown className="w-4 h-4 mr-1.5" />
                -8.2%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Open
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {tickets.filter((t) => t.status === "Open").length}
              </p>
            </div>
            {/* Chart */}
            <div className="mt-3 h-8 rounded-lg p-2">
              <ReactApexChart
                options={{
                  chart: {
                    type: "area",
                    height: 24,
                    width: "100%",
                    sparkline: { enabled: true },
                    toolbar: { show: false },
                    background: "transparent",
                    animations: {
                      enabled: true,
                      speed: 800,
                      animateGradually: { enabled: true, delay: 150 },
                      dynamicAnimation: { enabled: true, speed: 350 },
                    },
                  },
                  dataLabels: { enabled: false },
                  stroke: { curve: "smooth", width: 2, colors: ["#F97316"] },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.4,
                      opacityTo: 0.05,
                      stops: [0, 100],
                      colorStops: [
                        { offset: 0, color: "#F97316", opacity: 0.4 },
                        { offset: 100, color: "#F97316", opacity: 0.05 },
                      ],
                    },
                  },
                  colors: ["#F97316"],
                  tooltip: { enabled: false },
                  grid: { show: false },
                  xaxis: {
                    labels: { show: false },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: { labels: { show: false } },
                  markers: {
                    size: 0,
                    colors: ["#F97316"],
                    strokeColors: "#F97316",
                    strokeWidth: 2,
                    hover: { size: 4 },
                  },
                }}
                series={[
                  {
                    name: "Open Tickets",
                    data: [2, 3, 2, 4, 3, 2, 3, 4, 3, 2, 3, 3],
                  },
                ]}
                type="area"
                height={24}
                width="100%"
              />
            </div>
          </div>
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300 cursor-pointer group"
            title="Being worked on"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 transition-colors duration-300">
                <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                +15.3%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                In Progress
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {tickets.filter((t) => t.status === "In Progress").length}
              </p>
            </div>
            {/* Chart */}
            <div className="mt-3 h-8 rounded-lg p-2">
              <ReactApexChart
                options={{
                  chart: {
                    type: "area",
                    height: 24,
                    width: "100%",
                    sparkline: { enabled: true },
                    toolbar: { show: false },
                    background: "transparent",
                    animations: {
                      enabled: true,
                      speed: 800,
                      animateGradually: { enabled: true, delay: 150 },
                      dynamicAnimation: { enabled: true, speed: 350 },
                    },
                  },
                  dataLabels: { enabled: false },
                  stroke: { curve: "smooth", width: 2, colors: ["#06B6D4"] },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.4,
                      opacityTo: 0.05,
                      stops: [0, 100],
                      colorStops: [
                        { offset: 0, color: "#06B6D4", opacity: 0.4 },
                        { offset: 100, color: "#06B6D4", opacity: 0.05 },
                      ],
                    },
                  },
                  colors: ["#06B6D4"],
                  tooltip: { enabled: false },
                  grid: { show: false },
                  xaxis: {
                    labels: { show: false },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: { labels: { show: false } },
                  markers: {
                    size: 0,
                    colors: ["#06B6D4"],
                    strokeColors: "#06B6D4",
                    strokeWidth: 2,
                    hover: { size: 4 },
                  },
                }}
                series={[
                  {
                    name: "In Progress",
                    data: [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
                  },
                ]}
                type="area"
                height={24}
                width="100%"
              />
            </div>
          </div>
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 cursor-pointer group"
            title="Successfully closed"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors duration-300">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                +22.1%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Resolved
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {tickets.filter((t) => t.status === "Resolved").length}
              </p>
            </div>
            {/* Chart */}
            <div className="mt-3 h-8 rounded-lg p-2">
              <ReactApexChart
                options={{
                  chart: {
                    type: "area",
                    height: 24,
                    width: "100%",
                    sparkline: { enabled: true },
                    toolbar: { show: false },
                    background: "transparent",
                    animations: {
                      enabled: true,
                      speed: 800,
                      animateGradually: { enabled: true, delay: 150 },
                      dynamicAnimation: { enabled: true, speed: 350 },
                    },
                  },
                  dataLabels: { enabled: false },
                  stroke: { curve: "smooth", width: 2, colors: ["#10B981"] },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.4,
                      opacityTo: 0.05,
                      stops: [0, 100],
                      colorStops: [
                        { offset: 0, color: "#10B981", opacity: 0.4 },
                        { offset: 100, color: "#10B981", opacity: 0.05 },
                      ],
                    },
                  },
                  colors: ["#10B981"],
                  tooltip: { enabled: false },
                  grid: { show: false },
                  xaxis: {
                    labels: { show: false },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: { labels: { show: false } },
                  markers: {
                    size: 0,
                    colors: ["#10B981"],
                    strokeColors: "#10B981",
                    strokeWidth: 2,
                    hover: { size: 4 },
                  },
                }}
                series={[
                  {
                    name: "Resolved",
                    data: [1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1],
                  },
                ]}
                type="area"
                height={24}
                width="100%"
              />
            </div>
          </div>
        </div>

        {/* Map and Analytics Container */}
        <div className="card p-6 relative z-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
            {/* Left Section - Map */}
            <div className="flex flex-col relative z-0">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Southeast Asia Map
                </h3>
              </div>
              <div
                id="leaflet_map"
                style={{ width: "100%", height: "500px", borderRadius: "8px" }}
                className="border border-gray-200 dark:border-gray-700 relative z-0"
              ></div>
            </div>

            {/* Right Section - Charts and Table */}
            <div className="flex flex-col space-y-4">
              {/* Top Row - Country Charts */}
              <div className="grid grid-cols-3 gap-4">
                {/* Philippines Chart */}
                <div className="p-4 flex flex-col bg-white border border-gray-200 dark:border-gray-700 dark:bg-neutral-800 rounded-lg shadow-sm dark:shadow-none">
                  {/* Select */}
                  <div>
                    <div className="relative inline-block">
                      <select
                        className="text-xs text-gray-800 dark:text-neutral-400 bg-transparent border-none focus:outline-none"
                        value={selectedLocation.philippines}
                        onChange={(e) =>
                          setSelectedLocation((prev) => ({
                            ...prev,
                            philippines: e.target.value,
                          }))
                        }
                      >
                        <option value="" disabled>
                          Select Location
                        </option>
                        <option value="Manila">Manila</option>
                        <option value="Bacolod">Bacolod</option>
                      </select>
                    </div>
                  </div>
                  {/* End Select */}

                  {/* Grid */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="block font-medium text-lg text-gray-800 dark:text-neutral-200">
                          {selectedLocation.philippines
                            ? locationData.philippines[
                                selectedLocation.philippines as keyof typeof locationData.philippines
                              ].created
                            : locationData.philippines.Manila.created +
                              locationData.philippines.Bacolod.created}
                        </span>
                        <span className="flex justify-center items-center gap-x-1 text-sm text-green-600 dark:text-green-500">
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 7-7 7 7"></path>
                            <path d="M12 19V5"></path>
                          </svg>
                          12.5%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 w-3 h-1.5 inline-block bg-blue-600 rounded-xs"></span>
                        <div className="grow">
                          <span className="block text-sm text-gray-500 dark:text-neutral-500">
                            Created
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* End Col */}

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="flex justify-center items-center gap-x-1 text-sm text-green-600 dark:text-green-500">
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 7-7 7 7"></path>
                            <path d="M12 19V5"></path>
                          </svg>
                          8.2%
                        </span>
                        <span className="block font-medium text-lg text-gray-800 dark:text-neutral-200">
                          {selectedLocation.philippines
                            ? locationData.philippines[
                                selectedLocation.philippines as keyof typeof locationData.philippines
                              ].resolved
                            : locationData.philippines.Manila.resolved +
                              locationData.philippines.Bacolod.resolved}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 w-3 h-1.5 inline-block bg-amber-500 rounded-xs"></span>
                        <div className="grow">
                          <span className="block text-sm text-gray-500 dark:text-neutral-500">
                            Resolved
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* End Col */}
                  </div>
                  {/* End Grid */}

                  {/* Apex Line Chart */}
                  <ReactApexChart
                    options={philippinesOptions}
                    series={philippinesOptions.series}
                    type="bar"
                    height={200}
                  />
                </div>

                {/* Indonesia Chart */}
                <div className="p-4 flex flex-col bg-white border border-gray-200 dark:border-gray-700 dark:bg-neutral-800 rounded-lg shadow-sm dark:shadow-none">
                  {/* Select */}
                  <div>
                    <div className="relative inline-block">
                      <select
                        className="text-xs text-gray-800 dark:text-neutral-400 bg-transparent border-none focus:outline-none"
                        value={selectedLocation.indonesia}
                        onChange={(e) =>
                          setSelectedLocation((prev) => ({
                            ...prev,
                            indonesia: e.target.value,
                          }))
                        }
                      >
                        <option value="" disabled>
                          Select Location
                        </option>
                        <option value="Jakarta">Jakarta</option>
                        <option value="Bali">Bali</option>
                      </select>
                    </div>
                  </div>
                  {/* End Select */}

                  {/* Grid */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="block font-medium text-lg text-gray-800 dark:text-neutral-200">
                          {selectedLocation.indonesia
                            ? locationData.indonesia[
                                selectedLocation.indonesia as keyof typeof locationData.indonesia
                              ].created
                            : locationData.indonesia.Jakarta.created +
                              locationData.indonesia.Bali.created}
                        </span>
                        <span className="flex justify-center items-center gap-x-1 text-sm text-green-600 dark:text-green-500">
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 7-7 7 7"></path>
                            <path d="M12 19V5"></path>
                          </svg>
                          9.8%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 w-3 h-1.5 inline-block bg-blue-600 rounded-xs"></span>
                        <div className="grow">
                          <span className="block text-sm text-gray-500 dark:text-neutral-500">
                            Created
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* End Col */}

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="flex justify-center items-center gap-x-1 text-sm text-green-600 dark:text-green-500">
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 7-7 7 7"></path>
                            <path d="M12 19V5"></path>
                          </svg>
                          6.4%
                        </span>
                        <span className="block font-medium text-lg text-gray-800 dark:text-neutral-200">
                          {selectedLocation.indonesia
                            ? locationData.indonesia[
                                selectedLocation.indonesia as keyof typeof locationData.indonesia
                              ].resolved
                            : locationData.indonesia.Jakarta.resolved +
                              locationData.indonesia.Bali.resolved}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 w-3 h-1.5 inline-block bg-amber-500 rounded-xs"></span>
                        <div className="grow">
                          <span className="block text-sm text-gray-500 dark:text-neutral-500">
                            Resolved
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* End Col */}
                  </div>
                  {/* End Grid */}

                  {/* Apex Line Chart */}
                  <ReactApexChart
                    options={indonesiaOptions}
                    series={indonesiaOptions.series}
                    type="bar"
                    height={200}
                  />
                </div>

                {/* Singapore Chart */}
                <div className="p-4 flex flex-col bg-white border border-gray-200 dark:border-gray-700 dark:bg-neutral-800 rounded-lg shadow-sm dark:shadow-none">
                  {/* Select */}
                  <div>
                    <div className="relative inline-block">
                      <select
                        className="text-xs text-gray-800 dark:text-neutral-400 bg-transparent border-none focus:outline-none"
                        value={selectedLocation.singapore}
                        onChange={(e) =>
                          setSelectedLocation((prev) => ({
                            ...prev,
                            singapore: e.target.value,
                          }))
                        }
                      >
                        <option value="" disabled>
                          Select Location
                        </option>
                        <option value="Tampines">Tampines</option>
                      </select>
                    </div>
                  </div>
                  {/* End Select */}

                  {/* Grid */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="block font-medium text-lg text-gray-800 dark:text-neutral-200">
                          {selectedLocation.singapore
                            ? locationData.singapore[
                                selectedLocation.singapore as keyof typeof locationData.singapore
                              ].created
                            : locationData.singapore.Tampines.created}
                        </span>
                        <span className="flex justify-center items-center gap-x-1 text-sm text-green-600 dark:text-green-500">
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 7-7 7 7"></path>
                            <path d="M12 19V5"></path>
                          </svg>
                          3.2%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 w-3 h-1.5 inline-block bg-blue-600 rounded-xs"></span>
                        <div className="grow">
                          <span className="block text-sm text-gray-500 dark:text-neutral-500">
                            Created
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* End Col */}

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="flex justify-center items-center gap-x-1 text-sm text-green-600 dark:text-green-500">
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 7-7 7 7"></path>
                            <path d="M12 19V5"></path>
                          </svg>
                          2.1%
                        </span>
                        <span className="block font-medium text-lg text-gray-800 dark:text-neutral-200">
                          {selectedLocation.singapore
                            ? locationData.singapore[
                                selectedLocation.singapore as keyof typeof locationData.singapore
                              ].resolved
                            : locationData.singapore.Tampines.resolved}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 w-3 h-1.5 inline-block bg-amber-500 rounded-xs"></span>
                        <div className="grow">
                          <span className="block text-sm text-gray-500 dark:text-neutral-500">
                            Resolved
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* End Col */}
                  </div>
                  {/* End Grid */}

                  {/* Apex Line Chart */}
                  <ReactApexChart
                    options={singaporeOptions}
                    series={singaporeOptions.series}
                    type="bar"
                    height={200}
                  />
                </div>
              </div>

              {/* Bottom Row - Country Statistics Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-white uppercase bg-gray-700 dark:bg-gray-600">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 py-2 text-center border-r border-gray-600 dark:border-gray-500"
                        >
                          COUNTRY
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-center border-r border-gray-600 dark:border-gray-500"
                        >
                          LOCATION
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-center border-r border-gray-600 dark:border-gray-500"
                        >
                          TOTAL TICKET
                        </th>
                        <th scope="col" className="px-3 py-2 text-center">
                          PERCENTAGE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <th
                          scope="row"
                          className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center border-r border-gray-300 dark:border-gray-600"
                        >
                          Philippines
                        </th>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          Manila
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          200
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg
                              className="shrink-0 size-3 text-green-600 dark:text-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m5 12 7-7 7 7"></path>
                              <path d="M12 19V5"></path>
                            </svg>
                            <span className="text-xs font-medium text-green-600 dark:text-green-500">
                              66%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <th
                          scope="row"
                          className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center border-r border-gray-300 dark:border-gray-600"
                        >
                          Philippines
                        </th>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          Bacolod
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          218
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg
                              className="shrink-0 size-3 text-red-600 dark:text-red-500"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m19 12-7 7-7-7"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                            <span className="text-xs font-medium text-red-600 dark:text-red-500">
                              35%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <th
                          scope="row"
                          className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center border-r border-gray-300 dark:border-gray-600"
                        >
                          Indonesia
                        </th>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          Jakarta
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          142
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg
                              className="shrink-0 size-3 text-red-600 dark:text-red-500"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m19 12-7 7-7-7"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                            <span className="text-xs font-medium text-red-600 dark:text-red-500">
                              3%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <th
                          scope="row"
                          className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center border-r border-gray-300 dark:border-gray-600"
                        >
                          Indonesia
                        </th>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          Bali
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          95
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg
                              className="shrink-0 size-3 text-green-600 dark:text-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m5 12 7-7 7 7"></path>
                              <path d="M12 19V5"></path>
                            </svg>
                            <span className="text-xs font-medium text-green-600 dark:text-green-500">
                              8%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <th
                          scope="row"
                          className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center border-r border-gray-300 dark:border-gray-600"
                        >
                          Singapore
                        </th>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          Tampines
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                          89
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg
                              className="shrink-0 size-3 text-green-600 dark:text-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m5 12 7-7 7 7"></path>
                              <path d="M12 19V5"></path>
                            </svg>
                            <span className="text-xs font-medium text-green-600 dark:text-green-500">
                              2%
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tickets Table */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
            <div>
              <button
                id="dropdownRadioButton"
                data-dropdown-toggle="dropdownRadio"
                className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                type="button"
              >
                <svg
                  className="w-3 h-3 text-gray-500 dark:text-gray-400 me-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z" />
                </svg>
                Last 30 days
                <svg
                  className="w-2.5 h-2.5 ms-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              {/* Dropdown menu */}
              <div
                id="dropdownRadio"
                className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownRadioButton"
                >
                  <li>
                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input
                        id="filter-radio-example-1"
                        type="radio"
                        value=""
                        name="filter-radio"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="filter-radio-example-1"
                        className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                      >
                        Last day
                      </label>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input
                        defaultChecked
                        id="filter-radio-example-2"
                        type="radio"
                        value=""
                        name="filter-radio"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="filter-radio-example-2"
                        className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                      >
                        Last 7 days
                      </label>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input
                        id="filter-radio-example-3"
                        type="radio"
                        value=""
                        name="filter-radio"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="filter-radio-example-3"
                        className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                      >
                        Last 30 days
                      </label>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input
                        id="filter-radio-example-4"
                        type="radio"
                        value=""
                        name="filter-radio"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="filter-radio-example-4"
                        className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                      >
                        Last month
                      </label>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input
                        id="filter-radio-example-5"
                        type="radio"
                        value=""
                        name="filter-radio"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="filter-radio-example-5"
                        className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                      >
                        Last year
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <label htmlFor="table-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                id="table-search"
                className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search for tickets"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-300 dark:border-gray-600">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600"
                >
                  Ticket
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600"
                >
                  Requestor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600"
                >
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600"
                >
                  Assignee
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center border-r border-gray-300 dark:border-gray-600"
                >
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white border-r border-gray-300 dark:border-gray-600"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-950 dark:text-white">
                        {ticket.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {ticket.id}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                    <div className="group relative flex items-center justify-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {ticket.customer
                          .split(" ")
                          .map((name) => name[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        <div className="text-center">
                          <div className="font-medium">{ticket.customer}</div>
                          <div className="text-gray-300 dark:text-gray-600">
                            {ticket.email}
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                    <div className="w-full group relative">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            getStatusProgress(ticket.status).textColor
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            getStatusProgress(ticket.status).textColor
                          }`}
                        >
                          {getStatusProgress(ticket.status).progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getStatusProgress(ticket.status).color
                          }`}
                          style={{
                            width: `${
                              getStatusProgress(ticket.status).progress
                            }%`,
                          }}
                        ></div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        {getStatusProgress(ticket.status).tooltip}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                    <div className="group relative">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, index) => {
                            const severityData = getSeverityRating(
                              ticket.severity
                            );
                            const isFilled = index < severityData.value;
                            let starColor = "";

                            if (isFilled) {
                              // Apply severity-specific colors for filled stars
                              switch (ticket.severity) {
                                case "Critical":
                                  starColor = "text-red-500 fill-current";
                                  break;
                                case "Urgent":
                                  starColor = "text-red-500 fill-current";
                                  break;
                                case "High":
                                  starColor = "text-orange-500 fill-current";
                                  break;
                                case "Normal":
                                  starColor = "text-yellow-500 fill-current";
                                  break;
                                case "Low":
                                  starColor = "text-green-500 fill-current";
                                  break;
                                default:
                                  starColor = "text-gray-500 fill-current";
                              }
                            } else {
                              starColor = "text-gray-300 dark:text-gray-600";
                            }

                            return (
                              <svg
                                key={index}
                                className={`w-4 h-4 ${starColor}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        {getSeverityRating(ticket.severity).tooltip}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                    {ticket.category}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                    <div className="group relative flex items-center justify-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {ticket.assignee === "Unassigned"
                          ? "U"
                          : ticket.assignee
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .toUpperCase()}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        <div className="text-center">
                          <div className="font-medium">{ticket.assignee}</div>
                          <div className="text-gray-300 dark:text-gray-600">
                            {ticket.assignee === "Unassigned"
                              ? "No assignee"
                              : `${ticket.assignee
                                  .toLowerCase()
                                  .replace(" ", ".")}@company.com`}
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-300 dark:border-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {getRelativeTime(ticket.created, ticket.lastUpdate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Button */}
                      <button
                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                        title="View Ticket"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 494.907 494.907"
                          fill="currentColor"
                        >
                          <path
                            d="M70.571,459.196c-6.131,0-11.114-4.983-11.114-11.106V105.993c0-6.123,4.983-11.104,11.114-11.104H308.28
                          c6.131,0,11.115,4.98,11.115,11.104v147.911c10.565-3.519,21.644-5.855,33.132-6.844V105.993c0-24.396-19.849-44.236-44.247-44.236
                          H121.157V44.236c0-6.124,4.982-11.104,11.113-11.104h237.711c6.13,0,11.113,4.98,11.113,11.104V247.36
                          c11.517,1.279,22.586,4.013,33.131,7.839V44.236C414.225,19.841,394.378,0,369.981,0H132.27c-24.397,0-44.245,19.841-44.245,44.236
                          v17.521H70.571c-24.397,0-44.246,19.841-44.246,44.236V448.09c0,24.395,19.849,44.238,44.246,44.238h190.666
                          c-9.543-9.811-17.714-20.943-24.203-33.132H70.571z"
                          />
                          <path
                            d="M126.913,190.86h95.61c9.158,0,16.565-7.418,16.565-16.565c0-9.149-7.407-16.566-16.565-16.566h-95.61
                          c-9.153,0-16.561,7.418-16.561,16.566C110.352,183.442,117.759,190.86,126.913,190.86z"
                          />
                          <path
                            d="M268.514,247.846c0-9.148-7.407-16.566-16.566-16.566H126.913c-9.153,0-16.561,7.418-16.561,16.566
                          c0,9.149,7.407,16.566,16.561,16.566h125.035C261.107,264.412,268.514,256.995,268.514,247.846z"
                          />
                          <path
                            d="M249.055,304.808H126.913c-9.153,0-16.561,7.417-16.561,16.565c0,9.148,7.407,16.566,16.561,16.566h103.521
                          C235.172,326.022,241.483,314.926,249.055,304.808z"
                          />
                          <path
                            d="M126.913,378.342c-9.153,0-16.561,7.418-16.561,16.565c0,9.148,7.407,16.566,16.561,16.566h94.737
                          c-0.907-6.584-1.552-13.267-1.552-20.103c0-4.4,0.274-8.728,0.664-13.029H126.913z"
                          />
                          <path
                            d="M365.047,357.148c-28.438,0-53.614,23.563-63.545,34.223c9.931,10.655,35.107,34.209,63.545,34.209
                          c28.553,0,53.658-23.547,63.545-34.199C418.675,380.728,393.504,357.148,365.047,357.148z M365.047,416.22
                          c-13.718,0-24.846-11.128-24.846-24.849c0-13.732,11.128-24.847,24.846-24.847s24.846,11.114,24.846,24.847
                          C389.893,405.092,378.765,416.22,365.047,416.22z"
                          />
                          <path
                            d="M365.047,287.837c-57.186,0-103.536,46.349-103.536,103.534c0,57.173,46.35,103.536,103.536,103.536
                          c57.186,0,103.535-46.363,103.535-103.536C468.582,334.185,422.233,287.837,365.047,287.837z M365.047,442.143
                          c-44.681,0-79.594-43.791-81.064-45.652c-2.345-3.008-2.345-7.23,0-10.23c1.471-1.868,36.384-45.678,81.064-45.678
                          c44.679,0,79.592,43.809,81.064,45.678c2.345,3,2.345,7.223,0,10.23C444.639,398.353,409.726,442.143,365.047,442.143z"
                          />
                        </svg>
                      </button>

                      {/* Edit Button */}
                      <button
                        className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors duration-200"
                        title="Edit Ticket"
                        onClick={() => handleTicketUpdate(ticket.id)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 32 32"
                          fill="currentColor"
                        >
                          <path d="M12.965,5.462c0,-0 -2.584,0.004 -4.979,0.008c-3.034,0.006 -5.49,2.467 -5.49,5.5l0,13.03c0,1.459 0.579,2.858 1.611,3.889c1.031,1.032 2.43,1.611 3.889,1.611l13.003,0c3.038,-0 5.5,-2.462 5.5,-5.5c0,-2.405 0,-5.004 0,-5.004c0,-0.828 -0.672,-1.5 -1.5,-1.5c-0.827,-0 -1.5,0.672 -1.5,1.5l0,5.004c0,1.381 -1.119,2.5 -2.5,2.5l-13.003,0c-0.663,-0 -1.299,-0.263 -1.768,-0.732c-0.469,-0.469 -0.732,-1.105 -0.732,-1.768l0,-13.03c0,-1.379 1.117,-2.497 2.496,-2.5c2.394,-0.004 4.979,-0.008 4.979,-0.008c0.828,-0.002 1.498,-0.675 1.497,-1.503c-0.001,-0.828 -0.675,-1.499 -1.503,-1.497Z" />
                          <path d="M20.046,6.411l-6.845,6.846c-0.137,0.137 -0.232,0.311 -0.271,0.501l-1.081,5.152c-0.069,0.329 0.032,0.671 0.268,0.909c0.237,0.239 0.577,0.343 0.907,0.277l5.194,-1.038c0.193,-0.039 0.371,-0.134 0.511,-0.274l6.845,-6.845l-5.528,-5.528Zm1.415,-1.414l5.527,5.528l1.112,-1.111c1.526,-1.527 1.526,-4.001 -0,-5.527c-0.001,-0 -0.001,-0.001 -0.001,-0.001c-1.527,-1.526 -4.001,-1.526 -5.527,-0l-1.111,1.111Z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                        title="Delete Ticket"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 11V17" />
                          <path d="M14 11V17" />
                          <path d="M4 7H20" />
                          <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" />
                          <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination and Row Display */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Row Display Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              entries
            </span>
          </div>

          {/* Pagination Info */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredTickets.length)} of{" "}
            {filteredTickets.length} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Right Drawer for Detailed Stats */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detailed Statistics
                  </h3>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Total Tickets Detail */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Total Tickets
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {tickets.length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        All support requests across all locations and categories
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Created this month:</span>
                          <span className="font-medium">+12.5%</span>
                        </div>
                      </div>
                    </div>

                    {/* Open Tickets Detail */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-500">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Open Tickets
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {tickets.filter((t) => t.status === "Open").length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets awaiting initial response or assignment
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-red-600">
                            -8.2%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Detail */}
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cyan-500">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            In Progress
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                          {
                            tickets.filter((t) => t.status === "In Progress")
                              .length
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets currently being worked on by support team
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-green-600">
                            +15.3%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resolved Detail */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Resolved
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {
                            tickets.filter((t) => t.status === "Resolved")
                              .length
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets successfully resolved and closed
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-green-600">
                            +22.1%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pending Detail */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-yellow-500">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Pending
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {tickets.filter((t) => t.status === "Pending").length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets waiting for customer or initial review
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-green-600">
                            +5.2%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* On Hold Detail */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500">
                            <Pause className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            On Hold
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {tickets.filter((t) => t.status === "On Hold").length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets temporarily paused, waiting for 3rd party or
                        user
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-red-600">
                            -3.1%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Escalated Detail */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500">
                            <AlertTriangle className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Escalated
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {
                            tickets.filter((t) => t.status === "Escalated")
                              .length
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets moved to higher support level
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-green-600">
                            +18.7%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Closed Detail */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-500">
                            <X className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Closed
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {tickets.filter((t) => t.status === "Closed").length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets officially completed and archived
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-green-600">
                            +9.4%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cancelled Detail */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-400">
                            <Minus className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Cancelled
                          </h4>
                        </div>
                        <span className="text-2xl font-bold text-gray-500 dark:text-gray-500">
                          {
                            tickets.filter((t) => t.status === "Cancelled")
                              .length
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Tickets invalid or withdrawn by customer
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Change from last week:</span>
                          <span className="font-medium text-red-600">
                            -2.3%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Quick Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Avg. Response Time:
                          </span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            2.3 hours
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Resolution Rate:
                          </span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            87.5%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Customer Satisfaction:
                          </span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            4.8/5
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Active Agents:
                          </span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            12
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Request Modal */}
        {isNewRequestModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Create New Request
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-mono text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {newRequestForm.ticketNo}
                          </span>
                          {newRequestForm.severity && (
                            <div className="flex items-center gap-1">
                              <Flag className="w-3 h-3 text-red-500" />
                              <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                {newRequestForm.severity}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNewRequestModalOpen(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-160px)]">
                {/* Ticket Title Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Sprout className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Request Title
                    </h3>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter a clear, descriptive title for your request..."
                    value={newRequestForm.ticketTitle}
                    onChange={(e) =>
                      handleFormChange("ticketTitle", e.target.value)
                    }
                    className="w-full px-4 py-2 text-lg font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Request Date
                      </label>
                      <div className="relative max-w-sm">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                          </svg>
                        </div>
                        <input
                          id="datepicker-actions"
                          datepicker
                          datepicker-buttons
                          datepicker-autoselect-today
                          type="text"
                          value={newRequestForm.date}
                          onChange={(e) =>
                            handleFormChange("date", e.target.value)
                          }
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Select date"
                        />
                      </div>
                    </div>

                    {/* Requestor */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="text-red-500">*</span> Requestor
                        </label>
                        <button
                          onClick={handleRequestorReset}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Reset requestor selection"
                        >
                          <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* Dropdown Button */}
                      <button
                        id="dropdownSearchButton"
                        onClick={() =>
                          setIsRequestorDropdownOpen(!isRequestorDropdownOpen)
                        }
                        className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center w-full justify-between"
                        type="button"
                      >
                        {selectedRequestors.length === 0
                          ? "Select Requestor"
                          : selectedRequestors.length === 1
                          ? selectedRequestors[0]
                          : `${selectedRequestors.length} requestors selected`}
                        <svg
                          className="w-2.5 h-2.5 ms-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isRequestorDropdownOpen && (
                        <div className="z-10 bg-white rounded-lg shadow-sm w-full dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mt-2">
                          <div className="p-3">
                            <label
                              htmlFor="input-group-search"
                              className="sr-only"
                            >
                              Search
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                  />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="input-group-search"
                                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Search user"
                                value={requestorSearchTerm}
                                onChange={(e) =>
                                  handleRequestorSearch(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <ul
                            className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200"
                            aria-labelledby="dropdownSearchButton"
                          >
                            {filteredRequestors.map((requestor, index) => (
                              <li key={requestor}>
                                <div
                                  className={`flex items-center ps-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer py-2 ${
                                    selectedRequestors.includes(requestor)
                                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRequestorSelect(requestor)
                                  }
                                >
                                  <span className="text-sm font-medium">
                                    {requestor}
                                  </span>
                                  {selectedRequestors.includes(requestor) && (
                                    <svg
                                      className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Department */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <span className="text-red-500">*</span> Department
                      </label>
                      <select
                        value={newRequestForm.department}
                        onChange={(e) =>
                          handleFormChange("department", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Severity */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <Flag className="w-4 h-4 inline mr-2" />
                        <span className="text-red-500">*</span> Severity Level
                      </label>
                      <div className="relative">
                        <button
                          id="dropdownRadioHelperButton"
                          data-dropdown-toggle="dropdownRadioHelper"
                          onClick={() =>
                            setIsSeverityDropdownOpen(!isSeverityDropdownOpen)
                          }
                          className="w-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between border border-gray-200 dark:border-gray-600"
                          type="button"
                        >
                          {newRequestForm.severity || "Select Severity"}
                          <svg
                            className="w-2.5 h-2.5 ms-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m1 1 4 4 4-4"
                            />
                          </svg>
                        </button>

                        {/* Dropdown menu */}
                        {isSeverityDropdownOpen && (
                          <div
                            id="dropdownRadioHelper"
                            className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-full dark:bg-gray-700 dark:divide-gray-600 border border-gray-200 dark:border-gray-600 mt-1"
                          >
                            <ul
                              className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
                              aria-labelledby="dropdownRadioHelperButton"
                            >
                              {severityOptions.map((severity, index) => (
                                <li key={severity.value}>
                                  <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <div className="flex items-center h-5">
                                      <input
                                        id={`helper-radio-${index}`}
                                        name="helper-radio"
                                        type="radio"
                                        value={severity.value}
                                        checked={
                                          newRequestForm.severity ===
                                          severity.value
                                        }
                                        onChange={(e) => {
                                          handleFormChange(
                                            "severity",
                                            e.target.value
                                          );
                                          setIsSeverityDropdownOpen(false);
                                        }}
                                        className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                      />
                                    </div>
                                    <div className="ms-2 text-sm">
                                      <label
                                        htmlFor={`helper-radio-${index}`}
                                        className="font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                                      >
                                        <div>{severity.label}</div>
                                        <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                          {severity.description}
                                        </p>
                                      </label>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="text-red-500">*</span> Category
                        </label>
                        <button
                          onClick={handleCategoryReset}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Reset category selection"
                        >
                          <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* Dropdown Button */}
                      <button
                        onClick={() =>
                          setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                        }
                        className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center w-full justify-between"
                        type="button"
                      >
                        {selectedCategories.length === 0
                          ? "Select Category"
                          : selectedCategories.length === 1
                          ? selectedCategories[0]
                          : `${selectedCategories.length} categories selected`}
                        <svg
                          className="w-2.5 h-2.5 ms-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isCategoryDropdownOpen && (
                        <div className="z-10 bg-white rounded-lg shadow-sm w-full dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mt-2">
                          <div className="p-3">
                            <label
                              htmlFor="category-search"
                              className="sr-only"
                            >
                              Search
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                  />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="category-search"
                                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Search category"
                                value={categorySearchTerm}
                                onChange={(e) =>
                                  handleCategorySearch(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200">
                            {filteredCategories.map((category, index) => (
                              <li key={category}>
                                <div
                                  className={`flex items-center ps-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer py-2 ${
                                    selectedCategories.includes(category)
                                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                      : ""
                                  }`}
                                  onClick={() => handleCategorySelect(category)}
                                >
                                  <span className="text-sm font-medium">
                                    {category}
                                  </span>
                                  {selectedCategories.includes(category) && (
                                    <svg
                                      className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Request Description
                    </h3>
                    <span className="text-red-500 text-sm">*</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Provide detailed information about your request. Use the
                    formatting tools below to structure your content.
                  </p>

                  {/* Enhanced Tiptap Rich Text Editor */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden dark:bg-gray-800 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div id="hs-editor-tiptap-blockquote-alt">
                      <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex align-middle gap-x-1 border-b border-gray-200 dark:border-gray-600 p-3">
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-bold=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 12a4 4 0 0 0 0-8H6v8"></path>
                            <path d="M15 20a4 4 0 0 0 0-8H6v8Z"></path>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-italic=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="19" x2="10" y1="4" y2="4"></line>
                            <line x1="14" x2="5" y1="20" y2="20"></line>
                            <line x1="15" x2="9" y1="4" y2="20"></line>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-underline=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 4v6a6 6 0 0 0 12 0V4"></path>
                            <line x1="4" x2="20" y1="20" y2="20"></line>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-strike=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 4H9a3 3 0 0 0-2.83 4"></path>
                            <path d="M14 12a4 4 0 0 1 0 8H6"></path>
                            <line x1="4" x2="20" y1="12" y2="12"></line>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-link=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-ol=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="10" x2="21" y1="6" y2="6"></line>
                            <line x1="10" x2="21" y1="12" y2="12"></line>
                            <line x1="10" x2="21" y1="18" y2="18"></line>
                            <path d="M4 6h1v4"></path>
                            <path d="M4 10h2"></path>
                            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-ul=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="8" x2="21" y1="6" y2="6"></line>
                            <line x1="8" x2="21" y1="12" y2="12"></line>
                            <line x1="8" x2="21" y1="18" y2="18"></line>
                            <line x1="3" x2="3.01" y1="6" y2="6"></line>
                            <line x1="3" x2="3.01" y1="12" y2="12"></line>
                            <line x1="3" x2="3.01" y1="18" y2="18"></line>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-blockquote=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 6H3"></path>
                            <path d="M21 12H8"></path>
                            <path d="M21 18H8"></path>
                            <path d="M3 12v6"></path>
                          </svg>
                        </button>
                        <button
                          className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                          type="button"
                          data-hs-editor-code=""
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m18 16 4-4-4-4"></path>
                            <path d="m6 8-4 4 4 4"></path>
                            <path d="m14.5 4-5 16"></path>
                          </svg>
                        </button>

                        {/* Emoji Button - Last in toolbar */}
                        <div className="relative emoji-picker-container">
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                            type="button"
                          >
                            <Smile className="shrink-0 size-4" />
                          </button>

                          {/* Emoji Picker - Forward positioned and wider for all emoji types */}
                          {showEmojiPicker && (
                            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-y-auto z-50">
                              <div className="grid grid-cols-12 gap-1">
                                {emojiOptions
                                  .slice(0, 120)
                                  .map((emoji, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleEmojiClick(emoji)}
                                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg flex items-center justify-center"
                                      title={emoji}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                              </div>
                              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => setShowEmojiPicker(false)}
                                  className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="h-36 overflow-auto p-3 bg-white dark:bg-gray-800"
                        data-hs-editor-field=""
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-red-500">*</span> Required fields
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsNewRequestModalOpen(false)}
                      className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitRequest}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketGallery;
