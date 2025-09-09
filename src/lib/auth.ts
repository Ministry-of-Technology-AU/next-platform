import { auth } from '../auth'
import { NextResponse } from 'next/server'

export interface AuthenticatedUser {
  email: string
  role: string
  access: string[]
}

/**
 * Get authenticated user from request
 * Returns null if user is not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return null
    }
    
    return {
      email: session.user.email,
      role: session.user.role || 'user',
      access: session.user.access || ['platform']
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Check if user has required access level
 */
export function hasAccess(user: AuthenticatedUser, requiredAccess: string[]): boolean {
  return requiredAccess.some(access => user.access.includes(access))
}

/**
 * Middleware function to protect API routes
 */
export async function requireAuth(
  requiredAccess: string[] = ['platform']
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  if (!hasAccess(user, requiredAccess)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return { user }
}

/**
 * Check if user is organization member
 */
export function isOrganizationMember(user: AuthenticatedUser): boolean {
  return user.access.includes('organization')
}

/**
 * Check if user is student (has _ug in email)
 */
export function isStudent(user: AuthenticatedUser): boolean {
  return user.email.includes('_ug')
}
