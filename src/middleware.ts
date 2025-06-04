import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    console.log('Middleware - pathname:', pathname);
    console.log('Middleware - token roles:', token?.roles);

    // Handle post-login redirect for admin users
    if (pathname === '/' && token?.roles) {
      const roles = token.roles as string[];
      const isAdmin = roles.includes('admin') || roles.includes('administrator');
      console.log('User roles:', roles);
      console.log('Is admin:', isAdmin);
      
      if (isAdmin) {
        console.log('Redirecting admin to /admin');
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    // Check if user is trying to access admin routes
    if (pathname.startsWith('/admin')) {
      const roles = (token?.roles as string[]) || [];
      const isAdmin = roles.includes('admin') || roles.includes('administrator');
      
      if (!isAdmin) {
        console.log('Non-admin trying to access admin routes, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Admin routes require authentication
        if (pathname.startsWith('/admin')) {
          return !!token;
        }
        
        // Other protected routes
        if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/', '/admin/:path*', '/profile/:path*', '/orders/:path*']
};