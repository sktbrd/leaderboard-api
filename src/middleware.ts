// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateToken } from './app/api/v1/auth';

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/api/v1/leaderboard',
  '/api/v1/feed',
  '/api/v1/market',
  '/api/v1',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the endpoint is public (allow exact match or path prefix)
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(
    (endpoint) => pathname === endpoint || pathname.startsWith(endpoint + '/')
  );

  if (pathname.startsWith('/api/v1/') && !isPublicEndpoint) {
    const isAuthenticated = await authenticateToken(request);
    if (!isAuthenticated) {
      console.log('❌ Unauthorized access for:', pathname);
      return new NextResponse(null, { status: 401, statusText: 'Unauthorized' });
    }
  }
  console.log('✅ Authorized access for:', pathname);
  return NextResponse.next();
}


export const config = {
  matcher: ['/api/v1/:path*', '/app/api/v1/:path*'],
};
