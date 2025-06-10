"use client"

import { useState, forwardRef, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { MDCRipple } from '@material/ripple'

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  supportingText?: string;
  error?: string;
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  onTrailingIconClick?: () => void;
  onLeadingIconClick?: () => void;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      label = 'Label',
      leadingIcon,
      trailingIcon,
      supportingText,
      error,
      variant = 'filled',
      value,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      placeholder,
      onTrailingIconClick,
      onLeadingIconClick,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const inputRef = useRef<HTMLInputElement>(null);
    const leadingIconRef = useRef<HTMLDivElement>(null);
    const trailingIconRef = useRef<HTMLDivElement>(null);

    // Initialize ripple effects for icons
    useEffect(() => {
      if (leadingIconRef.current) {
        const ripple = new MDCRipple(leadingIconRef.current);
        ripple.unbounded = true;
        return () => ripple.destroy();
      }
    }, [leadingIconRef]);

    useEffect(() => {
      if (trailingIconRef.current) {
        const ripple = new MDCRipple(trailingIconRef.current);
        ripple.unbounded = true;
        return () => ripple.destroy();
      }
    }, [trailingIconRef]);

    // Forward ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    // Update hasValue when value prop changes
    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      onChange?.(e);
    };

    const getState = () => {
      if (disabled) return 'disabled';
      if (error) return 'error';
      if (focused) return 'focused';
      if (hasValue) return 'filled';
      return 'enabled';
    };

    const state = getState();
    const hasLeadingIcon = !!leadingIcon;
    const hasTrailingIcon = !!trailingIcon;
    const showSupportingText = !!(supportingText || error);
    const isFloating = focused || hasValue || placeholder || props.type === "date" || value !== "";
    const hasPlaceholder = !!placeholder;
    const shouldShowCutout = isFloating || hasPlaceholder; // Show cutout when floating OR has placeholder

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

            {/* Input container for outlined */}
            <div className="flex items-center w-full min-h-[56px] px-4 -mt-[2px]">
              {/* Leading Icon */}
              {hasLeadingIcon && (
                <div className="flex items-center justify-center w-8 h-8 mr-3">
                  <div
                    ref={leadingIconRef}
                    onClick={disabled ? undefined : onLeadingIconClick}
                    className={cn(
                      "flex items-center justify-center w-full h-full rounded-full mdc-ripple-surface",
                      onLeadingIconClick && !disabled ? "cursor-pointer" : ""
                    )}
                  >
                    <span className={cn(
                      "mdi",
                      error ? "text-(--md-sys-color-error)" : "text-(--md-sys-color-on-surface-variant)"
                    )}>
                      {leadingIcon}
                    </span>
                  </div>
                </div>
              )}

              {/* Input */}
              <input
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={hasPlaceholder ? placeholder : (!isFloating && !hasPlaceholder) ? label : ''}
                disabled={disabled}
                className={cn(
                  "flex-1 bg-transparent outline-none text-base",
                  "text-(--md-sys-color-on-surface)",
                  hasTrailingIcon && "pr-3",
                  disabled && "opacity-38"
                )}
                {...props}
              />

              {/* Trailing Icon */}
              {hasTrailingIcon && (
                <div className="flex items-center justify-center w-8 h-8 ml-3">
                  <div
                    ref={trailingIconRef}
                    onClick={disabled ? undefined : onTrailingIconClick}
                    className={cn(
                      "flex items-center justify-center w-full h-full rounded-full mdc-ripple-surface",
                      onTrailingIconClick && !disabled ? "cursor-pointer" : ""
                    )}
                  >
                    <span className={cn(
                      "mdi",
                      error ? "text-(--md-sys-color-error)" : "text-(--md-sys-color-on-surface-variant)"
                    )}>
                      {trailingIcon}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </fieldset>
        ) : (
          /* Filled variant - existing code */
          <div
            className={cn(
              "w-full transition-all duration-200 ease-in-out mdc-ripple-surface",
              "bg-(--md-sys-color-surface-variant) rounded-t-md border-transparent border"
            )}
          >
            <div
              className={cn(
                "flex items-center w-full min-h-[56px]",
                focused && "bg-opacity-8"
              )}
            >
              {/* Leading Icon for filled */}
              {hasLeadingIcon && (
                <div className="flex items-center justify-center w-12 h-12">
                  <div
                    ref={leadingIconRef}
                    onClick={disabled ? undefined : onLeadingIconClick}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full mdc-ripple-surface",
                      onLeadingIconClick && !disabled ? "cursor-pointer" : ""
                    )}
                  >
                    <span className={cn(
                      "mdi",
                      error ? "text-(--md-sys-color-error)" : "text-(--md-sys-color-on-surface-variant)"
                    )}>
                      {leadingIcon}
                    </span>
                  </div>
                </div>
              )}

              {/* Input container for filled */}
              <div className="flex-1 relative flex flex-col justify-center min-h-[48px] py-1">
                {/* Floating label for filled */}
                <div
                  className={cn(
                    "absolute transition-all duration-200 ease-in-out pointer-events-none",
                    isFloating 
                      ? "text-xs top-1" 
                      : "text-base top-1/2 -translate-y-1/2",
                    hasLeadingIcon ? "left-0" : "left-4",
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

                <input
                  ref={inputRef}
                  value={value}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={hasPlaceholder ? placeholder : ''}
                  disabled={disabled}
                  className={cn(
                    "w-full bg-transparent outline-none",
                    hasLeadingIcon ? "pl-0" : "pl-4",
                    hasTrailingIcon ? "pr-2" : "pr-4",
                    "text-base",
                    "text-(--md-sys-color-on-surface)",
                    isFloating && "pt-3",
                    disabled && "opacity-38"
                  )}
                  {...props}
                />
              </div>

              {/* Trailing Icon for filled */}
              {hasTrailingIcon && (
                <div className="flex items-center justify-center w-12 h-12">
                  <div
                    ref={trailingIconRef}
                    onClick={disabled ? undefined : onTrailingIconClick}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full mdc-ripple-surface",
                      onTrailingIconClick && !disabled ? "cursor-pointer" : ""
                    )}
                  >
                    <span className={cn(
                      "mdi",
                      error ? "text-(--md-sys-color-error)" : "text-(--md-sys-color-on-surface-variant)"
                    )}>
                      {trailingIcon}
                    </span>
                  </div>
                </div>
              )}
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

TextField.displayName = "TextField";

export default TextField;