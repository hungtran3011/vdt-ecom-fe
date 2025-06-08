import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

/**
 * Creates an API client with proper token handling and issuer validation
 */
export function createApiClient(baseURL?: string): AxiosInstance {
  const client = axios.create({
    baseURL: baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Add request interceptor to include auth token
  client.interceptors.request.use(
    async (config) => {
      if (typeof window !== 'undefined') {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
          
          // Add issuer information for backend validation if needed
          const payload = parseTokenPayload(session.accessToken);
          if (payload?.iss) {
            config.headers['X-Token-Issuer'] = payload.iss;
          }
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const errorDetails = error.response.data;
        
        // Check if it's an issuer validation error
        if (errorDetails?.error_description?.includes('iss claim')) {
          console.error('🚨 Issuer claim validation failed:', {
            error: errorDetails.error,
            description: errorDetails.error_description,
            recommendation: 'Check that your backend API is configured to accept tokens from your Keycloak issuer'
          });
          
          // You might want to show a user-friendly error or attempt to refresh
          if (typeof window !== 'undefined') {
            // Could redirect to a debug page or show notification
            console.log('💡 Visit /api/debug-issuer to see detailed token information');
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Safely parse JWT token payload
 */
function parseTokenPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// Export a default instance
export const apiClient = createApiClient();
