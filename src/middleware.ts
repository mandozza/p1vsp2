import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isBetaPage = pathname === '/beta';
    const isPublicPage = pathname === '/' || isBetaPage;
    const hasBetaAccess = req.cookies.has('pro-project_beta_access');
    const token = req.nextauth.token;

    // 1. Beta Gate Logic (Strict)
    if (!hasBetaAccess && !isBetaPage) {
      if (pathname.startsWith('/api/') || pathname.includes('.')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/beta', req.url));
    }

    // 2. Admin Role Enforcement
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 3. Auth Enforcement for non-public pages
    if (!token && !isPublicPage) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle logic in the middleware function above
    },
  }
);

export const config = {
  // Catch all pages except login, api, and assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
