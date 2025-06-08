import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { ApiError } from '@/types/api';

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
      console.error('❌ No access token available from any method');
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

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      console.log('❌ 401 Unauthorized - redirecting to login');
      
      // Re-enabled redirect functionality
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        
        // Redirect based on current route
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/api/auth/signin';
        } else {
          window.location.href = '/login';
        }
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