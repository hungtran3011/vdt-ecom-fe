'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useSearchSuggestions, usePopularQueries } from '@/hooks/useSearch';
import { useRouter } from 'next/navigation';

interface EnhancedSearchBoxProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  showPopularQueries?: boolean;
}

export default function EnhancedSearchBox({
  placeholder = "Tìm kiếm sản phẩm...",
  onSearch,
  className,
  autoFocus = false,
  showPopularQueries = true
}: EnhancedSearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get search suggestions
  const { data: suggestions = [] } = useSearchSuggestions(value, 8);
  
  // Get popular queries
  const { data: popularQueries = [] } = usePopularQueries(6);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((searchValue: string = value) => {
    if (searchValue.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(searchValue);
      } else {
        // Default to navigating to search page
        router.push(`/search?q=${encodeURIComponent(searchValue)}`);
      }
    }
  }, [value, onSearch, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setShowSuggestions(newValue.length >= 2);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    const totalSuggestions = suggestions.length + (showPopularQueries ? popularQueries.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : -1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => 
          prev > -1 ? prev - 1 : totalSuggestions - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0) {
          const selectedSuggestion = highlightIndex < suggestions.length 
            ? suggestions[highlightIndex].text
            : popularQueries[highlightIndex - suggestions.length];
          handleSearch(selectedSuggestion);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setValue(suggestionText);
    handleSearch(suggestionText);
  };

  const handleClear = () => {
    setValue("");
    setShowSuggestions(false);
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  const hasSuggestions = suggestions.length > 0 || (showPopularQueries && popularQueries.length > 0);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className={cn(
        "w-full h-14",
        "bg-(--md-sys-color-surface-container-high)",
        "overflow-hidden rounded-[28px]",
        "flex items-center gap-1",
        "transition-all duration-200",
        showSuggestions && hasSuggestions && "rounded-b-none"
      )}>
        <div className="flex-1 h-full p-1 flex items-center gap-1">
          {/* Search Icon */}
          <div className="w-12 h-12 flex justify-center items-center">
            <span className="mdi text-2xl text-(--md-sys-color-on-surface-variant)">search</span>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (value.length >= 2 || (showPopularQueries && popularQueries.length > 0)) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent outline-none",
              "text-(--md-sys-color-on-surface) text-base",
              "placeholder:text-(--md-sys-color-on-surface-variant)"
            )}
          />

          {/* Action Button */}
          <div className="w-12 h-12 flex justify-center items-center">
            <button
              onClick={value ? handleClear : () => handleSearch()}
              className={cn(
                "p-2 rounded-full transition-colors",
                "hover:bg-(--md-sys-color-on-surface) hover:bg-opacity-8",
                "flex justify-center items-center"
              )}
            >
              <span className="mdi text-xl text-(--md-sys-color-on-surface-variant)">
                {value ? 'close' : 'search'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && hasSuggestions && (
        <div 
          ref={suggestionsRef}
          className={cn(
            "absolute top-14 left-0 right-0 z-50",
            "bg-(--md-sys-color-surface-container-high)",
            "border-t border-(--md-sys-color-outline-variant)",
            "rounded-b-[28px] shadow-lg",
            "max-h-80 overflow-y-auto"
          )}
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-(--md-sys-color-on-surface-variant) uppercase tracking-wide">
                Gợi ý
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    "hover:bg-(--md-sys-color-on-surface) hover:bg-opacity-8",
                    "flex items-center gap-3",
                    highlightIndex === index && "bg-(--md-sys-color-on-surface) bg-opacity-8"
                  )}
                >
                  <span className="mdi text-lg text-(--md-sys-color-on-surface-variant)">search</span>
                  <span className="text-(--md-sys-color-on-surface)">{suggestion.text}</span>
                  {suggestion.type === 'SPELL_CHECK' && (
                    <span className="text-xs text-(--md-sys-color-primary)">Đã sửa</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Popular Queries */}
          {showPopularQueries && popularQueries.length > 0 && (
            <div className="py-2 border-t border-(--md-sys-color-outline-variant)">
              <div className="px-4 py-2 text-xs font-medium text-(--md-sys-color-on-surface-variant) uppercase tracking-wide">
                Tìm kiếm phổ biến
              </div>
              {popularQueries.map((query, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => handleSuggestionClick(query)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    "hover:bg-(--md-sys-color-on-surface) hover:bg-opacity-8",
                    "flex items-center gap-3",
                    highlightIndex === suggestions.length + index && "bg-(--md-sys-color-on-surface) bg-opacity-8"
                  )}
                >
                  <span className="mdi text-lg text-(--md-sys-color-on-surface-variant)">trending_up</span>
                  <span className="text-(--md-sys-color-on-surface)">{query}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
