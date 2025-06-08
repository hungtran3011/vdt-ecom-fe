"use client"

import React from 'react';
import { cn } from '@/utils/cn';

export type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion';
export type ChipColor = 'primary' | 'secondary' | 'tertiary' | 'error';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChipVariant;
  color?: ChipColor;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  onTrailingIconClick?: () => void;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ 
    className, 
    variant = 'assist',
    color = 'primary',
    label,
    selected = false,
    disabled = false,
    leadingIcon,
    trailingIcon,
    onTrailingIconClick,
    onClick,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
      "border border-(--md-sys-color-outline)",
      !disabled && onClick && "cursor-pointer",
      disabled && "opacity-38 cursor-not-allowed"
    );

    const colorClasses = {
      primary: {
        default: "bg-(--md-sys-color-surface) text-(--md-sys-color-on-surface-variant)",
        selected: "bg-(--md-sys-color-secondary-container) text-(--md-sys-color-on-secondary-container) border-transparent",
        hover: "hover:bg-(--md-state-layers-on-surface-opacity-008)"
      },
      secondary: {
        default: "bg-(--md-sys-color-surface) text-(--md-sys-color-on-surface-variant)",
        selected: "bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container) border-transparent",
        hover: "hover:bg-(--md-state-layers-on-surface-opacity-008)"
      },
      tertiary: {
        default: "bg-(--md-sys-color-surface) text-(--md-sys-color-on-surface-variant)",
        selected: "bg-(--md-sys-color-tertiary-container) text-(--md-sys-color-on-tertiary-container) border-transparent",
        hover: "hover:bg-(--md-state-layers-on-surface-opacity-008)"
      },
      error: {
        default: "bg-(--md-sys-color-surface) text-(--md-sys-color-on-surface-variant)",
        selected: "bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) border-transparent",
        hover: "hover:bg-(--md-state-layers-on-surface-opacity-008)"
      }
    };

    const currentColorClasses = selected 
      ? colorClasses[color].selected 
      : colorClasses[color].default;

    const hoverClasses = !disabled && onClick ? colorClasses[color].hover : '';

    return (
      <div
        ref={ref}
        className={cn(baseClasses, currentColorClasses, hoverClasses, className)}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {leadingIcon && (
          <span className="mdi w-4 h-4">{leadingIcon}</span>
        )}
        
        <span>{label}</span>
        
        {trailingIcon && (
          <span 
            className={cn(
              "mdi w-4 h-4",
              onTrailingIconClick && !disabled && "cursor-pointer hover:bg-[color:var(--md-state-layers-on-surface-opacity-012)] rounded"
            )}
            onClick={disabled ? undefined : onTrailingIconClick}
          >
            {trailingIcon}
          </span>
        )}
      </div>
    );
  }
);

Chip.displayName = "Chip";

export default Chip;
