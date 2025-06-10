'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Client-side component to handle admin user redirects
 * This prevents infinite redirect loops that can occur with middleware
 */
export default function AdminRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // Check if user is admin
    const roles = (session?.user as any)?.roles || [];
    const isAdmin = roles.includes('admin') || 
                   roles.includes('administrator') ||
                   roles.includes('realm-admin') ||
                   roles.includes('manage-users');

    // If admin user is on a user page, redirect to admin
    if (isAdmin && session) {
      const currentPath = window.location.pathname;
      const userPaths = ['/', '/categories', '/search', '/login', '/register', '/products'];
      
      const isOnUserPath = userPaths.some(path => 
        currentPath === path || 
        (path !== '/' && currentPath.startsWith(path))
      );

      if (isOnUserPath) {
        console.log('🔄 AdminRedirect: Redirecting admin user to /admin');
        router.replace('/admin');
      }
    }
  }, [session, status, router]);

  // This component doesn't render anything
  return null;
}
