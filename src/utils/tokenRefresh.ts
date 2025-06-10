import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { validateKeycloakConfig } from './envValidator';
import { validateJWTStructure, debugTokenSafely } from './jwtValidator';
import { parseJWTPayload, isJWTExpired } from './jwtParser';
import TokenRefreshManager from './tokenRefreshManager';

interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Enhanced token refresh function with circuit breaker pattern
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse | null> {
  const refreshManager = TokenRefreshManager.getInstance();

  // Check if we should attempt refresh based on recent failure history
  if (!refreshManager.canAttemptRefresh()) {
    console.log('🚫 Token refresh blocked by circuit breaker or retry limits');
    return null;
  }

  try {
    console.log('🔄 Attempting to refresh access token...');

    // First, validate the refresh token structure
    const refreshValidation = validateJWTStructure(refreshToken);
    if (!refreshValidation.isValid) {
      const error = `Refresh token is malformed: ${refreshValidation.error}`;
      console.error('❌', error);
      debugTokenSafely(refreshToken, 'Malformed Refresh Token');
      refreshManager.recordRefreshAttempt(false, error);
      return null;
    }

    // Validate and get normalized Keycloak configuration
    const config = validateKeycloakConfig();
    const url = `${config.issuer}/protocol/openid-connect/token`;
    
    console.log('🔄 Refresh token URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = `HTTP ${response.status}: ${response.statusText} - ${errorText}`;
      console.error('❌ Failed to refresh token:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      refreshManager.recordRefreshAttempt(false, error);
      return null;
    }

    const tokens: TokenRefreshResponse = await response.json();
    
    // Validate the new access token before returning it
    const accessTokenValidation = validateJWTStructure(tokens.access_token);
    if (!accessTokenValidation.isValid) {
      const error = `Received malformed access token from refresh: ${accessTokenValidation.error}`;
      console.error('❌', error);
      debugTokenSafely(tokens.access_token, 'Malformed New Access Token');
      refreshManager.recordRefreshAttempt(false, error);
      return null;
    }
    
    console.log('✅ Successfully refreshed access token with valid structure');
    refreshManager.recordRefreshAttempt(true);
    
    // Debug the new token in development
    if (process.env.NODE_ENV === 'development') {
      debugTokenSafely(tokens.access_token, 'Refreshed Access Token');
    }
    
    return tokens;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error refreshing access token:', error);
    refreshManager.recordRefreshAttempt(false, errorMessage);
    return null;
  }
}

/**
 * Gets a fresh access token, refreshing if necessary
 * This is useful for client-side components
 */
export async function getFreshAccessToken(): Promise<string | null> {
  try {
    // Try to get current session from NextAuth
    const response = await fetch('/api/auth/session');
    if (!response.ok) {
      console.log('❌ No valid session found');
      return null;
    }

    const session = await response.json();
    if (!session?.accessToken) {
      console.log('❌ No access token in session');
      return null;
    }

    // Check if token is expired (with 5 minute buffer)
    const token = session.accessToken;
    
    // Use consistent JWT parsing and expiration checking
    if (isJWTExpired(token, 300)) { // 300 seconds = 5 minutes buffer
      console.log('🔄 Access token expires soon, attempting refresh...');
      
      // Trigger a refresh by calling the refresh endpoint
      const refreshResponse = await fetch('/api/auth/refresh-token', {
        method: 'POST',
      });
      
      if (refreshResponse.ok) {
        const refreshedSession = await refreshResponse.json();
        return refreshedSession.accessToken;
      }
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error getting fresh access token:', error);
    return null;
  }
}
