import "server-only";


import { strapiGet, strapiPost, strapiPut, type StrapiFilters } from "@/lib/apis/strapi";
import type { ActivePoolData } from "@/app/platform/pool-subscription/types";
import {
  daysApart,
  proximity,
  rangeCoverage,
  rankMatches,
  textSimilarity,
  type Criterion,
  type DateRange,
} from "@/lib/matching";
import { ONGOING_HORIZON_DAYS, OTHER_SERVICE, POOL_TYPE, SERVICES } from "@/app/platform/pool-subscription/data";
import type {
  CreatePoolPayload,
  PoolListData,
  PoolListQuery,
  PoolMatch,
  PoolOwner,
  PoolStatus,
  PoolSubscription,
} from "@/app/platform/pool-subscription/types";
import { fromISODate, getService, isIndefinite } from "@/app/platform/pool-subscription/utils";

// ---------------------------------------------------------------------------
// Strapi → page types
// ---------------------------------------------------------------------------

const POOL_FIELDS = ["service", "numberPeople", "start", "end", "status", "createdAt", "updatedAt"];
// Email is the contact route the pages offer; phone numbers stay out of other users' browsers.
const POOLER_POPULATE = { pooler: { fields: ["username", "email"] } };
/** Upper bound on rows pulled for matching. Strapi has already filtered by type, status and dates. */
const MATCH_CANDIDATE_CAP = 200;
const MATCH_LIMIT = 3;
const STATUSES: readonly PoolStatus[] = ["open", "full", "canceled"];

interface StrapiPoolRow {
  id?: number | string;
  attributes?: {
    service?: string | null;
    numberPeople?: number | null;
    start?: string | null;
    end?: string | null;
    status?: string | null;
    createdAt?: string;
    updatedAt?: string;
    pooler?: {
      data?: {
        id?: number;
        attributes?: { username?: string | null; email?: string | null };
      } | null;
    };
  };
}

interface StrapiList {
  data?: StrapiPoolRow[] | null;
  meta?: { pagination?: Record<string, number> };
}

function toOwner(row: StrapiPoolRow): PoolOwner | null {
  const pooler = row.attributes?.pooler?.data;
  return pooler?.id !== undefined
      ? {
          id: pooler.id,
          attributes: {
            username: pooler.attributes?.username ?? "Someone",
            email: pooler.attributes?.email ?? "",
            phone: null,
          },
        }
      : null;
}

function toOwners(res: StrapiList | null | undefined): [string, PoolOwner][] {
  return (res?.data ?? []).flatMap((row) => {
    const owner = toOwner(row);
    return row.id !== undefined && owner ? [[String(row.id), owner] as [string, PoolOwner]] : [];
  });
}

function toPool(row: StrapiPoolRow): PoolSubscription | null {
  const a = row.attributes;
  if (row.id === undefined || !a?.service || !a.start || !a.end) return null;
  const status = STATUSES.find((s) => s === a.status) ?? "open";

  return {
    id: String(row.id),
    attributes: {
      service: a.service,
      numberPeople: a.numberPeople ?? 2,
      start: a.start,
      end: a.end,
      status,
      createdAt: a.createdAt ?? "",
      updatedAt: a.updatedAt ?? "",
      user: { data: toOwner(row) },
    },
  };
}

