"use client"

import React from 'react';
import { cn } from '@/utils/cn';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'elevated', children, ...props }, ref) => {
    const baseClasses = "rounded-xl transition-all duration-200";
    
    const variantClasses = {
      elevated: "bg-(--md-sys-color-surface-container-low) shadow-sm hover:shadow-md",
      filled: "bg-(--md-sys-color-surface-container-highest)",
      outlined: "bg-(--md-sys-color-surface) border border-(--md-sys-color-outline-variant)"
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
