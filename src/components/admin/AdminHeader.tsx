'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { t } from '@/utils/localization';

export default function AdminHeader() {
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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
    <header className="bg-(--md-sys-color-surface) border-b border-(--md-sys-color-outline-variant)">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-(--md-sys-color-primary-container) flex items-center justify-center">
              <span className="mdi text-lg text-(--md-sys-color-on-primary-container)">
                admin_panel_settings
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-(--md-sys-color-on-surface)">
                {t('admin.dashboard')}
              </h1>
              <span className="hidden sm:inline-block text-xs text-(--md-sys-color-on-surface-variant)">
                {t('admin.managementPortal')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {session && (
              <Card className="hidden sm:block bg-(--md-sys-color-surface-container-highest) px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-(--md-sys-color-primary-container) flex items-center justify-center">
                    <span className="mdi text-sm text-(--md-sys-color-on-primary-container)">
                      person
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-(--md-sys-color-on-surface)">
                      {session.user?.given_name || session.user?.name}
                    </span>
                    <span className="text-xs text-(--md-sys-color-on-surface-variant)">
                      {t('admin.administrator')}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <Button
              variant={isMobile ? "text" : "outlined"}
              label={isMobile ? undefined : t('actions.logout')}
              hasIcon
              hasLabel={!isMobile}
              icon="logout"
              onClick={handleSignOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
}