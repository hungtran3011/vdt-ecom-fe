import { Session } from 'next-auth';

export function debugSession(session: Session | null, context: string = '') {
  console.log(`=== SESSION DEBUG ${context} ===`);
  console.log('Session exists:', !!session);
  
  if (session) {
    console.log('Session data:', {
      user: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        given_name: session.user?.given_name,
        preferred_username: session.user?.preferred_username,
        roles: session.user?.roles,
      },
      accessToken: session.accessToken ? 'Present' : 'Missing',
      idToken: session.idToken ? 'Present' : 'Missing',
    });
    
    // Detailed role analysis
    if (session.user?.roles) {
      console.log('Role analysis:');
      session.user.roles.forEach((role, index) => {
        console.log(`  [${index}] "${role}"`);
      });
    } else {
      console.log('No roles found in session');
    }
  }
  
  console.log('=== END SESSION DEBUG ===');
}

export function debugToken(token: unknown, context: string = '') {
  console.log(`=== TOKEN DEBUG ${context} ===`);
  console.log('Token exists:', !!token);
  
  if (token && typeof token === 'object') {
    const tokenObj = token as Record<string, unknown>;
    console.log('Token data:', {
      sub: tokenObj.sub,
      email: tokenObj.email,
      name: tokenObj.name,
      given_name: tokenObj.given_name,
      preferred_username: tokenObj.preferred_username,
      roles: tokenObj.roles,
      accessToken: tokenObj.accessToken ? 'Present' : 'Missing',
      idToken: tokenObj.idToken ? 'Present' : 'Missing',
    });
    
    // Detailed role analysis
    if (Array.isArray(tokenObj.roles)) {
      console.log('Token role analysis:');
      tokenObj.roles.forEach((role: unknown, index: number) => {
        console.log(`  [${index}] "${role}"`);
      });
    } else {
      console.log('No roles found in token');
    }
  }
  
  console.log('=== END TOKEN DEBUG ===');
}
