
/**
 * Validates and normalizes environment configuration for Keycloak
 */
export function validateKeycloakConfig() {
  const config = {
    issuer: process.env.KEYCLOAK_ISSUER?.replace(/\/$/, ''), // Remove trailing slash
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  };

  const missing = [];
  if (!config.issuer) missing.push('KEYCLOAK_ISSUER');
  if (!config.clientId) missing.push('KEYCLOAK_CLIENT_ID');
  if (!config.clientSecret) missing.push('KEYCLOAK_CLIENT_SECRET');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Keycloak configuration validated:', {
    issuer: config.issuer,
    clientId: config.clientId,
    apiBaseUrl: config.apiBaseUrl,
  });

  return config;
}

/**
 * Check if the issuer URLs match between frontend and backend expectations
 */
export function checkIssuerCompatibility(tokenIssuer: string) {
  const expectedIssuer = process.env.KEYCLOAK_ISSUER?.replace(/\/$/, '');
  const normalizedTokenIssuer = tokenIssuer?.replace(/\/$/, '');

  const isMatch = normalizedTokenIssuer === expectedIssuer;
  
  if (!isMatch) {
    console.warn('⚠️ Issuer mismatch detected:', {
      tokenIssuer: normalizedTokenIssuer,
      expectedIssuer,
      recommendation: 'Ensure KEYCLOAK_ISSUER matches the issuer in your JWT tokens'
    });
  }

  return isMatch;
}
