'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl'
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/32"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${maxWidthClasses[maxWidth]} 
          bg-[var(--md-sys-color-surface-container-high)] 
          rounded-[28px] 
          shadow-[0_8px_12px_6px_rgba(0,0,0,0.15),0_4px_4px_0_rgba(0,0,0,0.30)]
          overflow-hidden
          animate-in 
          fade-in-0 
          zoom-in-95 
          duration-200
          ${className}
        `}
        role="document"
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 
              id="modal-title"
              className="text-xl font-medium text-[var(--md-sys-color-on-surface)]"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="
                w-10 h-10 
                rounded-full 
                flex items-center justify-center
                text-[var(--md-sys-color-on-surface-variant)]
                hover:bg-[var(--md-sys-color-on-surface)]/8
                focus:bg-[var(--md-sys-color-on-surface)]/12
                focus:outline-none
                transition-colors
              "
              aria-label="Close modal"
            >
              <span className="mdi mdi-close text-xl"></span>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={title ? '' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );

  // Render to portal if available (client-side)
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  // Fallback for SSR
  return modalContent;
}
