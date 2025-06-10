/**
 * Session Status Banner
 * 
 * Displays user-friendly notifications about session health,
 * token refresh issues, and authentication status.
 */

'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import Button from '@/components/Button';
import useSessionHealth from '@/hooks/useSessionHealth';

interface SessionStatusBannerProps {
  className?: string;
}

const SessionStatusBanner: React.FC<SessionStatusBannerProps> = ({ className = '' }) => {
  const sessionHealth = useSessionHealth();

  if (!sessionHealth.shouldShowWarning) {
    return null;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  const handleReset = () => {
    sessionHealth.resetRefreshState();
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/login',
        redirect: true
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      window.location.href = '/login';
    }
  };

  const getBannerStyle = () => {
    switch (sessionHealth.status) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconClass = () => {
    switch (sessionHealth.status) {
      case 'error':
        return 'mdi-alert-circle text-red-500';
      case 'warning':
        return 'mdi-alert text-yellow-500';
      default:
        return 'mdi-information text-blue-500';
    }
  };

  return (
    <div className={`${getBannerStyle()} border rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className={`mdi ${getIconClass()} text-xl`}></span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {sessionHealth.status === 'error' ? 'Authentication Error' : 'Session Warning'}
          </h3>
          <div className="mt-1 text-sm">
            <p>{sessionHealth.warningMessage}</p>
            
            {sessionHealth.circuitBreakerOpen && sessionHealth.nextRetryTime && (
              <p className="mt-1 text-xs opacity-75">
                Automatic retry scheduled for: {new Date(sessionHealth.nextRetryTime).toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {sessionHealth.canRetry && !sessionHealth.circuitBreakerOpen && (
              <Button
                label="Retry Now"
                variant="outlined"
                size="small"
                onClick={handleRetry}
                hasIcon
                icon="refresh"
                className="text-xs"
              />
            )}
            
            {sessionHealth.circuitBreakerOpen && (
              <Button
                label="Reset State"
                variant="outlined"
                size="small"
                onClick={handleReset}
                hasIcon
                icon="restore"
                className="text-xs"
              />
            )}
            
            <Button
              label="Sign Out"
              variant="outlined"
              size="small"
              onClick={handleSignOut}
              hasIcon
              icon="logout"
              className="text-xs"
            />
          </div>
        </div>
        
        <div className="ml-3 flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black hover:bg-opacity-10"
            onClick={() => {
              // Hide the banner temporarily (it will reappear if the issue persists)
              const banner = document.querySelector('[data-session-banner]') as HTMLElement;
              if (banner) {
                banner.style.display = 'none';
                setTimeout(() => {
                  banner.style.display = '';
                }, 60000); // Show again after 1 minute
              }
            }}
          >
            <span className="sr-only">Dismiss</span>
            <span className="mdi mdi-close text-lg"></span>
          </button>
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs opacity-75 hover:opacity-100">
            Debug Info (Development Only)
          </summary>
          <div className="mt-2 p-2 bg-black bg-opacity-10 rounded text-xs">
            <pre className="overflow-x-auto">
              {JSON.stringify(sessionHealth.refreshState, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default SessionStatusBanner;
