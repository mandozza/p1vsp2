import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isBetaPage = pathname === '/beta';
    const hasBetaAccess = req.cookies.has('pro-project_beta_access');

    // 1. Beta Gate Logic
    if (!hasBetaAccess && !isBetaPage) {
      // Allow API routes and static files to bypass
      if (pathname.startsWith('/api/') || pathname.includes('.')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/beta', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // withAuth handles the /machines and /profile protection automatically
      // based on the presence of a token
      authorized: ({ token }) => true, 
    },
  }
);

export const config = {
  // Catch all pages except login, api, and assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
