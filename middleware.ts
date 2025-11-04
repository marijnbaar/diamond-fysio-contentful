import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip ALL API routes completely - they should not be processed by middleware
  // Next.js Pages Router automatically handles /api routes, so we should never see them here
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle www redirect for other routes (if needed)
  const hostname = req.headers.get('host') || '';
  const url = req.nextUrl.clone();

  // Redirect non-www to www (but NOT for API routes)
  if (hostname === 'fysiodiamondfactory.nl' && !pathname.startsWith('/api/')) {
    url.hostname = 'www.fysiodiamondfactory.nl';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - these should NEVER be matched
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
