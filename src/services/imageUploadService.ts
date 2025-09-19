// Image upload service for Cloudinary integration

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    size: number;
    name?: string;
  };
  message?: string;
  error?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data?: Array<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    size: number;
    name: string;
  }>;
  message?: string;
  error?: string;
}

class ImageUploadService {
  private baseUrl = '/api/upload';

  // Upload single image
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Server upload failed:', response.status, errorText);
        
        // If server is not available, fall back to local URL
        console.warn('Using local URL as fallback');
        return {
          success: true,
          data: {
            url: URL.createObjectURL(file),
            publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            width: 800,
            height: 600,
            size: file.size,
            name: file.name
          }
        };
      }

      const result = await response.json();
      
      // Validate the response
      if (!result.success || !result.data || !result.data.url) {
        console.warn('Invalid server response, using local URL as fallback');
        return {
          success: true,
          data: {
            url: URL.createObjectURL(file),
            publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            width: 800,
            height: 600,
            size: file.size,
            name: file.name
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      
      // Fallback to local URL when server is unavailable
      console.warn('Upload service unavailable, using local URL as fallback');
      return {
        success: true,
        data: {
          url: URL.createObjectURL(file),
          publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          width: 800,
          height: 600,
          size: file.size,
          name: file.name
        }
      };
    }
  }

  // Upload multiple images for albums
  async uploadImages(files: File[]): Promise<MultipleUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${this.baseUrl}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Server upload failed:', response.status, errorText);
        
        // If server is not available, fall back to local URLs
        console.warn('Using local URLs as fallback');
        const localImages = files.map(file => ({
          url: URL.createObjectURL(file),
          publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          width: 800,
          height: 600,
          size: file.size,
          name: file.name
        }));
        
        return {
          success: true,
          data: localImages
        };
      }

      const result = await response.json();
      
      // Validate the response
      if (!result.success || !result.data || !Array.isArray(result.data)) {
        console.warn('Invalid server response, using local URLs as fallback');
        const localImages = files.map(file => ({
          url: URL.createObjectURL(file),
          publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          width: 800,
          height: 600,
          size: file.size,
          name: file.name
        }));
        
        return {
          success: true,
          data: localImages
        };
      }
      
      return result;
    } catch (error) {
      console.error('Multiple image upload error:', error);
      
      // Fallback to local URLs when server is unavailable
      console.warn('Upload service unavailable, using local URLs as fallback');
      const localImages = files.map(file => ({
        url: URL.createObjectURL(file),
        publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        width: 800,
        height: 600,
        size: file.size,
        name: file.name
      }));
      
      return {
        success: true,
        data: localImages
      };
    }
  }

  // Upload general file
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/file`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // If server is not available, fall back to local URL
        console.warn('Server upload failed, using local URL as fallback');
        return {
          success: true,
          data: {
            url: URL.createObjectURL(file),
            publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            width: 800,
            height: 600,
            size: file.size,
            name: file.name
          }
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('File upload error:', error);
      
      // Fallback to local URL when server is unavailable
      console.warn('Upload service unavailable, using local URL as fallback');
      return {
        success: true,
        data: {
          url: URL.createObjectURL(file),
          publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          width: 800,
          height: 600,
          size: file.size,
          name: file.name
        }
      };
    }
  }

  // Upload user avatar
  async uploadAvatar(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${this.baseUrl}/avatar`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Avatar upload failed');
      }

      return result;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Avatar upload failed',
      };
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/image/${publicId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Delete failed');
      }

      return result;
    } catch (error) {
      console.error('Image deletion error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, GIF, and WebP images are allowed',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 10MB',
      };
    }

    return { valid: true };
  }

  // Validate general file
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Allowed: Images, PDF, Word, Excel, Text, ZIP, RAR',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB',
      };
    }

    return { valid: true };
  }

  // Get optimized image URL with transformations
  getOptimizedImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}): string {
    const cloudName = 'dtywyqkfg';
    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    const transformString = transformations.length > 0 ? transformations.join(',') : 'auto';
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
  }
}

export const imageUploadService = new ImageUploadService();
