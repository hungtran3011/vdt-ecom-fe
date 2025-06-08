import { parseJWTPayload, parseJWTHeader } from './jwtParser';

interface JWTValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    hasValidStructure: boolean;
    headerValid: boolean;
    payloadValid: boolean;
    signaturePresent: boolean;
    header?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    issuer?: string;
    expiry?: Date;
    isExpired?: boolean;
  };
}

/**
 * Validates JWT token structure and content
 */
export function validateJWTStructure(token: string): JWTValidationResult {
  const result: JWTValidationResult = {
    isValid: false,
    details: {
      hasValidStructure: false,
      headerValid: false,
      payloadValid: false,
      signaturePresent: false,
    }
  };

  if (!token || typeof token !== 'string') {
    result.error = 'Token is null, undefined, or not a string';
    return result;
  }

  // Check basic JWT structure (should have 3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    result.error = `Invalid JWT structure: expected 3 parts, got ${parts.length}`;
    return result;
  }

  result.details!.hasValidStructure = true;
  result.details!.signaturePresent = parts[2].length > 0;

  // Validate header
  const header = parseJWTHeader(token);
  if (header) {
    result.details!.header = header;
    result.details!.headerValid = true;
    console.log('🔍 JWT Header:', header);
  } else {
    result.error = 'Invalid JWT header: failed to parse';
    return result;
  }

  // Validate payload
  const payload = parseJWTPayload(token);
  if (payload) {
    result.details!.payload = payload;
    result.details!.payloadValid = true;
    result.details!.issuer = payload.iss as string;
    
    if (payload.exp) {
      result.details!.expiry = new Date((payload.exp as number) * 1000);
      result.details!.isExpired = Date.now() > ((payload.exp as number) * 1000);
    }
    
    console.log('🔍 JWT Payload:', {
      issuer: payload.iss,
      subject: payload.sub,
      audience: payload.aud,
      expiry: result.details!.expiry?.toISOString(),
      isExpired: result.details!.isExpired,
      clientId: payload.azp || payload.client_id,
    });
  } else {
    result.error = 'Invalid JWT payload: failed to parse';
    return result;
  }

  // If we get here, the token structure is valid
  result.isValid = true;
  return result;
}

/**
 * Diagnoses common JWT issues
 */
export function diagnoseJWTIssues(token: string): string[] {
  const issues: string[] = [];
  const validation = validateJWTStructure(token);
  
  if (!validation.isValid) {
    issues.push(`❌ Structural Issue: ${validation.error}`);
    return issues;
  }

  const { details } = validation;
  
  // Check for missing signature
  if (!details?.signaturePresent) {
    issues.push('⚠️ Missing or empty signature - token may not be properly signed');
  }

  // Check for missing issuer
  if (!details?.issuer) {
    issues.push('❌ Missing issuer (iss) claim - required for validation');
  }

  // Check for token expiry
  if (details?.isExpired) {
    issues.push(`❌ Token is expired (expired at: ${details.expiry?.toISOString()})`);
  }

  // Check issuer format
  if (details?.issuer && !details.issuer.startsWith('http')) {
    issues.push('⚠️ Issuer claim does not appear to be a valid URL');
  }

  // Check for required claims
  const payload = details?.payload as Record<string, unknown>;
  const requiredClaims = ['sub', 'iat', 'exp', 'iss'];
  
  for (const claim of requiredClaims) {
    if (!payload?.[claim]) {
      issues.push(`⚠️ Missing required claim: ${claim}`);
    }
  }

  if (issues.length === 0) {
    issues.push('✅ No obvious structural issues found');
  }

  return issues;
}

/**
 * Safely extracts and logs token information for debugging
 */
export function debugTokenSafely(token: string, tokenName = 'Token'): void {
  console.group(`🔍 ${tokenName} Debug Information`);
  
  try {
    const validation = validateJWTStructure(token);
    const issues = diagnoseJWTIssues(token);
    
    console.log('📋 Validation Result:', validation.isValid ? '✅ Valid Structure' : '❌ Invalid Structure');
    
    if (validation.error) {
      console.error('🚨 Validation Error:', validation.error);
    }
    
    console.log('🔍 Diagnostic Issues:');
    issues.forEach(issue => console.log(`  ${issue}`));
    
    if (validation.details?.payload) {
      const payload = validation.details.payload as Record<string, unknown>;
      console.log('📄 Key Claims:', {
        issuer: payload.iss,
        subject: payload.sub,
        audience: payload.aud,
        expiry: payload.exp ? new Date(payload.exp as number * 1000).toISOString() : 'N/A',
        issuedAt: payload.iat ? new Date(payload.iat as number * 1000).toISOString() : 'N/A',
        clientId: payload.azp || payload.client_id || 'N/A',
      });
    }
    
  } catch (error) {
    console.error('🚨 Critical error during token debugging:', error);
  }
  
  console.groupEnd();
}
