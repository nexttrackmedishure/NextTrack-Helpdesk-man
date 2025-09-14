import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Calendar,
  User,
  Building,
  Tag,
  AlertTriangle,
  Clock,
  FileText,
  Monitor,
  Wifi,
  HardDrive,
  Smartphone,
  Printer,
  Mail,
  Save,
  Send,
  Upload,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface ITSupportTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (ticketData: any) => void;
}

interface TicketFormData {
  ticketNo: string;
  date: string;
  requestor: string;
  department: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  affectedSystem: string;
  errorMessage: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  attachments: File[];
  contactMethod: string;
  urgency: string;
}

const ITSupportTicketForm: React.FC<ITSupportTicketFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // Form state
  const [formData, setFormData] = useState<TicketFormData>({
    ticketNo: `IT-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    requestor: '',
    department: '',
    category: '',
    subcategory: '',
    title: '',
    description: '',
    affectedSystem: '',
    errorMessage: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    attachments: [],
    contactMethod: '',
    urgency: ''
  });

  // Dropdown states
  const [isRequestorOpen, setIsRequestorOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);
  const [isContactMethodOpen, setIsContactMethodOpen] = useState(false);

  // Options
  const requestorOptions = [
    'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson',
    'Lisa Brown', 'Robert Taylor', 'Jennifer Garcia', 'Michael Martinez', 'Amanda Anderson'
  ];

  const departmentOptions = [
    'IT Department', 'Human Resources', 'Finance', 'Marketing', 'Sales',
    'Operations', 'Customer Service', 'Legal', 'Administration', 'Research & Development'
  ];

  const categoryOptions = [
    { value: 'hardware', label: 'Hardware Issues', icon: Monitor },
    { value: 'software', label: 'Software Problems', icon: FileText },
    { value: 'network', label: 'Network & Connectivity', icon: Wifi },
    { value: 'email', label: 'Email & Communication', icon: Mail },
    { value: 'printer', label: 'Printer & Printing', icon: Printer },
    { value: 'mobile', label: 'Mobile Devices', icon: Smartphone },
    { value: 'storage', label: 'Data Storage', icon: HardDrive },
    { value: 'other', label: 'Other IT Issues', icon: AlertCircle }
  ];

  const subcategoryOptions: { [key: string]: string[] } = {
    hardware: ['Desktop Computer', 'Laptop', 'Monitor', 'Keyboard/Mouse', 'Other Hardware'],
    software: ['Operating System', 'Application Software', 'Browser Issues', 'Installation Problems', 'Other Software'],
    network: ['Internet Connection', 'WiFi Issues', 'VPN Problems', 'Network Access', 'Other Network'],
    email: ['Email Access', 'Email Client', 'Spam/Phishing', 'Email Delivery', 'Other Email'],
    printer: ['Printer Setup', 'Print Quality', 'Paper Jams', 'Driver Issues', 'Other Printing'],
    mobile: ['Phone Setup', 'App Issues', 'Sync Problems', 'Device Configuration', 'Other Mobile'],
    storage: ['File Access', 'Backup Issues', 'Storage Space', 'Data Recovery', 'Other Storage'],
    other: ['Account Issues', 'Password Reset', 'Access Rights', 'System Performance', 'Other Issues']
  };



  const contactMethodOptions = [
    'Email', 'Phone', 'Teams Chat', 'In-Person', 'Any Method'
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low', description: 'Can wait 1-2 business days' },
    { value: 'medium', label: 'Medium', description: 'Needs attention within 24 hours' },
    { value: 'high', label: 'High', description: 'Needs immediate attention' },
    { value: 'urgent', label: 'Urgent', description: 'Business critical - immediate response required' }
  ];

  // Handle form changes
  const handleFormChange = (field: keyof TicketFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: ''
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('IT Support Ticket Data:', formData);
    onSubmit?.(formData);
    onClose();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsRequestorOpen(false);
      setIsDepartmentOpen(false);
      setIsCategoryOpen(false);
      setIsSubcategoryOpen(false);
      setIsContactMethodOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
      <div className="relative min-h-screen flex items-start justify-center p-4">
        <div className="w-full max-w-6xl mt-4 opacity-100 duration-500 ease-out transition-all">
          <div className="w-full flex flex-col bg-white border border-gray-200 shadow-2xl rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                      IT Support Ticket Request
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {formData.ticketNo}
                      </span>
                      {formData.urgency && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                            {formData.urgency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[85vh] scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-violet-900 hover:scrollbar-thumb-violet-500">
              
              {/* Ticket Title */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Issue Summary
                  </h3>
                </div>
                <input
                  type="text"
                  placeholder="Briefly describe the IT issue you're experiencing..."
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white placeholder-primary-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Left Column */}
                <div className="space-y-4">
                  
                  {/* Date */}
                  <div className="bg-primary-50 dark:bg-dark-700/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Request Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Requestor */}
                  <div className="bg-primary-50 dark:bg-dark-700/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      <span className="text-red-500">*</span> Requestor
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRequestorOpen(!isRequestorOpen);
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
                      >
                        {formData.requestor || "Select Requestor"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isRequestorOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg shadow-lg">
                          {requestorOptions.map((requestor) => (
                            <button
                              key={requestor}
                              type="button"
                              onClick={() => {
                                handleFormChange('requestor', requestor);
                                setIsRequestorOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-600 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {requestor}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Department */}
                  <div className="bg-primary-50 dark:bg-dark-700/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      <span className="text-red-500">*</span> Department
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDepartmentOpen(!isDepartmentOpen);
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
                      >
                        {formData.department || "Select Department"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isDepartmentOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg shadow-lg">
                          {departmentOptions.map((dept) => (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => {
                                handleFormChange('department', dept);
                                setIsDepartmentOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-600 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="bg-primary-50 dark:bg-dark-700/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      <Tag className="w-4 h-4 inline mr-2" />
                      <span className="text-red-500">*</span> Category
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCategoryOpen(!isCategoryOpen);
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
                      >
                        {formData.category ? categoryOptions.find(c => c.value === formData.category)?.label : "Select Category"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isCategoryOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg shadow-lg">
                          {categoryOptions.map((category) => (
                            <button
                              key={category.value}
                              type="button"
                              onClick={() => {
                                handleFormChange('category', category.value);
                                setIsCategoryOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-600 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <category.icon className="w-4 h-4" />
                              {category.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subcategory */}
                  {formData.category && (
                    <div className="bg-primary-50 dark:bg-dark-700/50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Subcategory
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSubcategoryOpen(!isSubcategoryOpen);
                          }}
                          className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
                        >
                          {formData.subcategory || "Select Subcategory"}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isSubcategoryOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg shadow-lg">
                            {subcategoryOptions[formData.category]?.map((sub) => (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => {
                                  handleFormChange('subcategory', sub);
                                  setIsSubcategoryOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-600 first:rounded-t-lg last:rounded-b-lg"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  


                  {/* Urgency */}
                  <div className="bg-primary-50 dark:bg-dark-700/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Urgency Level
                    </label>
                    <div className="space-y-2">
                      {urgencyOptions.map((urgency) => (
                        <label key={urgency.value} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-dark-600 cursor-pointer">
                          <input
                            type="radio"
                            name="urgency"
                            value={urgency.value}
                            checked={formData.urgency === urgency.value}
                            onChange={(e) => handleFormChange('urgency', e.target.value)}
                            className="mt-1 w-4 h-4 text-primary-600 bg-primary-100 border-primary-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-dark-700 dark:focus:ring-offset-dark-700 focus:ring-2 dark:bg-dark-600 dark:border-dark-500"
                          />
                          <div>
                            <div className="font-medium text-sm text-dark-900 dark:text-dark-300">{urgency.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{urgency.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Method */}
                  <div className="bg-primary-50 dark:bg-dark-700/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Preferred Contact Method
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsContactMethodOpen(!isContactMethodOpen);
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
                      >
                        {formData.contactMethod || "Select Contact Method"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isContactMethodOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg shadow-lg">
                          {contactMethodOptions.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                handleFormChange('contactMethod', method);
                                setIsContactMethodOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-600 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Detailed Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detailed Description
                  </h3>
                </div>
                <textarea
                  placeholder="Please provide a detailed description of the issue, including any error messages, what you were trying to do when the problem occurred, and any steps you've already tried to resolve it..."
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 text-sm font-medium bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white placeholder-primary-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  required
                />
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Affected System */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <Monitor className="w-4 h-4 inline mr-2" />
                    Affected System/Device
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Windows 10 PC, iPhone 12, Office 365, etc."
                    value={formData.affectedSystem}
                    onChange={(e) => handleFormChange('affectedSystem', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white placeholder-primary-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Error Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Error Message (if any)
                  </label>
                  <input
                    type="text"
                    placeholder="Copy and paste any error messages here..."
                    value={formData.errorMessage}
                    onChange={(e) => handleFormChange('errorMessage', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white placeholder-primary-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

              </div>

              {/* Steps to Reproduce */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <Info className="w-4 h-4 inline mr-2" />
                  Steps to Reproduce the Issue
                </label>
                <textarea
                  placeholder="1. First step...&#10;2. Second step...&#10;3. Third step...&#10;&#10;What happens at each step?"
                  value={formData.stepsToReproduce}
                  onChange={(e) => handleFormChange('stepsToReproduce', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white placeholder-primary-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Expected vs Actual Behavior */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Expected Behavior */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Expected Behavior
                  </label>
                  <textarea
                    placeholder="What should happen when you perform these steps?"
                    value={formData.expectedBehavior}
                    onChange={(e) => handleFormChange('expectedBehavior', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white placeholder-primary-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Actual Behavior */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Actual Behavior
                  </label>
                  <textarea
                    placeholder="What actually happens instead?"
                    value={formData.actualBehavior}
                    onChange={(e) => handleFormChange('actualBehavior', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600 rounded-lg text-dark-900 dark:text-white placeholder-primary-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

              </div>

              {/* File Attachments */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.log"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload files or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Screenshots, error logs, or other relevant files
                    </span>
                  </label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newAttachments = formData.attachments.filter((_, i) => i !== index);
                            handleFormChange('attachments', newAttachments);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITSupportTicketForm;
