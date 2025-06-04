"use client"

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { MDCRipple } from '@material/ripple';

export type ButtonMode = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonMode;
    label?: string;
    hasIcon?: boolean;
    hasLabel?: boolean;
    icon?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ 
        className, 
        variant: mode = 'filled', 
        label, 
        children, 
        disabled = false, 
        hasIcon = false,
        hasLabel = true,
        icon,
        ...props 
    }, ref) => {
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

        // Base classes for button container
        const baseButtonClasses = "h-10 rounded-full inline-flex flex-col justify-center items-center gap-2 overflow-hidden relative";

        // Mode-specific classes for button container
        const modeButtonClasses = {
            filled: "",
            outlined: "outline-1 outline-offset-[-1px]",
            text: "",
            elevated: "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)]",
            tonal: "bg-(--md-sys-color-secondary-container)"
        };

        // State-specific classes for button container based on mode
        const stateButtonClasses = {
            filled: {
                enabled: "bg-(--md-sys-color-primary)",
                hovered: "bg-(--md-sys-color-primary) shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)]",
                pressed: "bg-(--md-sys-color-primary)",
                disabled: "",
                focused: "bg-(--md-sys-color-primary)",
            },
            outlined: {
                enabled: "outline-(--md-sys-color-outline)",
                hovered: "outline-(--md-sys-color-outline)",
                pressed: "outline-(--md-sys-color-outline)",
                disabled: "outline-(--md-state-layers-on-surface-opacity-012)",
                focused: "outline-(--md-sys-color-primary)",
            },
            text: {
                enabled: "",
                hovered: "",
                pressed: "",
                disabled: "",
                focused: "",
            },
            elevated: {
                enabled: "bg-(--md-sys-color-surface-container-low) shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15)]",
                hovered: "bg-(--md-sys-color-surface-container-low) shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)]",
                pressed: "bg-(--md-sys-color-surface-container-low) shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15)]",
                disabled: "",
                focused: "bg-(--md-sys-color-surface-container-low)",
            },
            tonal: {
                enabled: "bg-(--md-sys-color-secondary-container)",
                hovered: "bg-(--md-sys-color-secondary-container)",
                pressed: "bg-(--md-sys-color-secondary-container)",
                disabled: "bg-(--md-state-layers-on-surface-opacity-012)",
                focused: "bg-(--md-sys-color-secondary-container)",
            }
        };

        // Base classes for inner container
        const baseInnerClasses = "self-stretch flex-1 inline-flex justify-center items-center gap-2 px-6 py-2.5";

        // State-specific classes for inner container based on mode
        const stateInnerClasses = {
            filled: {
                enabled: "",
                hovered: "bg-(--md-state-layers-on-primary-opacity-008)",
                pressed: "bg-(--md-state-layers-on-primary-opacity-012) overflow-hidden",
                disabled: "bg-(--md-state-layers-on-surface-opacity-012)",
                focused: "",
            },
            outlined: {
                enabled: "",
                hovered: "bg-(--md-state-layers-primary-opacity-008)",
                pressed: "bg-(--md-state-layers-primary-opacity-012)",
                disabled: "",
                focused: "bg-(--md-state-layers-primary-opacity-012)",
            },
            text: {
                enabled: "",
                hovered: "bg-(--md-state-layers-on-surface-opacity-008)",
                pressed: "bg-(--md-state-layers-on-surface-opacity-012)",
                disabled: "",
                focused: "bg-(--md-state-layers-on-surface-opacity-012)",
            },
            elevated: {
                enabled: "",
                hovered: "bg-(--md-state-layers-on-primary-opacity-008)",
                pressed: "bg-(--md-state-layers-on-primary-opacity-012)",
                disabled: "bg-(--md-state-layers-on-surface-opacity-012)",
                focused: "bg-(--md-state-layers-on-primary-opacity-012)",
            },
            tonal: {
                enabled: "",
                hovered: "bg-(--md-state-layers-on-secondary-container-opacity-008)",
                pressed: "bg-(--md-state-layers-on-secondary-container-opacity-012)",
                disabled: "bg-(--md-state-layers-on-surface-opacity-012)",
                focused: "bg-(--md-state-layers-on-secondary-container-opacity-012)",
            }
        };

        // Base classes for text
        const baseTextClasses = "text-center justify-center text-sm font-medium leading-tight tracking-tight";

        // State-specific classes for text based on mode
        const stateTextClasses = {
            filled: {
                enabled: "text-(--md-sys-color-on-primary)",
                hovered: "text-(--md-sys-color-on-primary)",
                pressed: "text-(--md-sys-color-on-primary)",
                disabled: "opacity-40 text-(--md-sys-color-on-surface)",
                focused: "text-(--md-sys-color-on-primary)",
            },
            outlined: {
                enabled: "text-(--md-sys-color-primary)",
                hovered: "text-(--md-sys-color-primary)",
                pressed: "text-yellow-800",
                disabled: "opacity-40 text-(--md-sys-color-on-surface)",
                focused: "text-(--md-sys-color-primary)",
            },
            text: {
                enabled: "text-(--md-sys-color-primary)",
                hovered: "text-(--md-sys-color-primary)",
                pressed: "text-(--md-sys-color-primary)",
                disabled: "opacity-40 text-(--md-sys-color-on-surface)",
                focused: "text-(--md-sys-color-primary)",
            },
            elevated: {
                enabled: "text-(--md-sys-color-primary)",
                hovered: "text-(--md-sys-color-primary)",
                pressed: "text-(--md-sys-color-primary)",
                disabled: "opacity-40 text-(--md-sys-color-on-surface)",
                focused: "text-(--md-sys-color-primary)",
            },
            tonal: {
                enabled: "text-(--md-sys-color-on-secondary-container)",
                hovered: "text-(--md-sys-color-on-secondary-container)",
                pressed: "text-(--md-sys-color-on-secondary-container)",
                disabled: "opacity-40 text-(--md-sys-color-on-surface)",
                focused: "text-(--md-sys-color-on-secondary-container)",
            }
        };

        // Add MDC Ripple classes to your button classes
        const buttonClasses = cn(
            baseButtonClasses,
            'mdc-ripple-surface', // Add this class for MDC Ripple
            modeButtonClasses[mode],
            stateButtonClasses[mode][currentState],
            // Icon-only buttons are circular
            (hasIcon && !hasLabel) && "w-10 aspect-square",
            className
        );

        // Define ripple color based on button mode
        const buttonStyle = {
            // Use lighter ripple color (white-based) for dark backgrounds
            '--mdc-ripple-color': mode === 'filled' || 
                                 (mode === 'tonal' && currentState !== 'disabled') ? 
                                 'var(--md-state-layers-on-primary-opacity-012)' : 
                                 'var(--md-state-layers-primary-opacity-012)'
        } as React.CSSProperties;

        const innerClasses = cn(
            baseInnerClasses,
            // Adjust padding for icon-only buttons
            (hasIcon && !hasLabel) && "px-0",
            // Adjust padding when both icon and label are present
            (hasIcon && hasLabel) && "px-4 gap-2",
            stateInnerClasses[mode][currentState]
        );

        const textClasses = cn(
            baseTextClasses,
            stateTextClasses[mode][currentState]
        );

        // Icon color classes based on the button mode and state
        const iconClasses = cn(
            "w-6 h-6",
            stateTextClasses[mode][currentState]
        );

        return (
            <button
                className={buttonClasses}
                ref={buttonRef} // Use the local ref for MDC Ripple
                style={buttonStyle} // Apply the custom ripple color
                disabled={disabled}
                onClick={props.onClick}
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
                <div className={innerClasses}>
                    {hasIcon && icon && (
                        <span className={cn("mdi", iconClasses)}>
                            {icon}
                        </span>
                    )}
                    {hasLabel && (
                        <div className={textClasses}>
                            {label || children || "Label"}
                        </div>
                    )}
                </div>
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
