// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateToken } from './app/api/v1/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/v1/')) {
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
