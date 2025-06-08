
/**
 * Safely parses JWT token payload using consistent decoding
 */
export function parseJWTPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid JWT structure: expected 3 parts, got ${parts.length}`);
    }

    // Use consistent base64 decoding - prefer atob for browser compatibility
    // but fallback to Buffer for server-side
    let decodedPayload: string;
    
    if (typeof window !== 'undefined') {
      // Browser environment - use atob
      decodedPayload = atob(parts[1]);
    } else {
      // Server environment - use Buffer
      decodedPayload = Buffer.from(parts[1], 'base64').toString('utf-8');
    }

    return JSON.parse(decodedPayload) as T;
  } catch (error) {
    console.error('❌ Error parsing JWT payload:', error);
    return null;
  }
}

/**
 * Safely parses JWT header using consistent decoding
 */
export function parseJWTHeader(token: string): Record<string, unknown> | null {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid JWT structure: expected 3 parts, got ${parts.length}`);
    }

    // Use consistent base64 decoding
    let decodedHeader: string;
    
    if (typeof window !== 'undefined') {
      // Browser environment - use atob
      decodedHeader = atob(parts[0]);
    } else {
      // Server environment - use Buffer
      decodedHeader = Buffer.from(parts[0], 'base64').toString('utf-8');
    }

    return JSON.parse(decodedHeader);
  } catch (error) {
    console.error('❌ Error parsing JWT header:', error);
    return null;
  }
}

/**
 * Extracts expiration time from JWT token
 */
export function getJWTExpiration(token: string): Date | null {
  const payload = parseJWTPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return null;
  }
  return new Date(payload.exp * 1000);
}

/**
 * Checks if JWT token is expired (with optional buffer time in seconds)
 */
export function isJWTExpired(token: string, bufferSeconds = 0): boolean {
  const expiration = getJWTExpiration(token);
  if (!expiration) {
    return true; // Consider invalid tokens as expired
  }
  
  const now = new Date();
  const expirationWithBuffer = new Date(expiration.getTime() - (bufferSeconds * 1000));
  
  return now >= expirationWithBuffer;
}
