import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicPaths = ['/', '/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl

  // Handle domain redirection
  if (host === 'www.volleyballthreads.com') {
    const newUrl = new URL(request.url)
    newUrl.host = 'volleyballthreads.com'
    return NextResponse.redirect(newUrl)
  }

  // Allow public routes
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for authentication
  const token = request.cookies.get('session')
  if (!token) {
    // Store the original path to redirect back after login
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 