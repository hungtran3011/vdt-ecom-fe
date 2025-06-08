'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('AdminAuthWrapper - Session status:', {
      status,
      sessionExists: !!session,
      userEmail: session?.user?.email,
      userRoles: session?.user?.roles,
    });
  }, [session, status]);

  // If middleware let us get here, we're authenticated and authorized
  // Just wait for session to load to avoid hydration issues
  if (status === 'loading') {
    console.log('AdminAuthWrapper - Loading session...');
    return (
      <div className="flex justify-center items-center h-screen bg-(--md-sys-color-surface)">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-(--md-sys-color-outline-variant) border-t-(--md-sys-color-primary)"></div>
      </div>
    );
  }

  // Trust middleware's authentication - if we got here, we're authorized
  console.log('AdminAuthWrapper - Rendering admin content (middleware verified)');
  return <>{children}</>;
}