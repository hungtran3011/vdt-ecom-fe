import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { ApiError } from '@/types/api';
import TokenRefreshManager from '@/utils/tokenRefreshManager';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Enhanced token getter - gets the raw Keycloak access token
async function getKeycloakAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Check if token refresh is blocked by circuit breaker
  const refreshManager = TokenRefreshManager.getInstance();
  if (!refreshManager.canAttemptRefresh()) {
    console.warn('⚠️ Token refresh blocked by circuit breaker - using existing session if available');
    
    // Try to get existing session without triggering refresh
    try {
      const session = await getSession();
      if (session?.accessToken) {
        return session.accessToken;
      }
    } catch (error) {
      console.warn('⚠️ Cannot get existing session:', error);
    }
    
    // Circuit breaker is active, return null to allow requests without token
    // This allows the app to continue functioning in a degraded state
    return null;
  }
  
  try {
    // Try multiple methods to get the session token
    let session;
    let token: string | null = null;
    
    // Method 1: Use getSession() from next-auth/react
    try {
      session = await getSession();
      token = session?.accessToken || null;
    } catch (error) {
      console.warn('⚠️ Method 1 (getSession) failed:', error);
    }
    
    // Method 2: If Method 1 failed or returned no token, try fetching from session API
    if (!token) {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          token = sessionData?.accessToken || null;
        }
      } catch (error) {
        console.warn('⚠️ Method 2 (fetch session) failed:', error);
      }
    }
    
    if (!token) {
      console.warn('⚠️ No access token available - continuing in degraded mode');
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    return null;
  }
}

// Request interceptor - add authentication token
api.interceptors.request.use(async (config) => {
  const token = await getKeycloakAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors with circuit breaker integration
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const refreshManager = TokenRefreshManager.getInstance();
    
    if (error.response?.status === 401) {
      console.log('❌ 401 Unauthorized detected');
      
      // If circuit breaker is active, don't attempt redirect immediately
      // This prevents infinite redirect loops during token refresh failures
      if (!refreshManager.canAttemptRefresh()) {
        console.log('⚠️ Circuit breaker active - not redirecting immediately');
        
        // Return a more specific error for blocked state
        const errorResponse: ApiError = {
          code: 'AUTH_CIRCUIT_BREAKER_ACTIVE',
          message: 'Authentication temporarily unavailable. Please try again later.',
          timestamp: new Date().toISOString(),
          details: 'Circuit breaker is active due to repeated authentication failures',
          path: error.config?.url || 'unknown'
        };
        
        return Promise.reject(errorResponse);
      }
      
      // Record the authentication failure
      refreshManager.recordRefreshAttempt(false, `401 error from ${error.config?.url}`);
      
      // Only redirect if we haven't hit the circuit breaker threshold
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        
        // Add a small delay to prevent rapid redirects
        setTimeout(() => {
          // Redirect based on current route
          if (currentPath.startsWith('/admin')) {
            window.location.href = '/api/auth/signin';
          } else {
            window.location.href = '/login';
          }
        }, 1000);
      }
    }
    
    // Return a properly formatted error
    const errorResponse: ApiError = {
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.message || 'An unknown error occurred',
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
      details: error.response?.data?.details,
      path: error.response?.data?.path || error.config?.url || 'unknown'
    };
    
    return Promise.reject(errorResponse);
  }
);

export default api;