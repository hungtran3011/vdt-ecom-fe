import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { KeycloakJWTPayload } from "@/types/KeycloakJWTPayload";

const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;

        // MOVE THE ROLE EXTRACTION HERE (from signIn callback)
        try {
          const payload: KeycloakJWTPayload = JSON.parse(
            Buffer.from(account.access_token!.split('.')[1], 'base64').toString()
          );

          const roles: string[] = [];

          // Get realm roles
          if (payload.realm_access?.roles) {
            roles.push(...payload.realm_access.roles);
          }

          // Get client-specific roles
          if (payload.resource_access) {
            Object.entries(payload.resource_access).forEach(([clientId, resource]) => {
              if (resource.roles) {
                roles.push(...resource.roles);
              }
            });
          }

          // Store roles in JWT token
          token.roles = roles;
          token.preferred_username = payload.preferred_username;
          token.given_name = payload.given_name;
          token.family_name = payload.family_name;
          token.sub = payload.sub;
          token.email = payload.email;
          token.name = payload.name;

          console.log('JWT callback - extracted roles:', roles);

        } catch (error) {
          console.error('Error decoding JWT in jwt callback:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;

      // Get roles from token (already extracted in jwt callback)
      session.user.roles = token.roles as string[] || [];
      session.user.preferred_username = token.preferred_username as string;
      session.user.given_name = token.given_name as string;
      session.user.family_name = token.family_name as string;
      session.user.id = token.sub as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;

      console.log('Session callback - user roles:', session.user.roles);

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Check if we're signing in
      if (url.startsWith(baseUrl + '/api/auth/callback')) {
        // We need to check the session to get user roles
        // Since we can't access session here directly, we'll handle this in the signIn callback
        return baseUrl;
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
  },
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };