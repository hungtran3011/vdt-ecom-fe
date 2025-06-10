'use client';

import { useEffect, useState, useCallback } from 'react';
import Button from './Button';

export interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export default function Snackbar({
  message,
  isOpen,
  onClose,
  duration = 4000,
  action,
  severity = 'info'
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 150); // Wait for animation to complete
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, duration, handleClose]);

  const getSeverityIcon = () => {
    switch (severity) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getSeverityColors = () => {
    switch (severity) {
      case 'success':
        return {
          backgroundColor: 'var(--md-sys-color-tertiary-container)',
          color: 'var(--md-sys-color-on-tertiary-container)',
          iconColor: 'var(--md-sys-color-tertiary)'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--md-sys-color-secondary-container)',
          color: 'var(--md-sys-color-on-secondary-container)',
          iconColor: 'var(--md-sys-color-secondary)'
        };
      case 'error':
        return {
          backgroundColor: 'var(--md-sys-color-error-container)',
          color: 'var(--md-sys-color-on-error-container)',
          iconColor: 'var(--md-sys-color-error)'
        };
      default:
        return {
          backgroundColor: 'var(--md-sys-color-surface-container-high)',
          color: 'var(--md-sys-color-on-surface)',
          iconColor: 'var(--md-sys-color-primary)'
        };
    }
  };

  const colors = getSeverityColors();

  if (!isOpen && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center p-4">
      <div
        className={`
          min-w-[344px] max-w-[672px] w-full sm:w-auto
          rounded-lg shadow-lg
          flex items-center gap-3 p-4
          pointer-events-auto
          transform transition-all duration-150 ease-out
          ${isVisible && isOpen 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-2 opacity-0 scale-95'
          }
        `}
        style={{
          backgroundColor: colors.backgroundColor,
          color: colors.color
        }}
      >
        {/* Icon */}
        <span className="mdi text-xl flex-shrink-0" style={{ color: colors.iconColor }}>
          {getSeverityIcon()}
        </span>

        {/* Message */}
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>

        {/* Action Button */}
        {action && (
          <Button
            variant="text"
            label={action.label}
            onClick={action.onClick}
            className="-mr-2"
            style={{ color: colors.color }}
          />
        )}

        {/* Close Button */}
        <Button
          variant="text"
          hasIcon
          icon="close"
          hasLabel={false}
          onClick={handleClose}
          className="-mr-2"
          style={{ color: colors.color }}
        />
      </div>
    </div>
  );
}
