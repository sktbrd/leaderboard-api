// auth.ts
import type { NextRequest } from 'next/server';

const TOKEN_SECRET = process.env.TOKEN_SECRET;

export async function authenticateToken(request: NextRequest): Promise<boolean> {
  // Allow localhost in development mode
  if (process.env.NODE_ENV === 'development') {
    const host = request.headers.get('x-forwarded-host') || request.nextUrl.host;
    if (host === 'localhost:3000' || host.startsWith('localhost:')) {
      return true;
    }
  }

  // Require TOKEN_SECRET to be configured in production
  if (!TOKEN_SECRET) {
    console.error('TOKEN_SECRET environment variable is not set');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  // Expect: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return false;
  }

  const token = parts[1];
  if (!token) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (token.length !== TOKEN_SECRET.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ TOKEN_SECRET.charCodeAt(i);
  }

  return result === 0;
}
