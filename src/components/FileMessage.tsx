import React from 'react';
import { Download, FileText, File, FileImage, FileSpreadsheet, FileArchive } from 'lucide-react';

interface FileMessageProps {
  message: {
    id: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    senderEmail: string;
    timestamp: string;
  };
  currentUser?: {
    email: string;
  } | null;
  onDownload?: (url: string, fileName: string) => void;
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
  onCopy?: (message: any) => void;
  onReport?: (message: any) => void;
  onDelete?: (message: any) => void;
}

const FileMessage: React.FC<FileMessageProps> = ({
  message,
  currentUser,
  onDownload,
  onReply,
  onForward,
  onCopy,
  onReport,
  onDelete
}) => {
  const isCurrentUser = message.senderEmail === currentUser?.email;

  // Get file icon based on file type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-5 h-5" />;
    
    if (fileType.startsWith('image/')) {
      return <FileImage className="w-5 h-5" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="w-5 h-5" />;
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5" />;
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <FileArchive className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file extension
  const getFileExtension = (fileName?: string) => {
    if (!fileName) return 'FILE';
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  // Get file name without extension
  const getFileName = (fileName?: string) => {
    if (!fileName) return 'Unknown File';
    return fileName.split('.').slice(0, -1).join('.') || fileName;
  };

  const handleDownload = () => {
    if (message.fileUrl && message.fileName && onDownload) {
      onDownload(message.fileUrl, message.fileName);
    }
  };

  return (
    <div className={`flex items-start gap-2.5 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <img 
        className="w-8 h-8 rounded-full" 
        src={isCurrentUser ? "/docs/images/people/profile-picture-3.jpg" : `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderEmail)}&background=8b5cf6&color=fff`}
        alt={message.senderEmail}
      />
      
      <div className="flex flex-col gap-1">
        <div className={`flex flex-col w-full max-w-[326px] leading-1.5 p-4 ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-s-xl rounded-ee-xl' 
            : 'border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700'
        }`}>
          {/* Header with sender name and timestamp */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className={`text-sm font-semibold ${
              isCurrentUser ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              {isCurrentUser ? 'You' : message.senderEmail}
            </span>
            <span className={`text-sm font-normal ${
              isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* File attachment */}
          <div className={`flex items-start my-2.5 ${
            isCurrentUser 
              ? 'bg-blue-400 rounded-xl p-2' 
              : 'bg-gray-50 dark:bg-gray-600 rounded-xl p-2'
          }`}>
            <div className="me-2">
              <span className={`flex items-center gap-2 text-sm font-medium pb-2 ${
                isCurrentUser ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {getFileIcon(message.fileType)}
                {getFileName(message.fileName)}
              </span>
              <span className={`flex text-xs font-normal gap-2 ${
                isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {formatFileSize(message.fileSize)}
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
                  <circle cx="1.5" cy="2" r="1.5" fill={isCurrentUser ? "#93C5FD" : "#6B7280"}/>
                </svg>
                {getFileExtension(message.fileName)}
              </span>
            </div>
            <div className="inline-flex self-center items-center">
              <button 
                onClick={handleDownload}
                className={`inline-flex self-center items-center p-2 text-sm font-medium text-center rounded-lg hover:opacity-80 focus:ring-4 focus:outline-none transition-colors ${
                  isCurrentUser 
                    ? 'text-white bg-blue-300 hover:bg-blue-200 focus:ring-blue-200' 
                    : 'text-gray-900 bg-gray-50 hover:bg-gray-100 focus:ring-gray-50 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-600'
                }`}
                type="button"
                title="Download file"
              >
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                  <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Status */}
          <span className={`text-sm font-normal ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            Delivered
          </span>
        </div>
      </div>

    </div>
  );
};

export default FileMessage;
