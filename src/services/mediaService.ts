import api from '@/lib/axios';
import { MediaUploadResponse } from '@/types/User';
import { ApiError } from '@/types/api';

/**
 * Service for handling media upload operations
 * Supports image uploads for products, categories, and user avatars
 */
export class MediaService {
  /**
   * Upload a single image file
   * @param file The image file to upload
   * @param type The type of upload (product, category, avatar, etc.)
   * @returns Promise with upload response containing URL
   */
  async uploadImage(file: File, type?: string): Promise<MediaUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (type) {
        formData.append('type', type);
      }

      const response = await api.post('/v1/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error as ApiError;
    }
  }

  /**
   * Upload multiple image files
   * @param files Array of image files to upload
   * @param type The type of upload (product, category, etc.)
   * @returns Promise with array of upload responses
   */
  async uploadMultipleImages(files: File[], type?: string): Promise<MediaUploadResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, type));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error as ApiError;
    }
  }

  /**
   * Delete an uploaded image
   * @param filename The filename or URL of the image to delete
   * @returns Promise with operation result
   */
  async deleteImage(filename: string): Promise<void> {
    try {
      await api.delete(`/v1/media/delete`, {
        params: { filename }
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error as ApiError;
    }
  }

  /**
   * Get image URL for display
   * @param filename The filename returned from upload
   * @returns Full URL for the image
   */
  getImageUrl(filename: string): string {
    if (filename.startsWith('http')) {
      return filename; // Already a full URL
    }
    return `${api.defaults.baseURL}/v1/media/view/${filename}`;
  }

  /**
   * Validate image file before upload
   * @param file The file to validate
   * @param maxSizeInMB Maximum size in megabytes (default: 5MB)
   * @returns Validation result with error message if invalid
   */
  validateImageFile(file: File, maxSizeInMB: number = 5): { isValid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Chỉ hỗ trợ file ảnh (JPEG, PNG, WebP)' 
      };
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return { 
        isValid: false, 
        error: `Kích thước file không được vượt quá ${maxSizeInMB}MB` 
      };
    }

    return { isValid: true };
  }
}

// Create a singleton instance
export const mediaService = new MediaService();
