import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { KeycloakJWTPayload } from "@/types/KeycloakJWTPayload";
import { refreshAccessToken } from "@/utils/tokenRefresh";
import { debugTokenPayload, validateIssuerClaim } from "@/utils/tokenDebug";
import { parseJWTPayload } from "@/utils/jwtParser";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshToken(token: Record<string, unknown>) {
  try {
    console.log('🔄 JWT callback - attempting to refresh token');

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

          console.log('JWT callback - extracted roles:', roles);

        } catch (error) {
          console.error('Error decoding JWT in jwt callback:', error);
        }

        return token;
      }

      // Return previous token if the access token has not expired yet
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = token.expiresAt as number;

      // If token expires in less than 5 minutes, refresh it
      if (expiresAt && (expiresAt - now) < 300) {
        console.log('🔄 JWT callback - token expires soon, refreshing...');
        return await refreshToken(token);
      }

      // If there's an error from a previous refresh attempt, try to refresh again
      if (token.error === "RefreshAccessTokenError") {
        console.log('🔄 JWT callback - previous refresh failed, retrying...');
        return await refreshToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      console.log('🔍 Session callback - token data:', {
        hasAccessToken: !!token.accessToken,
        accessTokenLength: token.accessToken ? (token.accessToken as string).length : 0,
        accessTokenStart: token.accessToken ? (token.accessToken as string).substring(0, 50) + '...' : 'none',
        hasRoles: !!token.roles,
        roles: token.roles,
        hasError: !!token.error,
        error: token.error,
      });

      // If there's a refresh error, the session is invalid
      if (token.error === "RefreshAccessTokenError") {
        console.log('❌ Session callback - refresh token error, session invalid');
        return null as unknown as typeof session; // Force sign out
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
        userRoles: session.user.roles
      });

      return session;
    },
    async signIn() {
      // This callback is called whenever a user signs in
      console.log('SignIn callback triggered');
      return true;
    },
    
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl);
      
      // If this is a callback after sign in, redirect to homepage first
      // The middleware will then handle redirecting admin users to /admin
      if (url.startsWith(baseUrl + '/api/auth/callback')) {
        console.log('Post-signin redirect - redirecting to home, middleware will handle admin routing');
        return baseUrl + '/';
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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