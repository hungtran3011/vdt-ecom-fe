'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: boolean;
  badgeContent?: string;
  absolutePathIndicate?: boolean
}

export interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

export default function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-(--md-sys-color-surface-container)",
      "border-t border-(--md-sys-color-outline-variant) z-10",
      className
    )}>
      <div className="flex justify-around h-20">
        {items.map((item) => {
          const isActive = item.absolutePathIndicate ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full",
                "transition-colors duration-200"
              )}
            >
              <div 
                className={cn(
                  "flex flex-col items-center justify-center",
                  "py-1 px-3 rounded-full relative",
                  isActive && "bg-(--md-state-layers-primary-opacity-012)"
                )}
              >
                <span 
                  className={cn(
                    "mdi text-2xl",
                    isActive 
                      ? "text-(--md-sys-color-primary)" 
                      : "text-(--md-sys-color-on-surface-variant)"
                  )}
                >
                  {item.icon}
                </span>
                <span 
                  className={cn(
                    "text-xs",
                    isActive 
                      ? "text-(--md-sys-color-primary)" 
                      : "text-(--md-sys-color-on-surface-variant)"
                  )}
                >
                  {item.label}
                </span>
                
                {/* Badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-(--md-sys-color-error) text-(--md-sys-color-on-error) text-xs font-medium rounded-full flex items-center justify-center px-1 z-20">
                    {item.badgeContent || ''}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
