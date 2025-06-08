import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { parseJWTPayload } from '@/utils/jwtParser';
import { KeycloakJWTPayload } from '@/types/KeycloakJWTPayload';

export async function GET(request: NextRequest) {
  try {
    // Get the current JWT token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token?.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }

    // Parse the access token using consistent JWT parser
    const payload = parseJWTPayload<KeycloakJWTPayload>(token.accessToken as string);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Failed to parse access token' },
        { status: 500 }
      );
    }

    const debugInfo = {
      environment: {
        KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
        KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
      tokenInfo: {
        issuer: payload.iss,
        audience: payload.aud,
        subject: payload.sub,
        clientId: payload.azp,
        expiry: new Date(payload.exp * 1000).toISOString(),
        issuedAt: new Date(payload.iat * 1000).toISOString(),
        realm: payload.realm_access?.roles || [],
        resourceAccess: Object.keys(payload.resource_access || {}),
      },
      validation: {
        issuerMatches: payload.iss === process.env.KEYCLOAK_ISSUER,
        isExpired: payload.exp < Math.floor(Date.now() / 1000),
        timeUntilExpiry: Math.floor((payload.exp - Date.now() / 1000) / 60) + ' minutes',
      },
      recommendations: [] as string[]
    };

    // Add recommendations based on validation
    if (!debugInfo.validation.issuerMatches) {
      debugInfo.recommendations.push(
        `Issuer mismatch: Token has '${payload.iss}' but environment expects '${process.env.KEYCLOAK_ISSUER}'. ` +
        'Ensure your backend API accepts the token issuer or update KEYCLOAK_ISSUER to match.'
      );
    }

    if (debugInfo.validation.isExpired) {
      debugInfo.recommendations.push('Token is expired. Try refreshing the page to get a new token.');
    }

    return NextResponse.json(debugInfo, { status: 200 });

  } catch (error) {
    console.error('❌ Error in issuer debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
