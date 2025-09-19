import React, { useState } from 'react';
import { Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageSizes, setImageSizes] = useState<{ [key: number]: 'small' | 'medium' | 'large' }>({});
  const [imageZoom, setImageZoom] = useState<{ [key: number]: number }>({});
  const [showFullImage, setShowFullImage] = useState<{ [key: number]: boolean }>({});

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

  const handleImageError = (index: number) => {
    console.warn(`Image ${index} failed to load:`, displayImages[index]?.url);
    setImageErrors(prev => new Set(prev).add(index));
  };

  const handleImageLoad = (index: number) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // Image size management functions
  const getImageSize = (index: number): 'small' | 'medium' | 'large' => {
    return imageSizes[index] || 'medium';
  };

  const setImageSize = (index: number, size: 'small' | 'medium' | 'large') => {
    setImageSizes(prev => ({ ...prev, [index]: size }));
  };

  const getImageZoom = (index: number): number => {
    return imageZoom[index] || 1;
  };

  const setImageZoomLevel = (index: number, zoom: number) => {
    setImageZoom(prev => ({ ...prev, [index]: Math.max(0.5, Math.min(3, zoom)) }));
  };

  const toggleFullImage = (index: number) => {
    setShowFullImage(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getImageClasses = (index: number) => {
    const size = getImageSize(index);
    const zoom = getImageZoom(index);
    
    const sizeClasses = {
      small: 'h-20',
      medium: 'h-32',
      large: 'h-48'
    };

    return `rounded-lg w-full ${sizeClasses[size]} object-cover transition-all duration-300`;
  };

  const getImageStyle = (index: number) => {
    const zoom = getImageZoom(index);
    return {
      transform: `scale(${zoom})`,
      transformOrigin: 'center center'
    };
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
                {/* Hover Overlay with Controls */}
                <div className={`absolute w-full h-full bg-gray-900/50 transition-opacity duration-300 rounded-lg flex items-center justify-center ${
                  hoveredImage === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="flex items-center space-x-2">
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownloadImage(img.url, img.name)}
                      className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                      title="Download image"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                    
                    {/* Size Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setImageSize(index, 'small')}
                        className={`inline-flex items-center justify-center rounded-full h-6 w-6 text-xs font-bold ${
                          getImageSize(index) === 'small' ? 'bg-white/50' : 'bg-white/30 hover:bg-white/40'
                        } text-white`}
                        title="Small size"
                      >
                        S
                      </button>
                      <button
                        onClick={() => setImageSize(index, 'medium')}
                        className={`inline-flex items-center justify-center rounded-full h-6 w-6 text-xs font-bold ${
                          getImageSize(index) === 'medium' ? 'bg-white/50' : 'bg-white/30 hover:bg-white/40'
                        } text-white`}
                        title="Medium size"
                      >
                        M
                      </button>
                      <button
                        onClick={() => setImageSize(index, 'large')}
                        className={`inline-flex items-center justify-center rounded-full h-6 w-6 text-xs font-bold ${
                          getImageSize(index) === 'large' ? 'bg-white/50' : 'bg-white/30 hover:bg-white/40'
                        } text-white`}
                        title="Large size"
                      >
                        L
                      </button>
                    </div>
                    
                    {/* Zoom Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setImageZoomLevel(index, getImageZoom(index) - 0.2)}
                        className="inline-flex items-center justify-center rounded-full h-6 w-6 bg-white/30 hover:bg-white/50 text-white"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setImageZoomLevel(index, getImageZoom(index) + 0.2)}
                        className="inline-flex items-center justify-center rounded-full h-6 w-6 bg-white/30 hover:bg-white/50 text-white"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Full Screen Button */}
                    <button
                      onClick={() => toggleFullImage(index)}
                      className="inline-flex items-center justify-center rounded-full h-6 w-6 bg-white/30 hover:bg-white/50 text-white"
                      title="Full screen"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {imageErrors.has(index) ? (
                  <div className={`rounded-lg w-full ${getImageClasses(index)} bg-gray-200 dark:bg-gray-600 flex items-center justify-center`}>
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                        📷
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Image {index + 1}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Failed to load
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg">
                    <img 
                      src={img.url} 
                      alt={`Image ${index + 1}`}
                      className={getImageClasses(index)}
                      style={getImageStyle(index)}
                      onError={() => handleImageError(index)}
                      onLoad={() => handleImageLoad(index)}
                    />
                  </div>
                )}
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
                  onError={(e) => {
                    // Fallback to a placeholder if the first image also fails
                    if (e.currentTarget.src !== '/docs/images/blog/image-1.jpg') {
                      e.currentTarget.src = '/docs/images/blog/image-1.jpg';
                    }
                  }}
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
      
      {/* Full Screen Image Modal */}
      {Object.entries(showFullImage).map(([index, isOpen]) => {
        if (!isOpen) return null;
        const imgIndex = parseInt(index);
        const img = displayImages[imgIndex];
        if (!img) return null;
        
        return (
          <div
            key={index}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => toggleFullImage(imgIndex)}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => toggleFullImage(imgIndex)}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
              >
                ✕
              </button>
              <img
                src={img.url}
                alt={`Full size image ${imgIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageZoomLevel(imgIndex, getImageZoom(imgIndex) - 0.2);
                  }}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="bg-white/20 rounded-full px-3 py-2 text-white text-sm">
                  {Math.round(getImageZoom(imgIndex) * 100)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageZoomLevel(imgIndex, getImageZoom(imgIndex) + 0.2);
                  }}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PhotoAlbumMessage;
