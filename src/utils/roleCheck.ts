import { Session } from 'next-auth';
import { debugSession } from './debugAuth';

export function hasRole(session: Session | null, role: string): boolean {
  if (!session?.user?.roles) {
    console.log('hasRole - no session or roles found for role:', role);
    return false;
  }
  
  console.log(`hasRole - checking for role: "${role}"`);
  console.log('hasRole - user roles:', session.user.roles);
  
  const hasRoleResult = session.user.roles.includes(role);
  console.log(`hasRole - result for "${role}":`, hasRoleResult);
  
  return hasRoleResult;
}

export function isAdmin(session: Session | null): boolean {
  debugSession(session, 'isAdmin check');
  
  if (!session?.user?.roles) {
    console.log('❌ isAdmin - no roles found, returning false');
    return false;
  }
  
  // Based on your JWT payload, check for the actual admin role
  // You might need to adjust these role names based on what Keycloak sends
  const adminRoles = ['admin', 'administrator', 'realm-admin', 'manage-users'];
  const userRoles = session.user.roles;
  
  const isAdminUser = adminRoles.some(adminRole => userRoles.includes(adminRole));
  
  console.log('isAdmin - checking against roles:', adminRoles);
  console.log('isAdmin - user has roles:', userRoles);
  console.log(isAdminUser ? '✅ isAdmin - result: true' : '❌ isAdmin - result: false');
  
  return isAdminUser;
}

export function isCustomer(session: Session | null): boolean {
  return hasRole(session, 'customer');
}

export function getUserRoles(session: Session | null): string[] {
  const roles = session?.user?.roles || [];
  console.log('getUserRoles - returning:', roles);
  return roles;
}