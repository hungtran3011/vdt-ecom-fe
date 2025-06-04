export function hasRole(session: any, role: string): boolean {
  console.log('hasRole - checking for role:', role);
  console.log('hasRole - user roles:', session?.user?.roles);
  return session?.user?.roles?.includes(role) || false;
}

export function isAdmin(session: any): boolean {
  console.log('isAdmin - checking admin status');
  console.log('isAdmin - user roles:', session?.user?.roles);
  
  // Based on your JWT payload, check for the actual admin role
  // You might need to adjust these role names based on what Keycloak sends
  const isAdminUser = hasRole(session, 'admin') || 
                     hasRole(session, 'administrator') ||
                     hasRole(session, 'realm-admin') ||
                     hasRole(session, 'manage-users');
  
  console.log('isAdmin - result:', isAdminUser);
  return isAdminUser;
}

export function isCustomer(session: any): boolean {
  return hasRole(session, 'customer');
}

export function getUserRoles(session: any): string[] {
  return session?.user?.roles || [];
}