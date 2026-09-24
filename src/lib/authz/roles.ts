/**
 * The role registry — the one place that decides who is what.
 *
 * Adding a role:
 *   1. Add a `defineRole({...})` entry to `ROLES` at the right priority.
 *   2. Give it an `assign` function. Use one from `./assigners.ts`, compose
 *      them with `anyOf` / `allOf`, or write your own — sync or async, reading
 *      the shared context (`ctx.user`, `ctx.orgs`, `ctx.batch`, …) or fetching
 *      whatever it needs.
 *   3. If the role needs its own sidebar, add it to the relevant interface's
 *      `roles` map in `src/components/sidebar/`.
 *
 * Order matters: roles are tried top to bottom and the first match wins.
 * Assignment re-runs on sign-in and every `CLAIMS_TTL_MS` after (see
 * `./claims.ts`), so a change here reaches signed-in users without a re-login.
 */

import {
  always,
  anyOf,
  byEmailList,
  byEmailPattern,
  byEnvList,
  byOrgTier,
  bySportPoc,
  byStrapiCollection,
} from './assigners'
import type { AssignContext, RoleDefinition, Sport, SportDefinition } from './types'

function defineRole<const Id extends string>(role: RoleDefinition<Id>): RoleDefinition<Id> {
  return role
}

/** Platform-governance accounts that act as organisation accounts without owning one. */
const GOVERNANCE_ACCOUNTS = [
  'technology.ministry@ashoka.edu.in',
  'sg@ashoka.edu.in',
]

/**
 * Any underscore in the local part marks a student address
 * (`name_ug2023@…`, `name_ugt2024@…`, `name_yif2025@…`) — no one else follows
 * that convention, so the suffix itself isn't checked. Every programme is the
 * one `student` role; tell them apart with `batch` (`UG2023`, `YIF2024`, …)
 * via `hasProgramme` in src/lib/auth.ts.
 */
export const STUDENT_EMAIL = /^[^@]*_[^@]+@/

/** YSP participants carry the same convention but get their own role. Checked before `student`. */
export const YSP_EMAIL = /_ysp[^@]*@/

export const ROLES = [
  defineRole({
    id: 'superadmin',
    label: 'Super Admin',
    description: 'Listed in SUPERADMIN_EMAILS. Carries every access grant.',
    access: ['platform', 'ashoka_admin', 'organization', 'rep_dashboard', 'beta_features', 'apl_admin'],
    assign: byEnvList('SUPERADMIN_EMAILS'),
  }),
  defineRole({
    id: 'ashoka_admin',
    label: 'Ashoka Admin',
    description: 'University staff. Listed in ADMIN_EMAILS.',
    access: ['platform', 'ashoka_admin', 'organization'],
    assign: byEnvList('ADMIN_EMAILS'),
  }),
  defineRole({
    id: 'organization',
    label: 'Organisation Account',
    description: "An organisation's own account (its Strapi `profile`), or a governance account.",
    access: ['platform', 'organization'],
    assign: anyOf<AssignContext>(byEmailList(GOVERNANCE_ACCOUNTS), byOrgTier(0)),
  }),
  defineRole({
    id: 'beta_tester',
    label: 'Beta Tester',
    description: 'Listed in BETA_TESTERS.',
    access: ['platform', 'beta_features'],
    assign: byEnvList('BETA_TESTERS'),
  }),
  defineRole({
    id: 'hor_member',
    label: 'House of Representatives',
    description: 'Listed in HOR_MEMBERS.',
    access: ['platform'],
    assign: byEnvList('HOR_MEMBERS'),
  }),
  defineRole({
    id: 'rep',
    label: 'Department Representative',
    description: 'Email is in the `department-reps` collection in Strapi.',
    access: ['platform', 'rep_dashboard'],
    assign: byStrapiCollection('/department-reps'),
  }),
  defineRole({
    id: 'sport_poc',
    label: 'Sports Point of Contact',
    description: 'Runs at least one league. Which ones is in `session.user.sports`.',
    access: ['platform'],
    assign: bySportPoc(),
  }),
  defineRole({
    id: 'ysp',
    label: 'YSP Participant',
    description: 'Address carries the _ysp suffix. No platform access yet.',
    access: ['none'],
    assign: byEmailPattern(YSP_EMAIL),
  }),
  defineRole({
    id: 'student',
    label: 'Student',
    description: 'Underscore in the address (_ug, _ugt, _asp, _yif, _phd, …). Programme is in `batch`.',
    access: ['platform'],
    assign: byEmailPattern(STUDENT_EMAIL),
  }),
  defineRole({
    id: 'user',
    label: 'General User',
    description: 'Signed in but outside every other role.',
    access: ['none'],
    assign: always(),
  }),
] as const

export type PlatformRole = (typeof ROLES)[number]['id']

export const DEFAULT_ROLE: PlatformRole = 'user'

/**
 * Leagues and their points of contact. Unlike roles, every sport is checked,
 * so one person can run several. Resolved before roles, so a role's assigner
 * can read `ctx.sports`.
 */
export const SPORT_POCS: Record<Sport, SportDefinition> = {
  apl: {
    label: 'Ashoka Premier League',
    access: ['apl_admin'],
    assign: byEnvList('APL_ADMIN_EMAILS'),
  },
  aba: {
    label: 'Ashoka Basketball Association',
    access: [],
    assign: byEnvList('ABA_ADMIN_EMAILS'),
  },
  rsl: {
    label: 'RSL',
    access: [],
    assign: byEnvList('RSL_ADMIN_EMAILS'),
  },
}

const ROLE_BY_ID = new Map<string, RoleDefinition<PlatformRole>>(ROLES.map((role) => [role.id, role]))

export function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === 'string' && ROLE_BY_ID.has(value)
}

/** Access grants for a role plus every league the user runs. */
export function accessFor(role: PlatformRole, sports: readonly Sport[]): string[] {
  const access = new Set(ROLE_BY_ID.get(role)?.access ?? [])
  for (const sport of sports) {
    for (const grant of SPORT_POCS[sport].access) access.add(grant)
  }
  return [...access]
}
