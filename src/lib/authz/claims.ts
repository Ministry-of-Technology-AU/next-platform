/**
 * Turns an email into the claims stored in the session token: Strapi id,
 * batch, role, leagues and organisation memberships.
 *
 * Runs on sign-in and again once the claims are older than `CLAIMS_TTL_MS`,
 * so role changes and blocks take effect without a re-login.
 */

import { normalizeEmail } from './assigners'
import { fetchOrgMemberships, fetchStrapiUser } from './loaders'
import { DEFAULT_ROLE, ROLES, SPORT_POCS, isPlatformRole, type PlatformRole } from './roles'
import { SPORTS, type AssignContext, type OrgMembership, type Sport, type SportAssignContext } from './types'

/** Bump when the claim shape changes — older tokens re-resolve on their next request. */
export const CLAIMS_VERSION = 2
export const CLAIMS_TTL_MS = 10 * 60 * 1000
/** How soon to try again after Strapi could not be reached. */
const RETRY_MS = 60 * 1000

export interface AuthClaims {
  v: number
  /** Strapi user id. Null only when the user has no Strapi record. */
  uid: number | null
  batch: string | null
  role: PlatformRole
  sports: Sport[]
  orgs: OrgMembership[]
  /** When these claims were resolved (ms since epoch). */
  authzAt: number
}

export type ClaimsResult = { kind: 'ok'; claims: AuthClaims } | { kind: 'blocked' }

/** `name_ug2023@ashoka.edu.in` → `UG2023`. */
export function batchFromEmail(email: string): string | null {
  const match = email.match(/_([^@]+)@/)
  return match?.[1] ? match[1].toUpperCase() : null
}

async function passes<Ctx>(assign: (ctx: Ctx) => boolean | Promise<boolean>, ctx: Ctx, label: string) {
  try {
    return await assign(ctx)
  } catch (error) {
    // A broken assigner denies rather than taking the whole sign-in down.
    platform.error(`[authz] Assigner for "${label}" threw:`, error)
    return false
  }
}

async function resolveSports(ctx: SportAssignContext): Promise<Sport[]> {
  const sports: Sport[] = []
  for (const sport of SPORTS) {
    if (await passes(SPORT_POCS[sport].assign, ctx, sport)) sports.push(sport)
  }
  return sports
}

async function resolveRole(ctx: AssignContext): Promise<PlatformRole> {
  for (const role of ROLES) {
    if (await passes(role.assign, ctx, role.id)) return role.id
  }
  return DEFAULT_ROLE
}

async function claimsFrom(base: SportAssignContext, authzAt: number): Promise<AuthClaims> {
  const sports = await resolveSports(base)
  const role = await resolveRole({ ...base, sports })
  return {
    v: CLAIMS_VERSION,
    uid: base.user?.id ?? null,
    batch: base.batch,
    role,
    sports,
    orgs: base.orgs,
    authzAt,
  }
}

async function loadClaims(email: string, name: string | null): Promise<ClaimsResult> {
  const user = await fetchStrapiUser(email)
  if (user?.blocked) return { kind: 'blocked' }

  const orgs = user ? await fetchOrgMemberships(user.id) : []
  const claims = await claimsFrom(
    { email, name, user, batch: user?.batch ?? batchFromEmail(email), orgs },
    Date.now(),
  )
  return { kind: 'ok', claims }
}

/**
 * When claims go stale, the middleware and every `auth()` call in that same
 * request see the old cookie (the refreshed one only lands on the response),
 * so each would re-resolve. Sharing one in-flight resolve per email for a few
 * seconds collapses those into a single pair of Strapi calls.
 */
const DEDUPE_MS = 5 * 1000
const recent = new Map<string, { at: number; promise: Promise<ClaimsResult> }>()

/** Full resolve against Strapi. Rejects when Strapi can't be reached. */
export function resolveClaims(email: string, name: string | null): Promise<ClaimsResult> {
  const key = normalizeEmail(email)
  const now = Date.now()
  const hit = recent.get(key)
  if (hit && now - hit.at < DEDUPE_MS) return hit.promise

  for (const [cached, entry] of recent) {
    if (now - entry.at >= DEDUPE_MS) recent.delete(cached)
  }

  const promise = loadClaims(key, name)
  recent.set(key, { at: now, promise })
  // Don't hand a failure to the next caller — let it try Strapi again.
  promise.catch(() => recent.delete(key))
  return promise
}

/**
 * Like `resolveClaims`, but never throws. If Strapi is down it keeps the
 * previous claims, or — with none to keep — resolves from the email alone
 * (env and email-pattern roles still work; org roles don't). Either way it
 * retries after `RETRY_MS` instead of waiting out the full TTL.
 */
export async function resolveClaimsSafe(
  email: string,
  name: string | null,
  previous: AuthClaims | null,
): Promise<ClaimsResult> {
  try {
    return await resolveClaims(email, name)
  } catch (error) {
    platform.error('[authz] Could not resolve claims from Strapi:', error)
    const retryAt = Date.now() - CLAIMS_TTL_MS + RETRY_MS
    if (previous) return { kind: 'ok', claims: { ...previous, authzAt: retryAt } }

    const normalized = normalizeEmail(email)
    const claims = await claimsFrom(
      { email: normalized, name, user: null, batch: batchFromEmail(normalized), orgs: [] },
      retryAt,
    )
    return { kind: 'ok', claims }
  }
}

export function claimsAreStale(claims: Pick<AuthClaims, 'v' | 'authzAt'> | null): boolean {
  return !claims || claims.v !== CLAIMS_VERSION || Date.now() - claims.authzAt > CLAIMS_TTL_MS
}

/**
 * Reads claims back out of a token, or null if it predates the current claim
 * shape. The token is treated as untyped: the `next-auth/jwt` module
 * augmentation does not reach the nested `@auth/core` copy next-auth ships.
 */
export function readClaims(token: Record<string, unknown>): AuthClaims | null {
  if (token.v !== CLAIMS_VERSION || typeof token.authzAt !== 'number' || !isPlatformRole(token.role)) {
    return null
  }
  return {
    v: CLAIMS_VERSION,
    uid: typeof token.uid === 'number' ? token.uid : null,
    batch: typeof token.batch === 'string' ? token.batch : null,
    role: token.role,
    sports: Array.isArray(token.sports) ? (token.sports as Sport[]) : [],
    orgs: Array.isArray(token.orgs) ? (token.orgs as OrgMembership[]) : [],
    authzAt: token.authzAt,
  }
}
