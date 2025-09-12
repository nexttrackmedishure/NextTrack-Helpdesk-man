import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Building,
  Tag,
  Clock,
  MessageSquare,
  Send,
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
  Info,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Subscript,
  Superscript
} from 'lucide-react';

interface NewTicketRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (ticketData: any) => void;
}

interface TicketFormData {
  ticketNo: string;
  issueSummary: string;
  requestDate: string;
  requestor: string;
  department: string;
  category: string;
  urgency: string;
  contactMethod: string;
  assignee: string;
  description: string;
  attachments: File[];
}

const NewTicketRequestForm: React.FC<NewTicketRequestFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // Form state
  const [formData, setFormData] = useState<TicketFormData>({
    ticketNo: `TKT-${Date.now().toString().slice(-6)}`,
    issueSummary: '',
    requestDate: new Date().toISOString().split('T')[0],
    requestor: '',
    department: '',
    category: '',
    urgency: 'low',
    contactMethod: '',
    assignee: '',
    description: '',
    attachments: []
  });

  // Dropdown states
  const [isRequestorOpen, setIsRequestorOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isContactMethodOpen, setIsContactMethodOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  // Rich text editor ref
  const editorRef = useRef<HTMLDivElement>(null);

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
    'Hardware Issues', 'Software Problems', 'Network & Connectivity', 
    'Email & Communication', 'Printer & Printing', 'Mobile Devices',
    'Data Storage', 'Account Issues', 'Other IT Issues'
  ];

  const contactMethodOptions = [
    'Email', 'Phone', 'Teams Chat', 'In-Person', 'Any Method'
  ];

  const assigneeOptions = [
    'IT Support Team', 'Network Administrator', 'System Administrator',
    'Help Desk Specialist', 'Technical Support', 'IT Manager'
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
  };

  // Rich text editor functions
  const handleRichTextCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleRichTextChange = () => {
    if (editorRef.current) {
      setFormData(prev => ({
        ...prev,
        description: editorRef.current?.innerHTML || ''
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
    console.log('New Ticket Request Data:', formData);
    onSubmit?.(formData);
    onClose();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsRequestorOpen(false);
      setIsDepartmentOpen(false);
      setIsCategoryOpen(false);
      setIsContactMethodOpen(false);
      setIsAssigneeOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Initialize editor when modal opens
  useEffect(() => {
    if (isOpen && editorRef.current) {
      // Set proper text direction
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.style.unicodeBidi = 'normal';
      editorRef.current.style.writingMode = 'horizontal-tb';
      
      if (formData.description) {
        editorRef.current.innerHTML = formData.description;
      }
    }
  }, [isOpen, formData.description]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-7xl opacity-100 duration-500 ease-out transition-all">
          <div className="w-full flex flex-col bg-white border border-gray-200/50 shadow-2xl rounded-2xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700/50 dark:shadow-neutral-900/50 backdrop-blur-sm max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-gray-800/80 dark:to-gray-700/80 py-3 px-4 sm:px-6 border-b border-gray-200/50 dark:border-neutral-700/50 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg shadow-sm">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg sm:text-xl">
                      New Ticket Request
                    </h3>
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
                <button
                  type="button"
                  className="size-8 inline-flex justify-center items-center gap-x-2 rounded-lg border border-transparent bg-white/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex-1 overflow-hidden">
              
              {/* Issue Summary - Full Width */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 tracking-wide">
                  Issue Summary
                </label>
                <input
                  type="text"
                  placeholder="Briefly describe the IT issue you're experiencing..."
                  value={formData.issueSummary}
                  onChange={(e) => handleFormChange('issueSummary', e.target.value)}
                  className="w-full h-8 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  required
                />
              </div>
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 flex-1">
                
                {/* Left Column */}
                <div className="space-y-2">

                  {/* Request Date */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1 tracking-wide">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Request Date
                    </label>
                    <input
                      type="date"
                      value={formData.requestDate}
                      onChange={(e) => handleFormChange('requestDate', e.target.value)}
                      className="w-full h-8 px-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>

                  {/* Requestor */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1 tracking-wide">
                      <User className="w-4 h-4 inline mr-2" />
                      * Requestor
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRequestorOpen(!isRequestorOpen);
                        }}
                        className="w-full h-8 text-left px-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {formData.requestor || "Select Requestor"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isRequestorOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                          {requestorOptions.map((requestor) => (
                            <button
                              key={requestor}
                              type="button"
                              onClick={() => {
                                handleFormChange('requestor', requestor);
                                setIsRequestorOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <User className="w-4 h-4" />
                              {requestor}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Department */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1 tracking-wide">
                      <Building className="w-4 h-4 inline mr-2" />
                      * Department
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDepartmentOpen(!isDepartmentOpen);
                        }}
                        className="w-full h-8 text-left px-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {formData.department || "Select Department"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isDepartmentOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                          {departmentOptions.map((dept) => (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => {
                                handleFormChange('department', dept);
                                setIsDepartmentOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <Building className="w-4 h-4" />
                              {dept}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1 tracking-wide">
                      <Tag className="w-4 h-4 inline mr-2" />
                      * Category
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCategoryOpen(!isCategoryOpen);
                        }}
                        className="w-full h-8 text-left px-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {formData.category || "Select Category"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isCategoryOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                          {categoryOptions.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                handleFormChange('category', category);
                                setIsCategoryOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <Tag className="w-4 h-4" />
                              {category}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1 tracking-wide">
                      <User className="w-4 h-4 inline mr-2" />
                      * Assignee
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAssigneeOpen(!isAssigneeOpen);
                        }}
                        className="w-full h-8 text-left px-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {formData.assignee || "Select IT Support"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isAssigneeOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                          {assigneeOptions.map((assignee) => (
                            <button
                              key={assignee}
                              type="button"
                              onClick={() => {
                                handleFormChange('assignee', assignee);
                                setIsAssigneeOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <User className="w-4 h-4" />
                              {assignee}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column */}
                <div className="space-y-2">
                  
                  {/* Urgency Level */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 tracking-wide">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Urgency Level
                    </label>
                    <div className="space-y-1">
                      {urgencyOptions.map((urgency) => (
                        <label key={urgency.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200">
                          <input
                            type="radio"
                            name="urgency"
                            value={urgency.value}
                            checked={formData.urgency === urgency.value}
                            onChange={(e) => handleFormChange('urgency', e.target.value)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{urgency.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{urgency.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1 tracking-wide">
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
                        className="w-full h-8 text-left px-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {formData.contactMethod || "Select Contact Method"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isContactMethodOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                          {contactMethodOptions.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                handleFormChange('contactMethod', method);
                                setIsContactMethodOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
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
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Detailed Description
                </label>
                
                {/* Rich Text Editor Toolbar */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-700 p-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Text Formatting */}
                    <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('bold')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('italic')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('underline')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('strikeThrough')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('subscript')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Subscript"
                      >
                        <Subscript className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('superscript')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Superscript"
                      >
                        <Superscript className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Lists */}
                    <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertUnorderedList')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Unordered List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertOrderedList')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Ordered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('undo')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Undo"
                      >
                        <Undo className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('redo')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Redo"
                      >
                        <Redo className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('createLink')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Link"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertImage')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Image"
                      >
                        <Image className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyLeft')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyCenter')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyRight')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyFull')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Justify"
                      >
                        <AlignJustify className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Font Controls */}
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => handleRichTextCommand('fontName', e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        defaultValue="Arial"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                      
                      <select
                        onChange={(e) => handleRichTextCommand('fontSize', e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        defaultValue="3"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      
                      <input
                        type="color"
                        onChange={(e) => handleRichTextCommand('foreColor', e.target.value)}
                        className="w-6 h-6 border border-gray-300 dark:border-gray-600 cursor-pointer rounded"
                        title="Font Color"
                        defaultValue="#000000"
                      />
                      
                      <select
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        defaultValue="Normal"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Heading 1">Heading 1</option>
                        <option value="Heading 2">Heading 2</option>
                        <option value="Heading 3">Heading 3</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rich Text Editor Content */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleRichTextChange}
                  className="w-full min-h-[150px] px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 border-t-0 rounded-b-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-left rich-text-editor"
                  style={{ 
                    outline: 'none', 
                    textAlign: 'left', 
                    direction: 'ltr',
                    unicodeBidi: 'normal',
                    writingMode: 'horizontal-tb',
                    textRendering: 'optimizeLegibility',
                    WebkitTextStroke: '0'
                  }}
                  data-placeholder="Describe your request in detail..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
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

export default NewTicketRequestForm;
