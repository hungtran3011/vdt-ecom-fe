import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { parseJWTPayload } from '@/utils/jwtParser';
import { KeycloakJWTPayload } from '@/types/KeycloakJWTPayload';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies (what the client sees)
    const sessionData = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!sessionData?.accessToken) {
      return NextResponse.json({
        error: 'No access token in session',
        sessionExists: !!sessionData,
        sessionKeys: sessionData ? Object.keys(sessionData) : []
      }, { status: 401 });
    }

    const accessToken = sessionData.accessToken as string;
    
    // Parse the token to verify it's a valid JWT
    const payload = parseJWTPayload<KeycloakJWTPayload>(accessToken);
    
    const debugInfo = {
      tokenPresent: !!accessToken,
      tokenLength: accessToken.length,
      tokenStart: accessToken.substring(0, 50) + '...',
      tokenEnd: '...' + accessToken.substring(accessToken.length - 50),
      fullToken: accessToken, // Include full token for debugging
      isValidJWT: !!payload,
      payload: payload ? {
        issuer: payload.iss,
        subject: payload.sub,
        email: payload.email,
        clientId: payload.azp,
        expiry: new Date(payload.exp * 1000).toISOString(),
        isExpired: payload.exp < Math.floor(Date.now() / 1000),
        roles: payload.realm_access?.roles || []
      } : null,
      sessionInfo: {
        hasRefreshToken: !!sessionData.refreshToken,
        hasIdToken: !!sessionData.idToken,
        expiresAt: sessionData.expiresAt ? new Date(sessionData.expiresAt * 1000).toISOString() : null
      }
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('❌ Error in token debug endpoint:', error);
    return NextResponse.json({
      error: 'Failed to debug token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
