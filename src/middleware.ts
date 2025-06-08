import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { debugToken } from "@/utils/debugAuth";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    console.log(`📍 Middleware processing: ${pathname}`);
    debugToken(token, `Middleware for ${pathname}`);
    
    // Check if user is admin
    const roles = (token?.roles as string[]) || [];
    const isAdmin = !!(token && (
      roles.includes('admin') || 
      roles.includes('administrator') ||
      roles.includes('realm-admin') ||
      roles.includes('manage-users')
    ));
    
    console.log('Middleware role check:', { 
      pathname, 
      roles, 
      isAdmin,
      tokenExists: !!token
    });
    
    // For admin routes, verify admin access
    if (pathname.startsWith('/admin')) {
      if (!token) {
        console.log('❌ Admin route: No token, redirecting to login');
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
      }
      
      if (!isAdmin) {
        console.log('❌ Admin route: User not admin, redirecting to home');
        console.log('❌ Admin route: User roles:', roles);
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      console.log('✅ Admin route: Access granted');
      return NextResponse.next();
    }
    
    // For user-only protected routes, block admin users
    if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
      if (!token) {
        console.log('❌ Protected route: No token, redirecting to login');
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
      }
      
      if (isAdmin) {
        console.log('🚫 Protected route: Admin user blocked from user-only route');
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      
      console.log('✅ Protected route: Regular user access granted');
      return NextResponse.next();
    }
    
    // Block admin users from accessing main pages and login (since they're already authenticated)
    if (isAdmin && (pathname === '/' || pathname.startsWith('/categories') || pathname.startsWith('/search') || pathname === '/login' || pathname === '/register')) {
      console.log('🚫 Main page: Admin user blocked from main/user pages and auth pages');
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    
    // For all other routes, just continue
    console.log('✅ Public route: Access granted');
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => {
        // Always return true to let our middleware function handle the logic
        // This prevents NextAuth from doing its own redirects
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*', 
    '/orders/:path*',
    '/',
    '/categories/:path*',
    '/search/:path*'
  ]
};