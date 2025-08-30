import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/security'

const intlMiddleware = createIntlMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect admin routes except login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions)

    if (!session.isLoggedIn || !session.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  let response: NextResponse

  // Skip intl middleware for admin and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    response = NextResponse.next()
  } else {
    // Apply intl middleware for other routes
    response = intlMiddleware(request)
  }

  // Add security headers to all responses
  return addSecurityHeaders(response)
}

export const config = {
  matcher: ['/', '/(pt|en)/:path*', '/admin/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}