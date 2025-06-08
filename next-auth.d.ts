import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string; // Add ID token
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      preferred_username?: string;
      given_name?: string;
      family_name?: string;
      roles?: string[];
      groups?: string[];
    };
  }

  interface Profile {
    sub: string;
    email: string;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    realm_access?: {
      roles: string[];
    };
    groups?: string[];
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    roles?: string[];
    groups?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string; // Add ID token
    expiresAt?: number;
    roles?: string[]; // Add roles directly to JWT
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    sub?: string;
    email?: string;
    name?: string;
    user?: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      preferred_username?: string;
      given_name?: string;
      family_name?: string;
      roles?: string[];
      groups?: string[];
    };
  }
}