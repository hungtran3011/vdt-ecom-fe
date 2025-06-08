import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { refreshAccessToken } from '@/utils/tokenRefresh';
import { KeycloakJWTPayload } from '@/types/KeycloakJWTPayload';
import { parseJWTPayload } from '@/utils/jwtParser';
import { debugTokenPayload, validateIssuerClaim } from '@/utils/tokenDebug';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Token refresh endpoint called');

    // Get the current JWT token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token?.refreshToken) {
      console.log('❌ No refresh token available');
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    // Attempt to refresh the token
    const refreshedTokens = await refreshAccessToken(token.refreshToken);

    if (!refreshedTokens) {
      console.log('❌ Failed to refresh token');
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 }
      );
    }

    // Debug the refreshed token in development
    if (process.env.NODE_ENV === 'development') {
      debugTokenPayload(refreshedTokens.access_token);
      validateIssuerClaim(refreshedTokens.access_token);
    }

    // Parse the new access token to extract user info
    const roles: string[] = [];
    let userInfo: Partial<KeycloakJWTPayload> = {};

    try {
      const payload = parseJWTPayload<KeycloakJWTPayload>(refreshedTokens.access_token);
      
      if (!payload) {
        console.error('❌ Failed to parse refreshed access token');
        return NextResponse.json(
          { error: 'Invalid token received from refresh' },
          { status: 500 }
        );
      }

      // Extract roles
      if (payload.realm_access?.roles) {
        roles.push(...payload.realm_access.roles);
      }

      if (payload.resource_access) {
        Object.entries(payload.resource_access).forEach(([, resource]) => {
          if (resource.roles) {
            roles.push(...resource.roles);
          }
        });
      }

      userInfo = {
        sub: payload.sub,
        email: payload.email,
        preferred_username: payload.preferred_username,
        given_name: payload.given_name,
        family_name: payload.family_name,
      };

    } catch (error) {
      console.error('❌ Error parsing refreshed access token:', error);
      return NextResponse.json(
        { error: 'Failed to parse refreshed token' },
        { status: 500 }
      );
    }

    // Return the refreshed session data
    const refreshedSession = {
      accessToken: refreshedTokens.access_token,
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.given_name && userInfo.family_name 
          ? `${userInfo.given_name} ${userInfo.family_name}` 
          : userInfo.preferred_username,
        preferred_username: userInfo.preferred_username,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        roles,
      },
      expires: new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString(),
    };

    console.log('✅ Token refreshed successfully');
    
    return NextResponse.json(refreshedSession);

  } catch (error) {
    console.error('❌ Error in token refresh endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
