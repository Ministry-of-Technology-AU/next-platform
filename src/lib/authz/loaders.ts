/**
 * Strapi reads behind the auth claims. These throw on network or Strapi
 * errors so the caller can tell "no record" apart from "couldn't check".
 */

import { strapiGet } from '@/lib/apis/strapi'
import { SPORTS, type OrgMembership, type OrgTier, type Sport, type StrapiUser } from './types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

/** Strapi v4 nests fields under `attributes`; flattened responses don't. */
function attributesOf(entry: unknown): UnknownRecord {
  if (!isRecord(entry)) return {}
  return isRecord(entry.attributes) ? entry.attributes : entry
}

function toId(value: unknown): number | null {
  const id = typeof value === 'string' ? Number(value) : value
  return typeof id === 'number' && Number.isInteger(id) ? id : null
}

/** Ids out of a relation field, whether it is `{ data: … }`-wrapped, a single entry or a list. */
function relationIds(value: unknown): number[] {
  const unwrapped = isRecord(value) && 'data' in value ? value.data : value
  const entries = Array.isArray(unwrapped) ? unwrapped : [unwrapped]
  return entries
    .map((entry) => (isRecord(entry) ? toId(entry.id) : null))
    .filter((id): id is number => id !== null)
}

function toSport(value: unknown): Sport | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return (SPORTS as readonly string[]).includes(normalized) ? (normalized as Sport) : null
}

function toStrapiUser(row: unknown): StrapiUser | null {
  if (!isRecord(row)) return null
  const id = toId(row.id)
  if (id === null || typeof row.email !== 'string') return null
  return {
    id,
    email: row.email,
    username: typeof row.username === 'string' ? row.username : null,
    batch: typeof row.batch === 'string' && row.batch.trim() ? row.batch.trim().toUpperCase() : null,
    blocked: row.blocked === true,
  }
}

export async function fetchStrapiUser(email: string): Promise<StrapiUser | null> {
  const rows: unknown = await strapiGet('/users', {
    filters: { email: { $eq: email } },
  })
  return Array.isArray(rows) ? toStrapiUser(rows[0]) : null
}

/**
 * Every organisation the user belongs to, with their tier in it. The org's
 * `sports` field holds its league (`aba`, `apl`, `rsl`); anything else — empty,
 * missing, unknown — means it is not a sports organisation.
 */
export async function fetchOrgMemberships(userId: number): Promise<OrgMembership[]> {
  const matchUser = { id: { $eq: userId } }
  const res: unknown = await strapiGet('/organisations', {
    // Object keys rather than an array: qs's `brackets` format would drop the indices.
    filters: {
      $or: {
        '0': { profile: matchUser },
        '1': { circle1_humans: matchUser },
        '2': { circle2_humans: matchUser },
      },
    },
    populate: {
      profile: { fields: ['id'] },
      circle1_humans: { fields: ['id'], filters: matchUser },
      circle2_humans: { fields: ['id'], filters: matchUser },
    },
    pagination: { pageSize: 100 },
  })

  const rows = isRecord(res) && Array.isArray(res.data) ? res.data : []
  const memberships: OrgMembership[] = []

  for (const row of rows) {
    const orgId = isRecord(row) ? toId(row.id) : null
    if (orgId === null) continue
    const attrs = attributesOf(row)

    let tier: OrgTier | null = null
    if (relationIds(attrs.profile).includes(userId)) tier = 0
    else if (relationIds(attrs.circle1_humans).includes(userId)) tier = 1
    else if (relationIds(attrs.circle2_humans).includes(userId)) tier = 2
    if (tier === null) continue

    const sport = toSport(attrs.sports)
    memberships.push(sport ? [orgId, tier, sport] : [orgId, tier])
  }

  return memberships
}

/**
 * Whether `email` appears in a Strapi collection — e.g. a list of department
 * reps. Case-insensitive on the Strapi side.
 */
export async function isEmailInCollection(endpoint: string, field: string, email: string): Promise<boolean> {
  const res: unknown = await strapiGet(endpoint, {
    filters: { [field]: { $eqi: email } },
    fields: [field],
    pagination: { pageSize: 1 },
  })
  return isRecord(res) && Array.isArray(res.data) && res.data.length > 0
}
