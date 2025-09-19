import React, { useState } from 'react';
import { Download } from 'lucide-react';
import BasicDropdown from './BasicDropdown';

interface PhotoAlbumMessageProps {
  message: {
    id: number;
    text: string;
    sender: "agent" | "customer";
    timestamp: string;
    isRead: boolean;
    type: "image";
    images: Array<{
      name: string;
      url: string;
      size: number;
      publicId?: string;
    }>;
    senderName?: string;
    senderEmail?: string;
  };
  currentUser: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onDownloadImage?: (imageUrl: string, imageName: string) => void;
  onSaveAll?: (images: Array<{ name: string; url: string; size: number }>) => void;
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
  onCopy?: (message: any) => void;
  onReport?: (message: any) => void;
  onDelete?: (message: any) => void;
}

const PhotoAlbumMessage: React.FC<PhotoAlbumMessageProps> = ({
  message,
  currentUser,
  onDownloadImage,
  onSaveAll,
  onReply,
  onForward,
  onCopy,
  onReport,
  onDelete
}) => {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  // Show first 4 images in grid, rest as "+X" overlay
  const displayImages = message.images.slice(0, 4);
  const remainingCount = Math.max(0, message.images.length - 4);

  const handleDownloadImage = (imageUrl: string, imageName: string) => {
    if (onDownloadImage) {
      onDownloadImage(imageUrl, imageName);
    } else {
      // Fallback download functionality
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveAll = () => {
    if (onSaveAll) {
      onSaveAll(message.images);
    } else {
      // Fallback save all functionality
      message.images.forEach((img, index) => {
        setTimeout(() => {
          handleDownloadImage(img.url, img.name);
        }, index * 100); // Stagger downloads
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-start gap-2.5 mb-4">
      {/* User Avatar */}
      <img
        className="w-8 h-8 rounded-full flex-shrink-0"
        src={currentUser?.avatar || "/docs/images/people/profile-picture-3.jpg"}
        alt={`${currentUser?.name || 'User'} image`}
      />
      
      {/* Message Content */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
          {/* Message Header */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {message.senderName || currentUser?.name || 'User'}
            </span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {message.timestamp}
            </span>
          </div>
          
          {/* Message Text */}
          {message.text && (
            <p className="text-sm font-normal text-gray-900 dark:text-white mb-2">
              {message.text}
            </p>
          )}
          
          {/* Photo Album Grid */}
          <div className="grid gap-4 grid-cols-2 my-2.5">
            {displayImages.map((img, index) => (
              <div 
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                {/* Hover Overlay with Download Button */}
                <div className={`absolute w-full h-full bg-gray-900/50 transition-opacity duration-300 rounded-lg flex items-center justify-center ${
                  hoveredImage === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button
                    onClick={() => handleDownloadImage(img.url, img.name)}
                    className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                    title="Download image"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
                <img 
                  src={img.url} 
                  alt={`Image ${index + 1}`}
                  className="rounded-lg w-full h-32 object-cover"
                />
              </div>
            ))}
            
            {/* Show "+X" overlay for remaining images */}
            {remainingCount > 0 && (
              <div className="group relative">
                <button 
                  className="absolute w-full h-full bg-gray-900/90 hover:bg-gray-900/50 transition-all duration-300 rounded-lg flex items-center justify-center"
                  onClick={() => {
                    // Could open a modal to show all images
                    console.log('Show all images modal');
                  }}
                >
                  <span className="text-xl font-medium text-white">+{remainingCount}</span>
                </button>
                <img 
                  src={displayImages[0]?.url || '/docs/images/blog/image-1.jpg'} 
                  alt="More images"
                  className="rounded-lg w-full h-32 object-cover"
                />
              </div>
            )}
          </div>
          
          {/* Message Footer */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {message.isRead ? 'Read' : 'Delivered'}
            </span>
            <button 
              onClick={handleSaveAll}
              className="text-sm text-blue-700 dark:text-blue-500 font-medium inline-flex items-center hover:underline"
            >
              <Download className="w-3 h-3 me-1.5" />
              Save all
            </button>
          </div>
        </div>
      </div>
      
      {/* Basic Dropdown */}
      <BasicDropdown
        message={message}
        onReply={onReply}
        onForward={onForward}
        onCopy={onCopy}
        onReport={onReport}
        onDelete={onDelete}
      />
    </div>
  );
};

export default PhotoAlbumMessage;
