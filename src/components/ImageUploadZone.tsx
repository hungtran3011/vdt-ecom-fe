'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
// import Button from '@/components/Button';
import IconButton from '@/components/IconButton';

interface ImageUploadZoneProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export default function ImageUploadZone({ 
  value, 
  label,
  onChange, 
  disabled = false, 
  className = "" 
}: ImageUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', 'image');

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      onChange(result.secure_url || result.url);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  }, [disabled, uploadFile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-(--md-sys-color-on-surface)">
        {label}
      </label>
      
      {value ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-(--md-sys-color-surface-container-highest) border border-(--md-sys-color-outline-variant)">
            <Image
              src={value}
              alt="Category preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <IconButton
              variant="filled"
              // hasIcon
              icon="edit"
              onClick={handleBrowseClick}
              disabled={disabled || isUploading}
              className="!p-2 !min-w-0 !h-8 !w-8 bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container)"
            />
            <IconButton
              variant="filled"
              icon="delete"
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              className="!p-2 !min-w-0 !h-8 !w-8 bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container)"
            />
          </div>
        </div>
      ) : (
        <div
          className={`
            relative w-full h-48 rounded-xl border-2 border-dashed transition-all duration-200
            ${isDragOver && !disabled
              ? 'border-(--md-sys-color-primary) bg-(--md-sys-color-primary-container)' 
              : 'border-(--md-sys-color-outline-variant) bg-(--md-sys-color-surface-container-lowest)'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!disabled ? handleBrowseClick : undefined}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <div className="h-8 w-8 border-2 border-t-transparent border-(--md-sys-color-primary) rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                  Uploading image...
                </p>
              </>
            ) : (
              <>
                <span className="mdi text-4xl mb-3 text-(--md-sys-color-on-surface-variant)">
                  {isDragOver ? 'file_upload' : 'add_photo_alternate'}
                </span>
                <p className="text-sm font-medium text-(--md-sys-color-on-surface) mb-1">
                  {isDragOver ? 'Drop image here' : 'Drag & drop an image'}
                </p>
                <p className="text-xs text-(--md-sys-color-on-surface-variant) mb-3">
                  or click to browse files
                </p>
                <p className="text-xs text-(--md-sys-color-on-surface-variant)">
                  Supports: JPG, PNG, GIF (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
