// auth.ts
import type { NextRequest } from 'next/server';

const TOKEN_SECRET = process.env.TOKEN_SECRET;

export async function authenticateToken(request: NextRequest): Promise<boolean> {
  // Get the host from the headers
  const host = request.headers.get('x-forwarded-host') || request.nextUrl.host;
  
  // Check if the host is 'localhost:3000' and skip authentication
  if (host === 'localhost:3000') {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.split(' ')[1];
  if (!token) return false;
  
  return token === TOKEN_SECRET;
}
