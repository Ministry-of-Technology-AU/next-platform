import { NextResponse } from 'next/server'
import { auth } from './auth'

// Define protected routes and their access requirements
const ROUTE_ACCESS = {
  '/platform': ['platform'],
  '/sg-compose': ['platform'],
  '/organization': ['organization'],
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  if (pathname.endsWith('jpg') || pathname.endsWith('png') || pathname.endsWith('svg') || pathname.endsWith('ico')) {
    return NextResponse.next()
  }

  // Allow root path and login page - let them through
  if (pathname === '/' || pathname === '/login') {
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
  
  // console.log('User:', req.auth.user)

  // Check route access permissions
  const userAccess = req.auth.user?.access || []
  // Check if user has access to the requested route
  for (const [routePath, requiredAccess] of Object.entries(ROUTE_ACCESS)) {
    if (pathname.startsWith(routePath)) {
      const hasAccess = requiredAccess.some(access => userAccess.includes(access))
      
      if (!hasAccess) {
        // Redirect to appropriate page based on user's access
        if (userAccess.includes('platform')) {
          return NextResponse.redirect(new URL('/platform', req.url))
        } else {
          return NextResponse.redirect(new URL('/api/auth/signin/google', req.url))
        }
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
