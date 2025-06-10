'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import MainBottomNav from '@/components/main/MainBottomNav'; // Temporarily disabled
// import SessionStatusBanner from '@/components/SessionStatusBanner'; // Temporarily disabled

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout for user-facing pages
 * Includes desktop-only navbar and responsive bottom navigation
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-(--md-sys-color-background)">
      {/* Top Navigation - Desktop only */}
      <Navbar />
      
      {/* Session Status Banner - Temporarily disabled to debug infinite loop */}
      {/* <div className="px-4 pt-4" data-session-banner>
        <SessionStatusBanner />
      </div> */}
      
      {/* Main Content - adjusted spacing for mobile (no top navbar) and desktop */}
      <main className="flex-grow pb-20 md:pb-8">
        {children}
      </main>
      
      {/* Bottom Navigation - Mobile only - Temporarily disabled to debug infinite loop */}
      <MainBottomNav />
    </div>
  );
}
