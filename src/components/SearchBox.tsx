'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/localization';

interface SearchBoxProps {
  placeholder?: string;
  showAvatar?: boolean;
  avatarInitial?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export default function SearchBox({
  placeholder = t('search.hintedSearchText'),
  showAvatar = false,
  avatarInitial = "A",
  onSearch,
  className
}: SearchBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize MDC Ripple effect
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      // Add ripple effect initialization here if needed
    }
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full max-w-[720px] min-w-[360px] h-14",
        "bg-(--md-sys-color-surface-container-high)",
        "overflow-hidden rounded-[28px]",
        "flex items-center gap-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* State layer */}
      <div
        className={cn(
          "flex-1 h-full p-1",
          "flex items-center gap-1 mdc-ripple-surface",
          isHovered && "bg-(--md-sys-color-on-surface) bg-opacity-8"
        )}
      >
        {/* Leading icon */}
        <div className="w-12 h-12 flex flex-col justify-center items-center">
          <div className="overflow-hidden rounded-full flex justify-center items-center">
            <div className="p-2 flex justify-center items-center">
              <div className="w-6 h-6 relative">
                <span className="mdi">menu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 h-full flex items-center gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent outline-none",
              "text-(--md-sys-color-on-surface) text-base font-normal",
              "leading-6 tracking-[0.5px]",
              "placeholder:text-(--md-sys-color-on-surface-variant)"
            )}
          />
        </div>

        {/* Trailing elements */}
        <div className="flex justify-end items-center">
          {/* Trailing icon */}
          <div className="w-12 h-12 flex flex-col justify-center items-center">
            <div className="overflow-hidden rounded-full flex justify-center items-center">
              <button
                onClick={value ? handleClear : handleSearch}
                className="p-2 flex justify-center items-center hover:bg-(--md-state-layers-on-surface-opacity-016) hover:bg-opacity-8 rounded-full transition-colors"
              >
                <div className="w-6 h-6 relative">
                  <span className="mdi">search</span>
                </div>
              </button>
            </div>
          </div>

          {/* Avatar (conditional) */}
          {showAvatar && (
            <div className="h-12 pl-2 pr-3 flex justify-center items-center">
              <div className="w-[30px] h-[30px] relative overflow-hidden">
                <div className="w-[30px] h-[30px] absolute left-0 top-0 bg-(--md-sys-color-primary) rounded-full" />
                <div className="w-10 h-10 absolute -left-[5px] -top-[5px] text-center flex justify-center items-center text-white text-base font-medium leading-6 tracking-[0.15px]">
                  {avatarInitial}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}