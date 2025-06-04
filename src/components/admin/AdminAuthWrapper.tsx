'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAdmin } from '@/utils/roleCheck';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    console.log('AdminAuthWrapper - Session:', session);
    console.log('AdminAuthWrapper - User roles:', session?.user?.roles);
    console.log('AdminAuthWrapper - isAdmin result:', isAdmin(session));

    if (!session) {
      console.log('No session found, redirecting to login');
      router.push('/login');
      return;
    }

    if (!isAdmin(session)) {
      console.log('User is not admin, redirecting to home');
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || !isAdmin(session)) {
    return null;
  }

  return <>{children}</>;
}