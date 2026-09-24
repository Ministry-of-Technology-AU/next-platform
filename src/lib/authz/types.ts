/**
 * Shapes shared by the role registry, the claim resolver and the session.
 *
 * No runtime imports here — `src/types/auth.d.ts` pulls from this file.
 */

export const SPORTS = ['aba', 'apl', 'rsl'] as const
export type Sport = (typeof SPORTS)[number]

/**
 * Seniority inside one organisation. Lower is more senior:
 *   0 — the organisation account itself (the org's `profile`)
 *   1 — circle 1
 *   2 — circle 2
 */
export type OrgTier = 0 | 1 | 2

/**
 * `[organisationId, tier, sport?]`. A tuple rather than an object so the
 * session cookie stays small — it rides along on every request.
 * `sport` is the organisation's league, from its `sports` field in Strapi, and
 * is left off entirely for non-sports organisations.
 */
export type OrgMembership = [orgId: number, tier: OrgTier, sport?: Sport]

/** The slice of the Strapi `users` record the auth layer cares about. */
export interface StrapiUser {
  id: number
  email: string
  username: string | null
  batch: string | null
  blocked: boolean
}

/**
 * Everything an assigner can look at. Loaded once per resolve (one `/users`
 * call, one `/organisations` call) and shared by every assigner, so adding a
 * role does not add a Strapi round trip unless its assigner fetches on its own.
 */
export interface AssignContext {
  /** Trimmed and lowercased. */
  email: string
  name: string | null
  /** Null when the user has no Strapi record yet (or Strapi was unreachable). */
  user: StrapiUser | null
  batch: string | null
  orgs: OrgMembership[]
  /** Leagues this person is a point of contact for. Resolved before roles. */
  sports: Sport[]
}

/** Context available while sports are being resolved — sports are not known yet. */
export type SportAssignContext = Omit<AssignContext, 'sports'>

/**
 * Decides whether a user gets a role (or a sport). Can be sync or async, and
 * can read the shared context or fetch whatever it needs itself.
 */
export type Assigner<Ctx = AssignContext> = (ctx: Ctx) => boolean | Promise<boolean>

export interface RoleDefinition<Id extends string = string> {
  id: Id
  label: string
  description: string
  /** Access grants (`session.user.access`) this role carries. */
  access: readonly string[]
  /**
   * Who gets this role. Roles are tried in registry order and the first
   * assigner to return true wins, so later assigners never run.
   */
  assign: Assigner
}

export interface SportDefinition {
  label: string
  /** Access grants added on top of the user's role access. */
  access: readonly string[]
  /** Who is a point of contact for this league. Every sport is checked. */
  assign: Assigner<SportAssignContext>
}
