/**
 * Ready-made assigners for the role registry (`./roles.ts`).
 *
 * An assigner is just `(ctx) => boolean | Promise<boolean>`, so a role can
 * also take an inline function when none of these fit.
 */

import { isEmailInCollection } from './loaders'
import type { Assigner, AssignContext, OrgTier } from './types'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Reads a comma-separated email list from the environment. */
export function envEmailList(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean)
}

/** Email is in a fixed list. */
export function byEmailList(emails: readonly string[]): Assigner<Pick<AssignContext, 'email'>> {
  const allowed = new Set(emails.map(normalizeEmail))
  return (ctx) => allowed.has(ctx.email)
}

/** Email is in a comma-separated env var. */
export function byEnvList(name: string): Assigner<Pick<AssignContext, 'email'>> {
  return (ctx) => envEmailList(name).includes(ctx.email)
}

/** Email matches a pattern. Don't pass a `/g` regex — `test` would keep state between calls. */
export function byEmailPattern(pattern: RegExp): Assigner<Pick<AssignContext, 'email'>> {
  return (ctx) => pattern.test(ctx.email)
}

/**
 * Email is listed in a Strapi collection. One Strapi call each time it runs,
 * which is only when the roles above it didn't match.
 */
export function byStrapiCollection(endpoint: string, field = 'email'): Assigner<Pick<AssignContext, 'email'>> {
  return (ctx) => isEmailInCollection(endpoint, field, ctx.email)
}

/** Holds a tier at least this senior (lower number) in any organisation. */
export function byOrgTier(maxTier: OrgTier): Assigner<Pick<AssignContext, 'orgs'>> {
  return (ctx) => ctx.orgs.some(([, tier]) => tier <= maxTier)
}

/** Point of contact for at least one league. */
export function bySportPoc(): Assigner<Pick<AssignContext, 'sports'>> {
  return (ctx) => ctx.sports.length > 0
}

/** Any of the given assigners matches. Runs them in order and stops at the first match. */
export function anyOf<Ctx>(...assigners: Assigner<Ctx>[]): Assigner<Ctx> {
  return async (ctx) => {
    for (const assign of assigners) {
      if (await assign(ctx)) return true
    }
    return false
  }
}

/** Every one of the given assigners matches. */
export function allOf<Ctx>(...assigners: Assigner<Ctx>[]): Assigner<Ctx> {
  return async (ctx) => {
    for (const assign of assigners) {
      if (!(await assign(ctx))) return false
    }
    return true
  }
}

/** Always matches — for the catch-all role at the end of the registry. */
export function always(): Assigner<unknown> {
  return () => true
}
