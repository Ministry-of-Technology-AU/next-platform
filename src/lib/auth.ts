import { auth } from '../auth'
import { NextResponse } from 'next/server'
import { STUDENT_EMAIL, YSP_EMAIL, type PlatformRole } from './authz/roles'
import type { OrgMembership, OrgTier, Sport } from './authz/types'

export interface AuthenticatedUser {
  email: string
  /** Strapi user id — use this instead of `getUserIdByEmail`. Null if the user has no Strapi record. */
  uid: number | null
  role: PlatformRole
  access: string[]
  batch: string | null
  sports: Sport[]
  orgs: OrgMembership[]
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
      uid: session.user.uid ?? null,
      role: session.user.role ?? 'user',
      access: session.user.access ?? ['none'],
      batch: session.user.batch ?? null,
      sports: session.user.sports ?? [],
      orgs: session.user.orgs ?? [],
    }
  } catch (error) {
    platform.error('Error getting authenticated user:', error)
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
 * The user's tier in an organisation (0 = org account, 1 = circle 1,
 * 2 = circle 2), or null if they are not in it.
 */
export function orgTier(user: Pick<AuthenticatedUser, 'orgs'>, orgId: number): OrgTier | null {
  return user.orgs.find(([id]) => id === orgId)?.[1] ?? null
}

/**
 * True when the user holds at least `maxTier` in the organisation — lower is
 * more senior, so `hasOrgTier(user, id, 1)` means org account or circle 1.
 */
export function hasOrgTier(user: Pick<AuthenticatedUser, 'orgs'>, orgId: number, maxTier: OrgTier): boolean {
  const tier = orgTier(user, orgId)
  return tier !== null && tier <= maxTier
}

/** Programme part of a batch: `UG2023` → `UG`, `YIF2024` → `YIF`. */
export function programmeOf(batch: string | null): string | null {
  const match = batch?.match(/^[A-Z]+/)
  return match ? match[0] : null
}

/**
 * True when the user's batch is in one of the given programmes — for tools
 * restricted by batch rather than role, e.g. `hasProgramme(user, ['UG'])`.
 */
export function hasProgramme(user: Pick<AuthenticatedUser, 'batch'>, programmes: readonly string[]): boolean {
  const programme = programmeOf(user.batch)
  return programme !== null && programmes.map((p) => p.toUpperCase()).includes(programme)
}

/** True when the user is a point of contact for the league. */
export function isSportPoc(user: Pick<AuthenticatedUser, 'sports'>, sport: Sport): boolean {
  return user.sports.includes(sport)
}

/**
 * Check if user is organization member
 */
export function isOrganizationMember(user: AuthenticatedUser): boolean {
  return user.access.includes('organization')
}

/**
 * Check if user is student (role is student, or the email follows the
 * `name_<programme>@` convention). YSP participants are not students.
 */
export function isStudent(user: AuthenticatedUser): boolean {
  if (user.role === 'student') return true;
  const email = (user.email || '').toLowerCase();
  return STUDENT_EMAIL.test(email) && !YSP_EMAIL.test(email);
}
