'use client';

import { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  className = "",
  placeholder = "Select an option"
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setIsFocused(false);
  };

  const hasValue = value !== '';
  const showFloatingLabel = hasValue || isFocused || isOpen || placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label */}
      <label
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${showFloatingLabel
            ? 'top-2 text-xs text-(--md-sys-color-primary)'
            : 'top-4 text-sm text-(--md-sys-color-on-surface-variant)'
          }
          ${disabled ? 'text-(--md-sys-color-on-surface-variant)' : ''}
        `}
      >
        {label} {required && '*'}
      </label>

      {/* Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full h-14 px-4 pt-6 pb-2 text-left bg-transparent
          border border-(--md-sys-color-outline) rounded-t-md
          transition-all duration-200 outline-none
          ${isOpen || isFocused
            ? 'border-2 border-(--md-sys-color-primary) rounded-b-none'
            : 'border-(--md-sys-color-outline) hover:border-(--md-sys-color-on-surface)'
          }
          ${disabled 
            ? 'cursor-not-allowed opacity-60' 
            : 'cursor-pointer'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm ${hasValue ? 'text-(--md-sys-color-on-surface)' : 'text-(--md-sys-color-on-surface-variant)'}`}>
            {selectedOption?.label || placeholder}
          </span>
          <span className={`mdi text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            keyboard_arrow_down
          </span>
        </div>
      </button>

      {/* Supporting line */}
      <div className={`h-px bg-(--md-sys-color-outline) ${isOpen ? 'bg-(--md-sys-color-primary)' : ''}`} />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[9999] bg-(--md-sys-color-surface-container) border-x border-b border-(--md-sys-color-primary) rounded-b-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 text-left text-sm transition-colors duration-150
                hover:bg-(--md-sys-color-surface-container-highest)
                ${value === option.value 
                  ? 'bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container)' 
                  : 'text-(--md-sys-color-on-surface)'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
