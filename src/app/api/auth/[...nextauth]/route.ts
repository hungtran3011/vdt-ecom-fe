import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { KeycloakJWTPayload } from "@/types/KeycloakJWTPayload";
import { refreshAccessToken } from "@/utils/tokenRefresh";
import { debugTokenPayload, validateIssuerClaim } from "@/utils/tokenDebug";
import { parseJWTPayload } from "@/utils/jwtParser";
import TokenRefreshManager from "@/utils/tokenRefreshManager";

/**
 * Enhanced token refresh function with circuit breaker pattern
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshToken(token: Record<string, unknown>) {
  const refreshManager = TokenRefreshManager.getInstance();

  try {
    console.log('🔄 JWT callback - attempting to refresh token');

    // Check if refresh should be attempted based on recent failure history
    if (!refreshManager.canAttemptRefresh()) {
      console.log('🚫 JWT callback - refresh blocked by circuit breaker');
      
      // If we should sign out due to persistent failures, return error
      if (refreshManager.shouldSignOut()) {
        console.log('❌ JWT callback - forcing sign out due to persistent refresh failures');
        return {
          ...token,
          error: "RefreshAccessTokenError",
          forceSignOut: true
        };
      }
      
      // Otherwise, keep existing token and try again later
      return {
        ...token,
        error: "RefreshAccessTokenError"
      };
    }

    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshedTokens = await refreshAccessToken(token.refreshToken as string);

    if (!refreshedTokens) {
      throw new Error('Failed to refresh token');
    }

    // Debug the refreshed access token in development
    if (process.env.NODE_ENV === 'development') {
      debugTokenPayload(refreshedTokens.access_token);
      validateIssuerClaim(refreshedTokens.access_token);
    }

    // Parse the new access token to extract user info
    const payload = parseJWTPayload<KeycloakJWTPayload>(refreshedTokens.access_token);
    
    if (!payload) {
      throw new Error('Failed to parse refreshed access token');
    }

    const roles: string[] = [];

    // Get realm roles
    if (payload.realm_access?.roles) {
      roles.push(...payload.realm_access.roles);
    }

    // Get client-specific roles
    if (payload.resource_access) {
      Object.entries(payload.resource_access).forEach(([, resource]) => {
        if (resource.roles) {
          roles.push(...resource.roles);
        }
      });
    }

    console.log('✅ JWT callback - token refreshed successfully');

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      roles,
      preferred_username: payload.preferred_username,
      sub: payload.sub,
      email: payload.email,
      error: undefined, // Clear any previous errors
      forceSignOut: undefined, // Clear any sign out flags
    };
  } catch (error) {
    console.error('❌ JWT callback - error refreshing token:', error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signOut({ token }) {
      // Log the signout event
      console.log('🚪 NextAuth signOut event triggered');
      
      // If we have an ID token, we could potentially make a logout request to Keycloak
      // But in practice, the client-side logout handles this
      if (token?.idToken) {
        console.log('🔑 ID token available for Keycloak logout');
      }
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        console.log('🔐 JWT callback - initial sign in, storing tokens');
        
        // Debug the initial access token
        if (process.env.NODE_ENV === 'development' && account.access_token) {
          debugTokenPayload(account.access_token);
          validateIssuerClaim(account.access_token);
        }
        
        // Only store essential tokens
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token; // Store ID token for logout
        token.expiresAt = account.expires_at;

        // Extract roles and essential user info from access token
        try {
          const payload = parseJWTPayload<KeycloakJWTPayload>(account.access_token!);
          
          if (!payload) {
            throw new Error('Failed to parse access token');
          }

          const roles: string[] = [];

          // Get realm roles
          if (payload.realm_access?.roles) {
            roles.push(...payload.realm_access.roles);
          }

          // Get client-specific roles
          if (payload.resource_access) {
            Object.entries(payload.resource_access).forEach(([, resource]) => {
              if (resource.roles) {
                roles.push(...resource.roles);
              }
            });
          }

          // Store only essential user info to minimize token size
          token.roles = roles;
          token.preferred_username = payload.preferred_username;
          token.sub = payload.sub;
          token.email = payload.email;

          console.log('JWT callback - extracted user info:', {
            roles,
            preferred_username: payload.preferred_username,
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            given_name: payload.given_name,
            family_name: payload.family_name
          });

        } catch (error) {
          console.error('Error decoding JWT in jwt callback:', error);
        }

        return token;
      }

      // Return previous token if the access token has not expired yet
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = token.expiresAt as number;

      // If token expires in less than 2 minutes, refresh it (increased from 5 minutes to prevent frequent calls)
      if (expiresAt && (expiresAt - now) < 120) {
        console.log('🔄 JWT callback - token expires soon, refreshing...');
        
        // Add rate limiting to prevent rapid successive refresh attempts
        const lastRefreshTime = token.lastRefreshTime as number || 0;
        if (now - lastRefreshTime < 30) { // Don't refresh more than once every 30 seconds
          console.log('⏸️ JWT callback - refresh rate limited, returning existing token');
          return token;
        }
        
        const refreshedToken = await refreshToken(token);
        return {
          ...refreshedToken,
          lastRefreshTime: now
        };
      }

      // If there's an error from a previous refresh attempt, handle based on refresh manager state
      if (token.error === "RefreshAccessTokenError") {
        const refreshManager = TokenRefreshManager.getInstance();
        
        // Check if we should force sign out
        if (token.forceSignOut || refreshManager.shouldSignOut()) {
          console.log('❌ JWT callback - forcing sign out due to persistent refresh failures');
          return {
            ...token,
            error: "RefreshAccessTokenError",
            forceSignOut: true
          };
        }
        
        // If circuit breaker allows, try to refresh again with exponential backoff
        if (refreshManager.canAttemptRefresh()) {
          console.log('🔄 JWT callback - previous refresh failed, retrying with backoff...');
          
          // Add a small delay for exponential backoff
          const delay = refreshManager.getRetryDelay();
          if (delay > 1000) { // Only delay if it's more than 1 second
            console.log(`⏱️ JWT callback - waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000))); // Cap at 5 seconds
          }
          
          return await refreshToken(token);
        } else {
          console.log('🚫 JWT callback - refresh blocked by circuit breaker, keeping existing token');
          return token; // Keep existing token without retry
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Rate limit session callback logs to prevent spam
      const now = Date.now();
      const lastSessionLog = (global as unknown as Record<string, number>)._lastSessionLog || 0;
      
      if (now - lastSessionLog < 5000) { // Only log once every 5 seconds
        // Skip logging but still process
      } else {
        console.log('🔍 Session callback - token data:', {
          hasAccessToken: !!token.accessToken,
          accessTokenLength: token.accessToken ? String(token.accessToken).length : 0,
          accessTokenStart: token.accessToken ? String(token.accessToken).substring(0, 50) + '...' : 'none',
          hasRoles: !!token.roles,
          roles: token.roles,
          hasError: !!token.error,
          error: token.error,
          forceSignOut: token.forceSignOut
        });
        (global as unknown as Record<string, number>)._lastSessionLog = now;
      }

      // If there's a refresh error and we should force sign out, invalidate the session
      if (token.error === "RefreshAccessTokenError" && token.forceSignOut) {
        console.log('❌ Session callback - refresh token error with force sign out flag, session invalid');
        return null as unknown as typeof session; // Force sign out
      }

      // If there's a refresh error but no force sign out, provide a degraded session
      if (token.error === "RefreshAccessTokenError") {
        console.log('⚠️ Session callback - refresh token error but not forcing sign out, providing degraded session');
        // Return a minimal session that won't work for API calls but won't break the UI
        return {
          ...session,
          accessToken: undefined,
          user: {
            ...session.user,
            roles: []
          },
          error: "RefreshAccessTokenError"
        };
      }

      // Only include essential data in session to reduce cookie size
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string; // Include ID token for logout
      session.user.roles = token.roles as string[] || [];
      session.user.preferred_username = token.preferred_username as string;
      session.user.id = token.sub as string;
      session.user.email = token.email as string;

      console.log('🔍 Session callback - final session:', {
        hasAccessToken: !!session.accessToken,
        accessTokenLength: session.accessToken?.length,
        userRoles: session.user.roles,
        userId: session.user.id,
        userEmail: session.user.email,
        tokenSub: token.sub,
        tokenEmail: token.email
      });

      return session;
    },
    async signIn() {
      // This callback is called whenever a user signs in
      console.log('SignIn callback triggered');
      return true;
    },
    
    // Commenting out redirect callback to prevent infinite loops
    // The client-side AdminRedirect component will handle admin routing
    // async redirect({ url, baseUrl }) {
    //   // Only log if in development to reduce noise
    //   if (process.env.NODE_ENV === 'development') {
    //     console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl);
    //   }
    //   
    //   // If the URL is already the base URL, don't redirect to avoid loops
    //   if (url === baseUrl || url === baseUrl + '/') {
    //     return url;
    //   }
    //   
    //   // For relative URLs, make them absolute
    //   if (url.startsWith("/")) {
    //     return `${baseUrl}${url}`;
    //   }
    //   
    //   // For URLs on the same origin, allow them
    //   try {
    //     const urlObj = new URL(url);
    //     const baseUrlObj = new URL(baseUrl);
    //     
    //     if (urlObj.origin === baseUrlObj.origin) {
    //       return url;
    //     }
    //   } catch {
    //     // If URL parsing fails, fall back to base URL
    //   }
    //   
    //   // Default: redirect to base URL
    //   return baseUrl;
    // },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - less frequent session updates
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };