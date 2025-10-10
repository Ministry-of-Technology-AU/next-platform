import { NextResponse } from 'next/server'
import { auth } from './auth'
import { strapiGet, strapiPost } from './lib/apis/strapi'

// Define protected routes and their access requirements
const ROUTE_ACCESS = {
  '/platform': ['platform'],
  '/sg-compose': ['platform'],
  '/organization': ['organization'],
}

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api/auth')) {
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

  // Check if user exists in Strapi and create if not TODO: Move this logic to create-user endpoint
  try {
    const userEmail = req.auth.user.email
    const userName = req.auth.user.name || ''

    if (userEmail) {
      // Check if a user with the same email exists
      const emailResponse = await strapiGet('/users', {
        filters: {
          email: {
            $eq: userEmail
          }
        }
      })

      if (!emailResponse || emailResponse.length === 0) {
        // User doesn't exist, need to create them
        let finalUsername = userName
        const batch = (userEmail.match(/_([^@]+)@/) || [])[1]?.toUpperCase() || "";
        // Check if username already exists
        if (userName) {
          const usernameResponse = await strapiGet('/users', {
            filters: {
              username: {
                $eq: userName
              }
            }
          })

          // If username exists, append random number
          if (usernameResponse && usernameResponse.length > 0) {
            finalUsername = `${userName} ${Math.floor(Math.random() * 100) + 1}`
          }
        }

        // Create new user in Strapi
        const userData = {
          email: userEmail,
          username: finalUsername,
          profile_url: req.auth.user.image || '',
          password: Math.random().toString(36).slice(-8), // Random password
          role: 1,
          confirmed: true,
          blocked: false,
          batch: batch
        }

        console.log('Creating new user in Strapi:', userEmail)
        console.log('User data:', userData)
        await strapiPost('/users', userData)
      }
    }
  } catch (error) {
    console.error('Error checking/creating user in Strapi:', error)
    // Continue with the request even if user creation fails
  }

  // console.log('User:', req.auth.user)

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