function toPools(res: StrapiList | null | undefined): PoolSubscription[] {
  return (res?.data ?? []).flatMap((row) => {
    const pool = toPool(row);
    return pool ? [pool] : [];
  });
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** The caller's open, unexpired subscription pool, if any. */
export async function fetchOwnOpenPool(uid: number): Promise<PoolSubscription | null> {
  const res = (await strapiGet("/pools", {
    filters: {
      type: { $eq: POOL_TYPE },
      pooler: { id: { $eq: uid } },
      status: { $eq: "open" },
      end: { $gte: todayISO() },
    },
    fields: POOL_FIELDS,
    populate: POOLER_POPULATE,
    sort: ["start:asc"],
    pagination: { pageSize: 1 },
  })) as StrapiList;
  return toPools(res)[0] ?? null;
}

const KNOWN_SERVICE_VALUES = SERVICES.filter((s) => s.value !== OTHER_SERVICE).map((s) => s.value);

/** One page of open subscription pools, soonest first, narrowed in Strapi by service and search. */
export async function listOpenPools(
  { page, service, q }: PoolListQuery,
  pageSize: number,
): Promise<Omit<PoolListData, "own">> {
  const and: StrapiFilters[] = [];
  if (service) {
    and.push(service === OTHER_SERVICE ? { service: { $notIn: KNOWN_SERVICE_VALUES } } : { service: { $eq: service } });
  }
  if (q) {
    // Known services are stored by key, so "amazon" has to be turned into "prime" before Strapi sees it.
    const needle = q.toLowerCase();
    const keys = SERVICES.filter((s) => s.value !== OTHER_SERVICE && s.label.toLowerCase().includes(needle)).map((s) => s.value);
    and.push({
      $or: [
        { service: { $containsi: q } },
        ...(keys.length ? [{ service: { $in: keys } }] : []),
        { pooler: { username: { $containsi: q } } },
      ],
    });
  }

  const res = (await strapiGet("/pools", {
    filters: {
      type: { $eq: POOL_TYPE },
      status: { $eq: "open" },
      end: { $gte: todayISO() },
      ...(and.length ? { $and: and } : {}),
    },
    fields: POOL_FIELDS,
    populate: POOLER_POPULATE,
    sort: ["start:asc", "id:asc"],
    pagination: { page, pageSize },
  })) as StrapiList;

  const meta = res?.meta?.pagination ?? {};
  return {
    pools: toPools(res),
    page: meta.page ?? page,
    pageCount: Math.max(meta.pageCount ?? 1, 1),
    total: meta.total ?? 0,
  };
}

/** The pool by id, only if the caller owns it. Null otherwise, so callers can 404 without revealing it exists. */
export async function fetchOwnedPool(id: string, uid: number): Promise<PoolSubscription | null> {
  const res = (await strapiGet("/pools", {
    filters: { id: { $eq: id }, type: { $eq: POOL_TYPE }, pooler: { id: { $eq: uid } } },
    fields: POOL_FIELDS,
    pagination: { pageSize: 1 },
  })) as StrapiList;
  return toPools(res)[0] ?? null;
}

export async function createPool(uid: number, payload: CreatePoolPayload) {
  return strapiPost("/pools", {
    data: { ...payload, type: POOL_TYPE, status: "open", pooler: uid },
  });
}

export async function updatePoolStatus(id: string, status: PoolStatus) {
  return strapiPut(`/pools/${id}`, { data: { status } });
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/** What the subscription criteria compare: one pool, with dates parsed. */
interface MatchablePool {
  pool: PoolSubscription;
  label: string;
  known: boolean;
  range: DateRange;
  people: number;
}

function toMatchable(pool: PoolSubscription): MatchablePool {
  const { service, start, end, numberPeople } = pool.attributes;
  const startDate = fromISODate(start);
  // An ongoing pool is compared over a fixed horizon, so "forever" doesn't swamp the overlap maths.
  const endDate = isIndefinite(end)
    ? new Date(startDate.getTime() + ONGOING_HORIZON_DAYS * 86_400_000)
    : fromISODate(end);
  const knownService = SERVICES.some((s) => s.value === service && s.value !== OTHER_SERVICE);
  return {
    pool,
    label: getService(service).label,
    known: knownService,
    range: { start: startDate, end: endDate },
    people: numberPeople,
  };
}

/**
 * Overall score needed to suggest a pool. 0.6 keeps out "same service, a week of
 * overlap" pairs, which score about 0.55.
 */
const SUBSCRIPTION_MATCH_THRESHOLD = 0.6;

/** Below this, two typed "Others" names are treated as different services. */
const SERVICE_SIMILARITY_FLOOR = 0.6;

/**
 * What makes two subscription pools close. Service and some date overlap are
 * required; overlap, start date and group size then rank what's left.
 */
const subscriptionCriteria: readonly Criterion<MatchablePool>[] = [
  {
    key: "service",
    weight: 0.45,
    score: (mine, theirs) => {
      if (mine.pool.attributes.service === theirs.pool.attributes.service) return 1;
      // Two different known services never match; a typed name can match a known one or another typed name.
      if (mine.known && theirs.known) return null;
      const similarity = textSimilarity(mine.label, theirs.label);
      return similarity >= SERVICE_SIMILARITY_FLOOR ? similarity : null;
    },
    explain: (_mine, theirs, score) => (score === 1 ? "Same service" : `Similar service: ${theirs.label}`),
  },
  {
    key: "dates",
    weight: 0.3,
    score: (mine, theirs) => rangeCoverage(mine.range, theirs.range),
    explain: (_mine, _theirs, score) =>
      score >= 0.95 ? "Covers all your dates" : `Overlaps ${Math.round(score * 100)}% of your dates`,
  },
  {
    key: "start",
    weight: 0.15,
    score: (mine, theirs) => proximity(daysApart(mine.range.start, theirs.range.start), 14),
    explain: (mine, theirs) => {
      const days = daysApart(mine.range.start, theirs.range.start);
      if (days === 0) return "Starts the same day";
      if (days <= 7) return "Starts the same week";
      return null;
    },
  },
  {
    key: "size",
    weight: 0.1,
    score: (mine, theirs) => proximity(mine.people - theirs.people, 4),
    explain: (mine, theirs) => (mine.people === theirs.people ? `Also looking for ${theirs.people} people` : null),
  },
];

/**
 * Open pools from other people that Strapi can rule in cheaply: same type,
 * open, and some date overlap. Service closeness is scored afterwards, since
 * typed "Others" names can't be fuzzy-matched in a query.
 */
async function fetchMatchCandidates(mine: MatchablePool, uid: number): Promise<PoolSubscription[]> {
  const today = todayISO();
  const myStart = mine.pool.attributes.start;
  const myEnd = mine.pool.attributes.end;
  
  const filters = {
    type: { $eq: POOL_TYPE },
    status: { $eq: "open" },
    pooler: { id: { $ne: uid } },
    start: { $lte: myEnd },
    end: { $gte: myStart > today ? myStart : today },
  };

  const res = (await strapiGet("/pools", {
    // Known service: same key, or any typed name (which might be the same thing).
    // Typed name: no service filter; the scorer compares names.
    filters: mine.known
      ? { ...filters, $or: [{ service: { $eq: mine.pool.attributes.service } }, { service: { $notIn: KNOWN_SERVICE_VALUES } }] }
      : filters,
    // No populate: owners are only loaded for the few that make the cut.
    fields: POOL_FIELDS,
    sort: ["start:asc"],
    pagination: { pageSize: MATCH_CANDIDATE_CAP },
  })) as StrapiList;
  return toPools(res);
}

/** The closest open pools to `pool`, best first. Empty when nothing is close enough. */
export async function findPoolMatches(pool: PoolSubscription, uid: number): Promise<PoolMatch[]> {
  const mine = toMatchable(pool);
  const candidates = (await fetchMatchCandidates(mine, uid)).map(toMatchable);
  const ranked = rankMatches(mine, candidates, subscriptionCriteria, {
    threshold: SUBSCRIPTION_MATCH_THRESHOLD,
    limit: MATCH_LIMIT,
  });
  if (ranked.length === 0) return [];

  // One query for the winners' owners instead of populating every candidate.
  const owners = (await strapiGet("/pools", {
    filters: { id: { $in: ranked.map((m) => m.candidate.pool.id) } },
    fields: ["id"],
    populate: POOLER_POPULATE,
    pagination: { pageSize: MATCH_LIMIT },
  })) as StrapiList;
  const ownerById = new Map(toOwners(owners));

  return ranked.map((m) => ({
    pool: {
      ...m.candidate.pool,
      attributes: { ...m.candidate.pool.attributes, user: { data: ownerById.get(m.candidate.pool.id) ?? null } },
    },
    score: Math.round(m.score * 100) / 100,
    reasons: m.reasons,
  }));
}

/** The caller's open pool and its matches: what the page renders. */
export async function getActivePoolData(uid: number): Promise<ActivePoolData> {
  const pool = await fetchOwnOpenPool(uid);
  return { pool, matches: pool ? await findPoolMatches(pool, uid) : [] };
}
