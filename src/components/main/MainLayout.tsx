'use client';

import React from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import Navbar from '@/components/Navbar';
import MainBottomNav from '@/components/main/MainBottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout for user-facing pages
 * Includes desktop-only navbar and responsive bottom navigation
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <QueryProvider>
      <div className="flex flex-col min-h-screen bg-(--md-sys-color-background)">
        {/* Top Navigation - Desktop only */}
        <Navbar />
        
        {/* Main Content - adjusted spacing for mobile (no top navbar) and desktop */}
        <main className="flex-grow pb-20 md:pb-8">
          {children}
        </main>
        
        {/* Bottom Navigation - Mobile only */}
        <MainBottomNav />
      </div>
    </QueryProvider>
  );
}
