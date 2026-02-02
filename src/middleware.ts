import { NextResponse } from 'next/server'
import { auth } from './auth'

// Define protected routes and their access requirements
const ROUTE_ACCESS = {
  '/platform': ['platform'],
  '/platform/rep-dashboard': ['rep_dashboard'],
  '/sg-compose': ['platform'],
  '/organization': ['organization'],
}

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/backend')) {
    return NextResponse.next()
  }

  if (pathname.endsWith('jpg') || pathname.endsWith('png') || pathname.endsWith('svg') || pathname.endsWith('ico')) {
    return NextResponse.next()
  }

  // Allow root path and login page - let them through
  if (pathname === '/' || pathname === '/login' || pathname === '/unauthorized') {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/')) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!req.auth?.user) {
    console.log('❌ User not authenticated, redirecting to signin from:', pathname)

    // Create a login page URL with return URL as parameter
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Note: User creation in Strapi is now handled in the signIn callback (src/auth.ts)
  // This runs once at login instead of on every request, improving performance

  // Special access control for HOR dashboard
  if (pathname === '/platform/sg-compose/dashboard') {
    const horMembers = (process.env.HOR_MEMBERS || '').split(',').map(email => email.trim())

    if (!horMembers.includes(req.auth.user.email)) {
      console.log(`❌ User ${req.auth.user.email} denied access to HOR dashboard`)
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    console.log(`✅ User ${req.auth.user.email} granted access to HOR dashboard`)
    return NextResponse.next()
  }

  // Special access control for Rep Dashboard
  if (pathname === '/platform/rep-dashboard') {
    const userAccess = req.auth.user?.access || []

    if (!userAccess.includes('rep_dashboard')) {
      console.log(`❌ User ${req.auth.user.email} denied access to Rep Dashboard`)
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    console.log(`✅ User ${req.auth.user.email} granted access to Rep Dashboard`)
    return NextResponse.next()
  }

  // Check route access permissions
  const userAccess = req.auth.user?.access || []
  // Check if user has access to the requested route
  for (const [routePath, requiredAccess] of Object.entries(ROUTE_ACCESS)) {
    if (pathname.startsWith(routePath)) {
      const hasAccess = requiredAccess.some(access => userAccess.includes(access))
      const authorizedEmails = (process.env.AUTHORIZED_EMAILS || '').split(',')

      if (!hasAccess && !authorizedEmails.includes(req.auth.user.email)) {
        // Authenticated but unauthorized for this route -> show unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      break
    }
  }

  return NextResponse.next()
})

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/sg-compose/:path*',
    '/platform/:path*',
    '/organization/:path*',
    '/api/sg-compose/:path*',
    '/api/drive/:path*',
    '/api/mail/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|$).*)'
  ],
}
