"use client";

import { cn } from "@/utils/cn";
import { forwardRef, useState, useRef, useEffect } from "react";
import { MDCRipple } from '@material/ripple';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: string;
    variant?: "standard" | "filled" | "tonal" | "outlined";
    size?: "small" | "medium" | "large";
    selected?: boolean;
    badge?: boolean;
    badgeContent?: string | number;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ 
        icon, 
        variant = "standard", 
        size = "medium", 
        selected = false,
        badge = false,
        badgeContent,
        className, 
        disabled = false,
        ...props 
    }, ref) => {
        
        // State management for interactions
        const [isHovered, setIsHovered] = useState(false);
        const [isPressed, setIsPressed] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);

        // Initialize MDC Ripple effect
        useEffect(() => {
            if (buttonRef.current) {
                const ripple = new MDCRipple(buttonRef.current);
                return () => {
                    ripple.destroy();
                };
            }
        }, []);

        // Pass the ref to React's forwardRef
        useEffect(() => {
            if (ref && buttonRef.current) {
                if (typeof ref === 'function') {
                    ref(buttonRef.current);
                } else {
                    ref.current = buttonRef.current;
                }
            }
        }, [ref]);

        // Determine current state based on interactions
        const currentState = disabled ? 'disabled' :
            isPressed ? 'pressed' :
                isHovered ? 'hovered' :
                    isFocused ? 'focused' :
                        'enabled';
        
        const getVariantStyles = () => {
            const base = "relative inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none overflow-hidden mdc-ripple-surface";
            
            // Base container styles for each variant
            const containerStyles = {
                filled: {
                    enabled: "bg-(--md-sys-color-primary)",
                    hovered: "bg-(--md-sys-color-primary)",
                    pressed: "bg-(--md-sys-color-primary)",
                    focused: "bg-(--md-sys-color-primary)",
                    disabled: "bg-(--md-state-layers-on-surface-opacity-012)"
                },
                tonal: {
                    enabled: "bg-(--md-sys-color-secondary-container)",
                    hovered: "bg-(--md-sys-color-secondary-container)",
                    pressed: "bg-(--md-sys-color-secondary-container)",
                    focused: "bg-(--md-sys-color-secondary-container)",
                    disabled: "bg-(--md-state-layers-on-surface-opacity-012)"
                },
                outlined: {
                    enabled: "border border-(--md-sys-color-outline)",
                    hovered: "border border-(--md-sys-color-outline)",
                    pressed: "border border-(--md-sys-color-outline)",
                    focused: "border border-(--md-sys-color-primary)",
                    disabled: "border border-(--md-state-layers-on-surface-opacity-012)"
                },
                standard: {
                    enabled: "",
                    hovered: "",
                    pressed: "",
                    focused: "",
                    disabled: ""
                }
            };

            return cn(
                base,
                containerStyles[variant][currentState]
            );
        };

        const getStateLayerStyles = () => {
            // State layer styles based on variant and state
            const stateLayerStyles = {
                filled: {
                    enabled: "",
                    hovered: "bg-(--md-state-layers-on-primary-opacity-008)",
                    pressed: "bg-(--md-state-layers-on-primary-opacity-012)",
                    focused: "bg-(--md-state-layers-on-primary-opacity-012)",
                    disabled: ""
                },
                tonal: {
                    enabled: "",
                    hovered: "bg-(--md-state-layers-on-secondary-container-opacity-008)",
                    pressed: "bg-(--md-state-layers-on-secondary-container-opacity-012)",
                    focused: "bg-(--md-state-layers-on-secondary-container-opacity-012)",
                    disabled: ""
                },
                outlined: {
                    enabled: "",
                    hovered: "bg-(--md-state-layers-on-surface-variant-opacity-008)",
                    pressed: "bg-(--md-state-layers-on-surface-variant-opacity-012)",
                    focused: "bg-(--md-state-layers-on-surface-variant-opacity-012)",
                    disabled: ""
                },
                standard: {
                    enabled: "",
                    hovered: "bg-(--md-state-layers-on-surface-variant-opacity-008)",
                    pressed: "bg-(--md-state-layers-on-surface-variant-opacity-012)",
                    focused: "bg-(--md-state-layers-on-surface-variant-opacity-012)",
                    disabled: ""
                }
            };

            return stateLayerStyles[variant][currentState];
        };

        const getIconStyles = () => {
            // Icon color styles based on variant and state
            const iconStyles = {
                filled: {
                    enabled: "text-(--md-sys-color-on-primary)",
                    hovered: "text-(--md-sys-color-on-primary)",
                    pressed: "text-(--md-sys-color-on-primary)",
                    focused: "text-(--md-sys-color-on-primary)",
                    disabled: "opacity-38 text-(--md-sys-color-on-surface)"
                },
                tonal: {
                    enabled: "text-(--md-sys-color-on-secondary-container)",
                    hovered: "text-(--md-sys-color-on-secondary-container)",
                    pressed: "text-(--md-sys-color-on-secondary-container)",
                    focused: "text-(--md-sys-color-on-secondary-container)",
                    disabled: "opacity-38 text-(--md-sys-color-on-surface)"
                },
                outlined: {
                    enabled: "text-(--md-sys-color-on-surface-variant)",
                    hovered: "text-(--md-sys-color-on-surface-variant)",
                    pressed: "text-(--md-sys-color-on-surface-variant)",
                    focused: "text-(--md-sys-color-on-surface-variant)",
                    disabled: "opacity-38 text-(--md-sys-color-on-surface)"
                },
                standard: {
                    enabled: selected 
                        ? "text-(--md-sys-color-primary)" 
                        : "text-(--md-sys-color-on-surface-variant)",
                    hovered: selected 
                        ? "text-(--md-sys-color-primary)" 
                        : "text-(--md-sys-color-on-surface-variant)",
                    pressed: selected 
                        ? "text-(--md-sys-color-primary)" 
                        : "text-(--md-sys-color-on-surface-variant)",
                    focused: selected 
                        ? "text-(--md-sys-color-primary)" 
                        : "text-(--md-sys-color-on-surface-variant)",
                    disabled: "opacity-38 text-(--md-sys-color-on-surface)"
                }
            };

            return iconStyles[variant][currentState];
        };

        const getSizeStyles = () => {
            switch (size) {
                case "small":
                    return "w-8 h-8 text-lg";
                case "large":
                    return "w-14 h-14 text-2xl";
                default: // medium
                    return "w-10 h-10 text-xl";
            }
        };

        // Define ripple color based on button variant
        const buttonStyle = {
            '--mdc-ripple-color': variant === 'filled' ? 
                'var(--md-state-layers-on-primary-opacity-012)' :
                variant === 'tonal' ?
                'var(--md-state-layers-on-secondary-container-opacity-012)' :
                'var(--md-state-layers-on-surface-variant-opacity-012)',
        } as React.CSSProperties;

        return (
            <button
                ref={buttonRef}
                className={cn(
                    getVariantStyles(),
                    getSizeStyles(),
                    disabled && "cursor-not-allowed",
                    className
                )}
                style={buttonStyle}
                disabled={disabled}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setIsPressed(false);
                }}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            >
                {/* State layer overlay */}
                <div className={cn(
                    "absolute inset-0 rounded-full transition-all duration-200",
                    getStateLayerStyles()
                )} />
                
                {/* Icon */}
                <span 
                    className={cn(
                        "mdi relative z-10", 
                        selected ? "mdi-filled" : "",
                        getIconStyles()
                    )} 
                    aria-hidden="true"
                >
                    {icon}
                </span>
                
                {/* Badge */}
                {badge && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-(--md-sys-color-error) text-(--md-sys-color-on-error) text-xs font-medium rounded-full flex items-center justify-center px-1 z-20">
                        {badgeContent || ''}
                    </span>
                )}
            </button>
        );
    }
);

IconButton.displayName = "IconButton";

export default IconButton;
