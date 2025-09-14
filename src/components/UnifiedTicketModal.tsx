import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  AlertTriangle,
  X,
  MessageSquare,
  Save,
  User,
  Building,
  Tag,
  UserCheck,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Pause,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  customer: string;
  status: string;
  priority: string;
  severity: string;
  assignee: string;
  department: string;
  category: string;
  branch: string;
  createdDate: Date;
  lastUpdateDate: Date;
  description: string;
  escalate?: string;
}

interface UnifiedTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "new" | "edit" | "escalate";
  selectedTicket?: Ticket | null;
  templateData?: any;
  onSubmit: (data: any, mode: string) => void;
}

const UnifiedTicketModal: React.FC<UnifiedTicketModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedTicket,
  templateData,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<"new" | "edit" | "escalate">(mode);
  const [formData, setFormData] = useState({
    ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    requestor: "",
    department: "",
    ticketTitle: "",
    category: "",
    severity: "",
    assignee: "",
    branch: "",
    description: "",
    status: "",
    priority: "",
    escalate: "",
  });

  // Dropdown states
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [isRequestorDropdownOpen, setIsRequestorDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Search states
  const [isRequestorSearchOpen, setIsRequestorSearchOpen] = useState(false);
  const [isDepartmentSearchOpen, setIsDepartmentSearchOpen] = useState(false);
  const [isCategorySearchOpen, setIsCategorySearchOpen] = useState(false);
  const [isAssigneeSearchOpen, setIsAssigneeSearchOpen] = useState(false);
  const [isBranchSearchOpen, setIsBranchSearchOpen] = useState(false);

  // Search terms
  const [requestorSearchTerm, setRequestorSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");

  // Options data
  const departmentOptions = [
    "IT Support",
    "Human Resources",
    "Finance",
    "Operations",
    "Customer Service",
    "Marketing",
    "Sales",
    "Legal",
    "Administration",
  ];

  const categoryOptions = [
    "Hardware Issue",
    "Software Problem",
    "Network Connectivity",
    "Email Issue",
    "Password Reset",
    "Account Access",
    "System Performance",
    "Data Recovery",
    "Security Concern",
    "Training Request",
    "Equipment Request",
    "General Inquiry",
  ];

  const severityOptions = [
    { value: "Low", label: "Low", color: "text-green-600", bg: "bg-green-100" },
    {
      value: "Medium",
      label: "Medium",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      value: "High",
      label: "High",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      value: "Critical",
      label: "Critical",
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  const requestorOptions = [
    "John Smith",
    "Sarah Johnson",
    "Mike Wilson",
    "Emily Davis",
    "David Brown",
    "Lisa Anderson",
    "Tom Miller",
    "Jennifer Taylor",
  ];

  const assigneeOptions = [
    "Alex Chen",
    "Maria Rodriguez",
    "James Wilson",
    "Sarah Kim",
    "David Thompson",
    "Lisa Park",
    "Tom Anderson",
    "Jennifer Lee",
  ];

  const branchOptions = ["Manila", "Bacolod", "Jakarta", "Bali", "Singapore"];

  const statusOptions = [
    { value: "Open", label: "Open", color: "text-blue-600", bg: "bg-blue-100" },
    {
      value: "In Progress",
      label: "In Progress",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      value: "Resolved",
      label: "Resolved",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      value: "Closed",
      label: "Closed",
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    {
      value: "Escalated",
      label: "Escalated",
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      value: "On Hold",
      label: "On Hold",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  const priorityOptions = [
    { value: "Low", label: "Low", color: "text-green-600", bg: "bg-green-100" },
    {
      value: "Medium",
      label: "Medium",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      value: "High",
      label: "High",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      value: "Urgent",
      label: "Urgent",
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  const escalateOptions = [
    "Level 1 Support",
    "Level 2 Support",
    "Level 3 Support",
    "Management",
    "External Vendor",
  ];

  // Update form data when selectedTicket, templateData, or activeTab changes
  useEffect(() => {
    if (selectedTicket && activeTab === "edit") {
      setFormData({
        ticketNo: selectedTicket.id,
        date: selectedTicket.createdDate.toISOString().split("T")[0],
        requestor: selectedTicket.customer,
        department: selectedTicket.department,
        ticketTitle: selectedTicket.title,
        category: selectedTicket.category,
        severity: selectedTicket.severity,
        assignee: selectedTicket.assignee,
        branch: selectedTicket.branch,
        description: selectedTicket.description,
        status: selectedTicket.status,
        priority: selectedTicket.priority,
        escalate: selectedTicket.escalate || "",
      });
    } else if (activeTab === "new") {
      // Check if we have template data to pre-fill
      if (templateData) {
        setFormData({
          ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().split("T")[0],
          requestor: templateData.requestor || "",
          department: templateData.department || "",
          ticketTitle: templateData.ticketTitle || "",
          category: templateData.category || "",
          severity: templateData.severity || "",
          assignee: templateData.assignee || "",
          branch: templateData.branch || "",
          description: templateData.description || "",
          status: "Open",
          priority: "Medium",
          escalate: "",
        });
      } else {
        setFormData({
          ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().split("T")[0],
          requestor: "",
          department: "",
          ticketTitle: "",
          category: "",
          severity: "",
          assignee: "",
          branch: "",
          description: "",
          status: "Open",
          priority: "Medium",
          escalate: "",
        });
      }
    } else if (activeTab === "escalate" && selectedTicket) {
      setFormData({
        ticketNo: selectedTicket.id,
        date: selectedTicket.createdDate.toISOString().split("T")[0],
        requestor: selectedTicket.customer,
        department: selectedTicket.department,
        ticketTitle: selectedTicket.title,
        category: selectedTicket.category,
        severity: selectedTicket.severity,
        assignee: selectedTicket.assignee,
        branch: selectedTicket.branch,
        description: selectedTicket.description,
        status: "Escalated",
        priority: selectedTicket.priority,
        escalate: "Level 2 Support",
      });
    }
  }, [selectedTicket, activeTab, templateData]);

  // Update active tab when mode changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest("#dropdownDepartmentRadio") &&
        !target.closest("#dropdownRequestorRadio") &&
        !target.closest("#dropdownCategoryRadio") &&
        !target.closest("#dropdownAssigneeRadio") &&
        !target.closest("#dropdownBranchRadio")
      ) {
        setIsDepartmentDropdownOpen(false);
        setIsRequestorDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsAssigneeDropdownOpen(false);
        setIsBranchDropdownOpen(false);
        setIsRequestorSearchOpen(false);
        setIsDepartmentSearchOpen(false);
        setIsCategorySearchOpen(false);
        setIsAssigneeSearchOpen(false);
        setIsBranchSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, activeTab);
    onClose();
  };

  const handleClearForm = () => {
    setFormData({
      ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      requestor: "",
      department: "",
      ticketTitle: "",
      category: "",
      severity: "",
      assignee: "",
      branch: "",
      description: "",
      status: activeTab === "new" ? "Open" : formData.status,
      priority: activeTab === "new" ? "Medium" : formData.priority,
      escalate: "",
    });

    // Clear search terms
    setRequestorSearchTerm("");
    setDepartmentSearchTerm("");
    setCategorySearchTerm("");
    setAssigneeSearchTerm("");
    setBranchSearchTerm("");

    // Close all dropdowns
    setIsDepartmentDropdownOpen(false);
    setIsRequestorDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsAssigneeDropdownOpen(false);
    setIsBranchDropdownOpen(false);
    setIsRequestorSearchOpen(false);
    setIsDepartmentSearchOpen(false);
    setIsCategorySearchOpen(false);
    setIsAssigneeSearchOpen(false);
    setIsBranchSearchOpen(false);
  };

  const getModalTitle = () => {
    switch (activeTab) {
      case "new":
        return "New Ticket Request";
      case "edit":
        return "Edit Ticket";
      case "escalate":
        return "Escalate Ticket";
      default:
        return "Ticket Management";
    }
  };

  const getModalIcon = () => {
    switch (activeTab) {
      case "new":
        return <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "edit":
        return <Edit3 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "escalate":
        return (
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        );
      default:
        return (
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        );
    }
  };

  const getModalIconBg = () => {
    switch (activeTab) {
      case "new":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "edit":
        return "bg-green-100 dark:bg-green-900/30";
      case "escalate":
        return "bg-red-100 dark:bg-red-900/30";
      default:
        return "bg-blue-100 dark:bg-blue-900/30";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto scrollbar-hide"
      role="dialog"
      tabIndex={-1}
      aria-labelledby="unified-modal-label"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity overflow-hidden"></div>
      <div className="relative min-h-screen flex items-start justify-center p-4">
        <div className="w-full max-w-4xl mt-4 opacity-100 duration-500 ease-out transition-all">
          <div className="w-full flex flex-col bg-white border border-gray-200 shadow-2xl rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
            {/* Modal Header */}
            <div className="flex justify-between items-center py-2 px-4 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 ${getModalIconBg()} rounded-lg`}>
                    {getModalIcon()}
                  </div>
                  <div>
                    <h1
                      id="unified-modal-label"
                      className="font-bold text-gray-800 dark:text-white"
                      style={{ fontSize: "18pt" }}
                    >
                      {getModalTitle()}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        TICKET NO.
                      </span>
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-700/60 px-2 py-1 rounded border border-gray-200/50 dark:border-gray-600/50">
                        {formData.ticketNo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
                aria-label="Close"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="shrink-0 size-4" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "new"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Request
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "edit"
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-green-50/50 dark:bg-green-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Ticket
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("escalate")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "escalate"
                    ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 bg-red-50/50 dark:bg-red-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Escalate
                </div>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Requestor */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 inline mr-2" />
                      Requestor
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.requestor}
                        onChange={(e) =>
                          handleFormChange("requestor", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter requestor name"
                        required
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Building className="w-4 h-4 inline mr-2" />
                      Department
                    </label>
                    <div className="relative" id="dropdownDepartmentRadio">
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white flex items-center justify-between"
                        onClick={() =>
                          setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
                        }
                      >
                        <span
                          className={
                            formData.department
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500"
                          }
                        >
                          {formData.department || "Select Department"}
                        </span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isDepartmentDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {departmentOptions.map((dept, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                              onClick={() => {
                                handleFormChange("department", dept);
                                setIsDepartmentDropdownOpen(false);
                              }}
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Title */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Ticket Title
                    </label>
                    <input
                      type="text"
                      value={formData.ticketTitle}
                      onChange={(e) =>
                        handleFormChange("ticketTitle", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter ticket title"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Tag className="w-4 h-4 inline mr-2" />
                      Category
                    </label>
                    <div className="relative" id="dropdownCategoryRadio">
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white flex items-center justify-between"
                        onClick={() =>
                          setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                        }
                      >
                        <span
                          className={
                            formData.category
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500"
                          }
                        >
                          {formData.category || "Select Category"}
                        </span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isCategoryDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {categoryOptions.map((category, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                              onClick={() => {
                                handleFormChange("category", category);
                                setIsCategoryDropdownOpen(false);
                              }}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Severity
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {severityOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="severity"
                            value={option.value}
                            checked={formData.severity === option.value}
                            onChange={(e) =>
                              handleFormChange("severity", e.target.value)
                            }
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className={`text-sm font-medium ${option.color}`}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <UserCheck className="w-4 h-4 inline mr-2" />
                      Assignee
                    </label>
                    <div className="relative" id="dropdownAssigneeRadio">
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white flex items-center justify-between"
                        onClick={() =>
                          setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)
                        }
                      >
                        <span
                          className={
                            formData.assignee
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500"
                          }
                        >
                          {formData.assignee || "Select Assignee"}
                        </span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isAssigneeDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {assigneeOptions.map((assignee, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                              onClick={() => {
                                handleFormChange("assignee", assignee);
                                setIsAssigneeDropdownOpen(false);
                              }}
                            >
                              {assignee}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Branch
                    </label>
                    <div className="relative" id="dropdownBranchRadio">
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white flex items-center justify-between"
                        onClick={() =>
                          setIsBranchDropdownOpen(!isBranchDropdownOpen)
                        }
                      >
                        <span
                          className={
                            formData.branch
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500"
                          }
                        >
                          {formData.branch || "Select Branch"}
                        </span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isBranchDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {branchOptions.map((branch, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                              onClick={() => {
                                handleFormChange("branch", branch);
                                setIsBranchDropdownOpen(false);
                              }}
                            >
                              {branch}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Priority (for Edit and Escalate modes) */}
                {(activeTab === "edit" || activeTab === "escalate") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="status"
                              value={option.value}
                              checked={formData.status === option.value}
                              onChange={(e) =>
                                handleFormChange("status", e.target.value)
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={`text-sm font-medium ${option.color}`}
                            >
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Priority
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {priorityOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="priority"
                              value={option.value}
                              checked={formData.priority === option.value}
                              onChange={(e) =>
                                handleFormChange("priority", e.target.value)
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={`text-sm font-medium ${option.color}`}
                            >
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Escalate Level (for Escalate mode) */}
                {activeTab === "escalate" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      Escalate To
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {escalateOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="escalate"
                            value={option}
                            checked={formData.escalate === option}
                            onChange={(e) =>
                              handleFormChange("escalate", e.target.value)
                            }
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter detailed description of the issue"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-neutral-700">
                  {/* Clear Button - Only show for new ticket */}
                  {activeTab === "new" && (
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Clear All
                    </button>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        activeTab === "new"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : activeTab === "edit"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {activeTab === "new"
                        ? "Create Ticket"
                        : activeTab === "edit"
                        ? "Update Ticket"
                        : "Escalate Ticket"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedTicketModal;
