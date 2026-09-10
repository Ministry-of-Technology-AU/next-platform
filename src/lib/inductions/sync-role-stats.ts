import 'server-only';

/**
 * Three-tier lazy stats sync.
 *
 * Tier 1 – syncRoleStatsFromForm(roleId)
 *   Called when an org visits a specific role page.
 *   The ONLY function that reads Form.stats.
 *   Debounced with a 2-min in-memory cache.
 *
 * Tier 2 – syncCycleStatsFromRoles(cycleId)
 *   Called when an org visits the cycle page.
 *   Aggregates from stored Role.stats — no form drilling.
 *   For any role whose lastSyncedAt is missing or >12 h old,
 *   fires-and-forgets a Tier-1 sync for that role.
 *
 * Tier 3 – syncCycleStatsIfStale(cycleId)
 *   Called by the admin portal for each active cycle.
 *   Full drill-down (Tier 1 for every role, then Tier 2) only when
 *   the cycle's lastSyncedAt is missing or >24 h old. Otherwise a no-op.
 */

import { strapiGet } from '@/lib/apis/strapi';
import {
  listRolesByCycle,
  updateRole,
  updateCycle,
  getCycleById,
  safeRevalidateTag,
} from '@/lib/inductions/strapi-inductions';
import {
  PLACEHOLDER_ROLE_STATS,
  PLACEHOLDER_CYCLE_STATS,
  type RoleStats,
  type CycleStats,
} from '@/app/organisations/inductions/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function attrs<T = Record<string, unknown>>(entry: any): T {
  return (entry?.attributes ?? entry ?? {}) as T;
}

// ---------------------------------------------------------------------------
// TTL constants
// ---------------------------------------------------------------------------

/** Role-level in-memory debounce (best-effort on serverless). */
const ROLE_DEBOUNCE_MS = 2 * 60 * 1000; // 2 minutes

/** Roles older than this trigger a background form-level re-sync on cycle visits. */
const ROLE_STALENESS_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Cycles older than this trigger a full drill-down from the admin portal. */
const CYCLE_STALENESS_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// In-Flight Concurrency Controls
// ---------------------------------------------------------------------------

const inFlightRoleSyncs = new Set<string>();
const inFlightCycleSyncs = new Set<string>();

// ---------------------------------------------------------------------------
// Tier 1 — Sync a single role from its linked Form.stats
// ---------------------------------------------------------------------------

/** In-memory cache: roleId → { stats, syncedAt } */
const roleSyncCache = new Map<string, { stats: RoleStats; syncedAt: number }>();

/**
 * Reads the first form-type pipeline round's linked Form → Form.stats.
 * Maps: uniqueVisits → opens, submissionCount → fills, draftCount → drafts.
 * Writes the result (with lastSyncedAt) to InductionRole.stats in Strapi.
 *
 * Debounced: returns the cached result if the role was synced within 2 minutes.
 * Pass { force: true } to bypass the cache (used by the manual force-sync path).
 */
export async function syncRoleStatsFromForm(
  roleId: string | number,
  options?: { force?: boolean },
): Promise<RoleStats> {
  const key = String(roleId);

  // Debounce check
  if (!options?.force) {
    const cached = roleSyncCache.get(key);
    if (cached && Date.now() - cached.syncedAt < ROLE_DEBOUNCE_MS) {
      return cached.stats;
    }
  }

  // Prevent duplicate concurrent sync for the same role
  if (inFlightRoleSyncs.has(key)) {
    return roleSyncCache.get(key)?.stats ?? { ...PLACEHOLDER_ROLE_STATS };
  }

  inFlightRoleSyncs.add(key);

  let roleStats: RoleStats = { ...PLACEHOLDER_ROLE_STATS };

  try {
    // Fetch role with pipeline_rounds → form populated
    const roleRes = await strapiGet(`/induction-roles/${roleId}`, {
      populate: {
        pipeline_rounds: {
          populate: { form: true },
        },
      },
    });

    const rAttrs = attrs<any>(roleRes?.data);
    const rawRounds = Array.isArray(rAttrs?.pipeline_rounds?.data)
      ? rAttrs.pipeline_rounds.data
      : Array.isArray(rAttrs?.pipeline_rounds)
        ? rAttrs.pipeline_rounds
        : [];

    // Sort by order ascending, find first form-type round
    const sorted = [...rawRounds].sort((x: any, y: any) => {
      const xA = attrs<any>(x);
      const yA = attrs<any>(y);
      return (xA.order ?? 0) - (yA.order ?? 0);
    });

    const firstFormRound =
      sorted.find((r: any) => {
        const a = attrs<any>(r);
        return !a.type || a.type === 'form';
      }) ?? sorted[0];

    if (firstFormRound) {
      const rndAttrs = attrs<any>(firstFormRound);
      const formEntry = rndAttrs?.form?.data ?? rndAttrs?.form;
      const formAttrs = attrs<any>(formEntry);

      if (formAttrs?.stats) {
        const fs = formAttrs.stats;
        const opens = (fs.uniqueVisits as number) ?? 0;
        const fills = (fs.submissionCount as number) ?? 0;
        const drafts = (fs.draftCount as number) ?? 0;
        roleStats = {
          opens,
          fills,
          drafts,
          completionRate: opens > 0 ? fills / opens : 0,
          topUtm: null,
        };
      }
    }

    // Persist to Strapi — include lastSyncedAt so staleness is detectable
    const statsToWrite = {
      ...roleStats,
      lastSyncedAt: new Date().toISOString(),
    };

    await updateRole(roleId, { stats: statsToWrite as any });
    safeRevalidateTag('admin-organizations');

    // Update in-memory debounce cache
    roleSyncCache.set(key, { stats: roleStats, syncedAt: Date.now() });
  } catch (err) {
    console.error('[sync] Failed to sync form stats for role:', roleId, err);
  } finally {
    inFlightRoleSyncs.delete(key);
  }

  return roleStats;
}

