import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// Public routes that don't require authentication
const publicRoutes = ['/', '/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    // If user is on login page and already has token, redirect to dashboard
    if (pathname === '/' || pathname === '/login') {
      const token = request.cookies.get('auth_token')?.value;
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET);
          // Token is valid, redirect to dashboard
          if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        } catch {
          // Token invalid, allow access to login
        }
      }
    }
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify token
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api/auth|api/health|_next/static|_next/image|favicon.ico).*)'],
};