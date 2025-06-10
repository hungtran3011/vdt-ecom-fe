/**
 * Session Health Monitor Hook
 * 
 * Monitors session health, token refresh status, and provides
 * user feedback for authentication issues.
 */

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import TokenRefreshManager from '@/utils/tokenRefreshManager';
import SessionThrottle from '@/utils/sessionThrottle';

interface SessionHealthState {
  isHealthy: boolean;
  hasRefreshError: boolean;
  circuitBreakerOpen: boolean;
  nextRetryTime: number | null;
  failureCount: number;
  canRetry: boolean;
  shouldShowWarning: boolean;
  warningMessage: string | null;
}

export function useSessionHealth() {
  const { data: session, status } = useSession();
  const [healthState, setHealthState] = useState<SessionHealthState>({
    isHealthy: true,
    hasRefreshError: false,
    circuitBreakerOpen: false,
    nextRetryTime: null,
    failureCount: 0,
    canRetry: true,
    shouldShowWarning: false,
    warningMessage: null
  });

  const refreshManager = TokenRefreshManager.getInstance();
  const sessionThrottle = SessionThrottle.getInstance();

  const updateHealthState = useCallback(() => {
    // Throttle session health checks to prevent infinite loops
    if (!sessionThrottle.canCheckSession()) {
      return;
    }

    const refreshState = refreshManager.getState();
    const hasSessionError = (session as any)?.error === 'RefreshAccessTokenError';
    
    const newState: SessionHealthState = {
      isHealthy: status === 'authenticated' && !hasSessionError && !refreshState.circuitBreaker.isOpen,
      hasRefreshError: hasSessionError,
      circuitBreakerOpen: refreshState.circuitBreaker.isOpen,
      nextRetryTime: refreshState.circuitBreaker.nextAttemptTime || null,
      failureCount: refreshState.circuitBreaker.failureCount,
      canRetry: refreshState.canRefresh,
      shouldShowWarning: false,
      warningMessage: null
    };

    // Determine if we should show warnings and what message
    if (hasSessionError && refreshState.circuitBreaker.isOpen) {
      newState.shouldShowWarning = true;
      newState.warningMessage = `Authentication issues detected. System will retry automatically at ${new Date(refreshState.circuitBreaker.nextAttemptTime).toLocaleTimeString()}.`;
    } else if (hasSessionError && refreshState.circuitBreaker.failureCount > 0) {
      newState.shouldShowWarning = true;
      newState.warningMessage = `Session refresh failed ${refreshState.circuitBreaker.failureCount} time(s). You may experience limited functionality.`;
    } else if (!session?.accessToken && status === 'authenticated') {
      newState.shouldShowWarning = true;
      newState.warningMessage = 'Session is in a degraded state. Some features may not work properly.';
    }

    setHealthState(prevState => {
      // Only update if state actually changed to prevent unnecessary re-renders
      if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
        return newState;
      }
      return prevState;
    });
  }, []); // Remove dependencies to prevent infinite loops

  // Update health state when session changes (but debounced and throttled)
  useEffect(() => {
    if (status === 'loading') return; // Don't check while loading
    
    // Debounce the update to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      updateHealthState();
    }, 500); // Increased debounce time
    
    return () => clearTimeout(timeoutId);
  }, [session, status]); // Only depend on session and status

  // Periodically check health state (much less frequently)
  useEffect(() => {
    const interval = setInterval(updateHealthState, 120000); // Check every 2 minutes instead of 30 seconds
    return () => clearInterval(interval);
  }, [updateHealthState]);

  const resetRefreshState = useCallback(() => {
    refreshManager.reset();
    updateHealthState();
  }, [refreshManager, updateHealthState]);

  const getHealthStatus = useCallback((): 'healthy' | 'warning' | 'error' => {
    if (healthState.isHealthy) return 'healthy';
    if (healthState.circuitBreakerOpen || healthState.failureCount >= 3) return 'error';
    return 'warning';
  }, [healthState]);

  return {
    ...healthState,
    status: getHealthStatus(),
    resetRefreshState,
    refreshState: refreshManager.getState()
  };
}

export default useSessionHealth;
