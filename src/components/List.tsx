"use client"

import React from 'react';
import { cn } from '@/utils/cn';

export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  supportingText?: string;
  overline?: string;
}

const List = React.forwardRef<HTMLDivElement, ListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("divide-y divide-(--md-sys-color-outline-variant)", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ 
    className, 
    children, 
    onClick, 
    disabled = false,
    leading,
    trailing,
    supportingText,
    overline,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      "px-4 py-3 flex items-center gap-4 min-h-[56px]",
      "text-(--md-sys-color-on-surface)",
      onClick && !disabled && "cursor-pointer hover:bg-(--md-state-layers-on-surface-opacity-008) active:bg-(--md-state-layers-on-surface-opacity-012)",
      disabled && "opacity-38 cursor-not-allowed"
    );

    return (
      <div
        ref={ref}
        className={cn(baseClasses, className)}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {leading && (
          <div className="flex-shrink-0">
            {leading}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {overline && (
            <div className="text-xs text-(--md-sys-color-on-surface-variant) font-medium mb-0.5">
              {overline}
            </div>
          )}
          
          <div className="text-base font-normal">
            {children}
          </div>
          
          {supportingText && (
            <div className="text-sm text-(--md-sys-color-on-surface-variant) mt-0.5">
              {supportingText}
            </div>
          )}
        </div>
        
        {trailing && (
          <div className="flex-shrink-0">
            {trailing}
          </div>
        )}
      </div>
    );
  }
);

List.displayName = "List";
ListItem.displayName = "ListItem";

export { List, ListItem };
