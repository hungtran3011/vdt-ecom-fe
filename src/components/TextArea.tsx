"use client"

import { useState, forwardRef, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  supportingText?: string;
  error?: string;
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  rows?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label = 'Label',
      supportingText,
      error,
      variant = 'filled',
      value,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      placeholder,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Forward ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(textareaRef.current);
        } else {
          ref.current = textareaRef.current;
        }
      }
    }, [ref]);

    // Update hasValue when value prop changes
    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(!!e.target.value);
      onChange?.(e);
    };

    const showSupportingText = !!(supportingText || error);
    const isFloating = focused || hasValue || placeholder;
    const hasPlaceholder = !!placeholder;
    const shouldShowCutout = isFloating || hasPlaceholder;

    return (
      <div
        className={cn(
          "relative w-full mb-6",
          disabled && "opacity-38",
          className
        )}
      >
        {/* Outlined variant with fieldset/legend for proper border cutout */}
        {variant === 'outlined' ? (
          <fieldset
            className={cn(
              "w-full rounded border transition-all duration-200 ease-in-out",
              error 
                ? "border-2 border-(--md-sys-color-error)" 
                : focused 
                  ? "border-2 border-(--md-sys-color-primary)" 
                  : "border border-(--md-sys-color-outline)"
            )}
          >
            <legend
              className={cn(
                "ml-3 px-1 text-xs transition-all duration-200",
                shouldShowCutout ? "opacity-100" : "opacity-0 max-w-[0.01px]",
                error 
                  ? "text-(--md-sys-color-error)" 
                  : focused 
                    ? "text-(--md-sys-color-primary)" 
                    : "text-(--md-sys-color-on-surface-variant)",
                disabled && "opacity-38"
              )}
            >
              {shouldShowCutout ? label : ""}
            </legend>

            {/* Textarea container for outlined */}
            <div className="flex flex-col w-full min-h-[56px] px-4 -mt-[2px] py-2">
              {/* Floating label for outlined */}
              <div
                className={cn(
                  "absolute transition-all duration-200 ease-in-out pointer-events-none",
                  isFloating 
                    ? "text-xs top-2 left-3" 
                    : "text-base top-4 left-4",
                  error 
                    ? "text-(--md-sys-color-error)" 
                    : focused 
                      ? "text-(--md-sys-color-primary)" 
                      : "text-(--md-sys-color-on-surface-variant)",
                  disabled && "opacity-38"
                )}
              >
                {label}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={hasPlaceholder ? placeholder : (!isFloating && !hasPlaceholder) ? label : ''}
                disabled={disabled}
                rows={rows}
                className={cn(
                  "w-full bg-transparent outline-none text-base resize-none",
                  "text-(--md-sys-color-on-surface)",
                  "placeholder:text-(--md-sys-color-on-surface-variant)",
                  isFloating && "mt-4",
                  disabled && "opacity-38"
                )}
                {...props}
              />
            </div>
          </fieldset>
        ) : (
          /* Filled variant */
          <div
            className={cn(
              "w-full transition-all duration-200 ease-in-out",
              "bg-(--md-sys-color-surface-variant) rounded-t-md border-transparent border"
            )}
          >
            <div className="flex flex-col w-full min-h-[56px] py-2">
              {/* Textarea container for filled */}
              <div className="flex-1 relative flex flex-col justify-center px-4">
                {/* Floating label for filled */}
                <div
                  className={cn(
                    "absolute transition-all duration-200 ease-in-out pointer-events-none",
                    isFloating 
                      ? "text-xs top-2" 
                      : "text-base top-4",
                    error 
                      ? "text-(--md-sys-color-error)" 
                      : focused 
                        ? "text-(--md-sys-color-primary)" 
                        : "text-(--md-sys-color-on-surface-variant)",
                    disabled && "opacity-38"
                  )}
                >
                  {label}
                </div>

                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={hasPlaceholder ? placeholder : ''}
                  disabled={disabled}
                  rows={rows}
                  className={cn(
                    "w-full bg-transparent outline-none resize-none",
                    "text-base",
                    "text-(--md-sys-color-on-surface)",
                    "placeholder:text-(--md-sys-color-on-surface-variant)",
                    isFloating && "mt-5",
                    disabled && "opacity-38"
                  )}
                  {...props}
                />
              </div>
            </div>
          </div>
        )}

        {/* Border line for filled variant only */}
        {variant === 'filled' && (
          <div
            className={cn(
              "h-[1px] w-full",
              disabled ? "opacity-38" : "",
              error 
                ? "h-[2px] bg-(--md-sys-color-error)" 
                : focused 
                  ? "h-[2px] bg-(--md-sys-color-primary)" 
                  : "bg-(--md-sys-color-on-surface-variant)"
            )}
          />
        )}

        {/* Supporting text */}
        {showSupportingText && (
          <div
            className={cn(
              "text-xs mt-1 px-4",
              error ? "text-(--md-sys-color-error)" : "text-(--md-sys-color-on-surface-variant)",
              disabled && "opacity-38"
            )}
          >
            {error || supportingText}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
