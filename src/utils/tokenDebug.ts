
/**
 * Debug utility to help diagnose token validation issues
 */
export function debugTokenPayload(token: string): void {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('🔍 Token Debug Information:', {
      issuer: payload.iss,
      audience: payload.aud,
      subject: payload.sub,
      expiry: new Date(payload.exp * 1000).toISOString(),
      issuedAt: new Date(payload.iat * 1000).toISOString(),
      clientId: payload.azp || payload.client_id,
      realmAccess: payload.realm_access,
      resourceAccess: Object.keys(payload.resource_access || {}),
    });
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    console.log('🕐 Token expiry status:', {
      isExpired,
      expiresIn: payload.exp - now,
      expiresInMinutes: Math.floor((payload.exp - now) / 60),
    });
    
  } catch (error) {
    console.error('❌ Error debugging token:', error);
  }
}

/**
 * Validate that the issuer claim matches expected configuration
 */
export function validateIssuerClaim(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const expectedIssuer = process.env.KEYCLOAK_ISSUER;
    
    console.log('🔍 Issuer validation:', {
      tokenIssuer: payload.iss,
      expectedIssuer,
      matches: payload.iss === expectedIssuer,
    });
    
    return payload.iss === expectedIssuer;
  } catch (error) {
    console.error('❌ Error validating issuer claim:', error);
    return false;
  }
}
