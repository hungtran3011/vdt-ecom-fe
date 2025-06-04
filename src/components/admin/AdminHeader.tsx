'use client';

import { useSession, signOut } from 'next-auth/react';
import Button from '@/components/Button';

export default function AdminHeader() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      // If we have an ID token, logout from Keycloak directly
      if (session?.idToken) {
        const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?id_token_hint=${session.idToken}&post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;

        // Clear NextAuth session first
        await signOut({ redirect: false });

        // Then redirect to Keycloak logout
        window.location.href = keycloakLogoutUrl;
      } else {
        // Fallback to normal NextAuth logout
        await signOut({
          callbackUrl: '/',
          redirect: true
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {session?.user?.given_name || session?.user?.name}
            </span>
            <Button variant="outlined" onClick={handleSignOut}>
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}