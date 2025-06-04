export type Profile = {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string;
    birthday: Date;
}

export type User = {
    id: string;
    email: string;
    name?: string;
    image?: string;
    
    // Keycloak specific fields
    sub?: string; // Subject identifier from Keycloak
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    
    // Authentication tokens
    accessToken?: string;
    refreshToken?: string;
    
    // User roles and permissions
    roles?: string[];
    groups?: string[];
    
    // Profile information
    profile?: Profile;
    
    // Account status
    emailVerified?: boolean;
    isActive?: boolean;
    
    // Timestamps
    createdAt?: Date;
    lastLoginAt?: Date;
    
    // Additional Keycloak attributes
    realm_access?: {
        roles: string[];
    };
    resource_access?: {
        [clientId: string]: {
            roles: string[];
        };
    };
}

// For NextAuth session typing
export type SessionUser = {
    id: string;
    email: string;
    name?: string;
    image?: string;
    accessToken?: string;
    roles?: string[];
}

// For authentication responses
export type AuthUser = User & {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

// For user registration
export type UserRegistration = {
    email: string;
    password: string;
    fullName: string;
    confirmPassword: string;
}

// For user update operations
export type UserUpdate = Partial<Pick<User, 'name' | 'image' | 'profile'>> & {
    id: string;
}