// ---------------------------------------------------------------------------
// Tier 2 — Aggregate cycle stats from stored Role.stats
// ---------------------------------------------------------------------------

/**
 * Aggregates Cycle.stats by summing the stored Role.stats for every role in
 * the cycle — NO form queries here.
 *
 * For any role whose stats.lastSyncedAt is missing or >12 h old, fires-and-
 * forgets a Tier-1 sync. The aggregation still uses the currently stored value;
 * the background sync will make it accurate on the next cycle page visit.
 *
 * Writes the aggregated stats (with lastSyncedAt) to InductionCycle.stats.
 */
export async function syncCycleStatsFromRoles(
  cycleId: string | number,
): Promise<CycleStats> {
  const roles = await listRolesByCycle(cycleId);

  let totalOpens = 0;
  let totalFills = 0;
  let totalDrafts = 0;

  for (const role of roles) {
    const stats = (role.stats as any) || PLACEHOLDER_ROLE_STATS;
    const lastSyncedAt: string | undefined = stats.lastSyncedAt;
    const isStale =
      !lastSyncedAt ||
      Date.now() - new Date(lastSyncedAt).getTime() > ROLE_STALENESS_MS;

    if (isStale) {
      // Background: sync this stale role from its form data.
      // Does not block the aggregation — we use the currently stored value.
      syncRoleStatsFromForm(role.id).catch((e) =>
        console.error('[sync] Background role sync failed for role:', role.id, e),
      );
    }

    totalOpens += stats.opens || 0;
    totalFills += stats.fills || 0;
    totalDrafts += stats.drafts || 0;
  }

  const cycleStats = {
    ...PLACEHOLDER_CYCLE_STATS,
    totalOpens,
    totalFills,
    totalDrafts,
    rolesCount: roles.length,
    applicantsCount: totalFills,
    completionRate: totalOpens > 0 ? totalFills / totalOpens : 0,
    lastSyncedAt: new Date().toISOString(),
  };

  try {
    await updateCycle(cycleId, { stats: cycleStats as any });
    safeRevalidateTag('admin-organizations');
  } catch (err) {
    console.error('[sync] Failed to write cycle stats for cycle:', cycleId, err);
  }

  return cycleStats;
}

// ---------------------------------------------------------------------------
// Tier 3 — Full drill-down for stale cycles (called by admin portal)
// ---------------------------------------------------------------------------

/**
 * Checks whether a cycle's stats are stale (lastSyncedAt missing or >24 h old).
 *
 * If STALE:
 *   - Syncs every role from Form.stats (Tier 1, force=true to bypass debounce)
 *   - Then re-aggregates Cycle.stats from the freshly written Role.stats (Tier 2)
 *   Returns true.
 *
 * If FRESH: no-op. Returns false.
 *
 * This is intentionally the expensive path — but it runs at most once per 24 h
 * per active cycle, fire-and-forget from the admin portal.
 */
export async function syncCycleStatsIfStale(
  cycleId: string | number,
): Promise<boolean> {
  const key = String(cycleId);
  if (inFlightCycleSyncs.has(key)) {
    return false;
  }
  inFlightCycleSyncs.add(key);

  try {
    const cycle = await getCycleById(cycleId);
    if (!cycle) return false;

    const lastSyncedAt: string | undefined = (cycle.stats as any)?.lastSyncedAt;
    const isFresh =
      lastSyncedAt &&
      Date.now() - new Date(lastSyncedAt).getTime() < CYCLE_STALENESS_MS;

    if (isFresh) return false;

    // Full drill-down: sync every role from forms, then aggregate cycle
    const roles = await listRolesByCycle(cycleId);
    for (const role of roles) {
      await syncRoleStatsFromForm(role.id, { force: true });
    }
    await syncCycleStatsFromRoles(cycleId);

    return true;
  } catch (err) {
    console.error('[sync] Stale cycle full sync failed for cycle:', cycleId, err);
    return false;
  } finally {
    inFlightCycleSyncs.delete(key);
  }
}
