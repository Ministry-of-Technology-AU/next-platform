import 'server-only';

import { unstable_cache } from 'next/cache';
import { strapiGet } from '@/lib/apis/strapi';
import {
  type CycleStatus,
  type RoleTier,
  type CycleStats,
  type RoleStats,
  PLACEHOLDER_CYCLE_STATS,
  PLACEHOLDER_ROLE_STATS,
  getDerivedCycleStatus,
} from '@/app/organisations/inductions/types';
import { listRolesByCycle, listPipelineByRole, listCyclesByOrg } from '@/lib/inductions/strapi-inductions';
import { normalizeEndDateToEndOfDay } from '@/lib/date-utils';
import { isAllowedAdminClub, normalizeSlug } from '@/lib/admin/allowed-clubs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminOrganisationListItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  email: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  activeInductions: boolean;
  teamSize: number;
  openRolesCount: number;
  totalApplications: number;
  totalOpens: number;
  completionRate: number;
  activeCycle: {
    id: string;
    name: string;
    status: CycleStatus;
    startDate: string | null;
    endDate: string | null;
  } | null;
  lastInducted: string;
}

export type AdminOrganizationListItem = AdminOrganisationListItem;

export interface AdminPlatformSummary {
  totalOrganisations: number;
  totalOrganizations: number;
  activeInductionOrgs: number;
  totalOpenRoles: number;
  totalApplications: number;
  totalOpens: number;
  overallCompletionRate: number;
}

export interface AdminRoleDetail {
  id: string;
  name: string;
  tier: RoleTier;
  department: string | null;
  description: string | null;
  stats: RoleStats;
  pipelineRounds: {
    id: string;
    label: string;
    type: string;
    status: string;
    deadline: string | null;
    order: number;
  }[];
}

export interface AdminTimelineStep {
  step: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface AdminCycleDetail {
  id: string;
  name: string;
  status: CycleStatus;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  stats: CycleStats;
  roles: AdminRoleDetail[];
  timeline: AdminTimelineStep[];
}

export interface AdminOrganisationDetail {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  email: string | null;
  inductionsOpen: boolean;
  inductionEnd: string | null;
  teamSize: number;
  leadershipTier1: { username: string; email: string }[];
  leadershipTier2: { username: string; email: string }[];
  membersCount: number;
  cycles: AdminCycleDetail[];
  aggregateStats: {
    totalApplications: number;
    totalOpens: number;
    totalDrafts: number;
    totalRoles: number;
    completionRate: number;
  };
}

export type AdminOrganizationDetail = AdminOrganisationDetail;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://sg.ashoka.edu.in/backend';
  if (url.startsWith('/')) return `${strapiUrl}${url}`;
  return url;
}

function attrs<T = Record<string, unknown>>(entry: any): T {
  return (entry?.attributes ?? entry ?? {}) as T;
}

function generateSlug(name: string, fallbackId: string | number): string {
  if (!name) return `unknown-org-${fallbackId}`;
  return normalizeSlug(name) || `org-${fallbackId}`;
}

// ---------------------------------------------------------------------------
// Data Fetchers with Caching
// ---------------------------------------------------------------------------

/**
 * Cached fetch of all organizations for the admin overview.
 * Reads directly from pre-aggregated stats fields on induction_cycles.
 */
export async function getAdminOrganizations(): Promise<{
  organizations: AdminOrganizationListItem[];
  summary: AdminPlatformSummary;
}> {
  return unstable_cache(
    () => getAdminOrganizationsRaw(),
    ['admin-organizations-overview-v2'],
    {
      revalidate: 30, // 30 seconds TTL
      tags: ['admin-organizations', 'organisations', 'orgs-admin'],
    }
  )();
}

async function getAdminOrganizationsRaw(): Promise<{
  organizations: AdminOrganizationListItem[];
  summary: AdminPlatformSummary;
}> {
  try {
    const strapiRes = await strapiGet('/organisations', {
      populate: {
        profile: { fields: ['id', 'username', 'email', 'profile_url'] },
        circle1_humans: { fields: ['id', 'username', 'email'] },
        circle2_humans: { fields: ['id', 'username', 'email'] },
        members: { fields: ['id', 'username', 'email'] },
        banner: { fields: ['url'] },
        induction_cycles: {
          fields: ['id', 'name', 'status', 'start_date', 'end_date', 'stats', 'deadline_extension'],
        },
      },
      pagination: { page: 1, pageSize: 300 },
      sort: 'name:asc',
    });

    const rows = strapiRes?.data ?? [];
    let platformTotalOpens = 0;
    let platformTotalApplications = 0;
    let platformTotalRoles = 0;
    let platformActiveInductionOrgs = 0;

    const organizations: AdminOrganizationListItem[] = [];

    for (const org of rows) {
      const a = attrs<any>(org);
      const orgId = String(org.id ?? a.id ?? org.documentId ?? Math.random().toString(36).substring(7));
      const orgName = a.name || 'Unknown Organization';
      const slug = a.slug ? normalizeSlug(a.slug) : generateSlug(orgName, orgId);

      const profileRel = a.profile?.data ?? a.profile;
      const profileItem = Array.isArray(profileRel) ? profileRel[0] : profileRel;
      const profileAttrs = attrs<any>(profileItem);
      const orgEmail = profileAttrs.email || a.email || 'Not specified';

      // Admin panel only has visibility for attached clubs
      if (!isAllowedAdminClub(orgName, slug, orgEmail)) {
        continue;
      }

      const logoUrl = formatImageUrl(profileAttrs.profile_url || a.logoUrl);
      const bannerUrl = formatImageUrl(a.banner?.data?.[0]?.attributes?.url || a.banner?.data?.attributes?.url || a.bannerUrl);

      const circle1 = a.circle1_humans?.data ?? a.circle1_humans ?? [];
      const circle2 = a.circle2_humans?.data ?? a.circle2_humans ?? [];
      const members = a.members?.data ?? a.members ?? [];
      const teamSize = (Array.isArray(circle1) ? circle1.length : 0) +
        (Array.isArray(circle2) ? circle2.length : 0) +
        (Array.isArray(members) ? members.length : 0);

      // Induction cycles extraction
      const rawCycles = a.induction_cycles?.data ?? a.induction_cycles ?? [];
      const cyclesList = Array.isArray(rawCycles) ? rawCycles : [];

      let hasActiveCycle = false;
      let activeCycleData: AdminOrganizationListItem['activeCycle'] = null;
      let orgTotalOpens = 0;
      let orgTotalApplications = 0;
      let orgTotalRoles = 0;
      let mostRecentEnd: string | null = null;

      for (const c of cyclesList) {
        const cAttrs = attrs<any>(c);
        const rawStatus = (cAttrs.status as CycleStatus) || 'draft';
        const startDate = cAttrs.start_date ?? null;
        const endDate = cAttrs.end_date ?? null;
        const derivedStatus = getDerivedCycleStatus(rawStatus, startDate, endDate);

        const stats: CycleStats = { ...PLACEHOLDER_CYCLE_STATS, ...(cAttrs.stats ?? {}) };
        orgTotalOpens += stats.totalOpens || 0;
        orgTotalApplications += stats.totalFills || stats.applicantsCount || 0;
        orgTotalRoles += stats.rolesCount || 0;

        if (endDate) {
          if (!mostRecentEnd || new Date(endDate).getTime() > new Date(mostRecentEnd).getTime()) {
            mostRecentEnd = endDate;
          }
        }

        if (derivedStatus === 'active') {
          hasActiveCycle = true;
          activeCycleData = {
            id: String(c.id ?? cAttrs.id),
            name: cAttrs.name || 'Active Cycle',
            status: 'active',
            startDate,
            endDate,
          };
        }
      }

      // Legacy fallback
      const isLegacyOpen = a.induction === true && (
        !a.induction_end ||
        new Date(normalizeEndDateToEndOfDay(a.induction_end) || a.induction_end).getTime() >= Date.now()
      );
      const activeInductions = hasActiveCycle || isLegacyOpen;

      if (activeInductions) {
        platformActiveInductionOrgs++;
      }

      platformTotalOpens += orgTotalOpens;
      platformTotalApplications += orgTotalApplications;
      platformTotalRoles += orgTotalRoles;

      const effectiveEndDate = activeCycleData?.endDate || a.induction_end || mostRecentEnd;
      let lastInductedFormatted = 'None';
      if (effectiveEndDate) {
        const d = new Date(effectiveEndDate);
        if (!isNaN(d.getTime())) {
          lastInductedFormatted = d.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
      }

      const completionRate = orgTotalOpens > 0 ? (orgTotalApplications / orgTotalOpens) * 100 : 0;

      organizations.push({
        id: orgId,
        name: orgName,
        slug,
        type: a.type || 'club',
        email: orgEmail,
        logoUrl,
        bannerUrl,
        activeInductions,
        teamSize,
        openRolesCount: orgTotalRoles,
        totalApplications: orgTotalApplications,
        totalOpens: orgTotalOpens,
        completionRate: Math.round(completionRate * 10) / 10,
        activeCycle: activeCycleData,
        lastInducted: lastInductedFormatted,
      });
    }

    const overallCompletionRate = platformTotalOpens > 0
      ? Math.round((platformTotalApplications / platformTotalOpens) * 1000) / 10
      : 0;

    const summary: AdminPlatformSummary = {
      totalOrganisations: organizations.length,
      totalOrganizations: organizations.length,
      activeInductionOrgs: platformActiveInductionOrgs,
      totalOpenRoles: platformTotalRoles,
      totalApplications: platformTotalApplications,
      totalOpens: platformTotalOpens,
      overallCompletionRate,
    };

    return { organizations, summary };
  } catch (error) {
    console.error('Error in getAdminOrganizationsRaw:', error);
    return {
      organizations: [],
      summary: {
        totalOrganisations: 0,
        totalOrganizations: 0,
        activeInductionOrgs: 0,
        totalOpenRoles: 0,
        totalApplications: 0,
        totalOpens: 0,
        overallCompletionRate: 0,
      },
    };
  }
}

/**
 * Cached fetch of full organization analytics and cycle stats for the admin dashboard.
 * Reads directly from pre-computed `stats` fields on cycles and roles.
 */
export async function getAdminOrganizationDetails(slug: string): Promise<AdminOrganizationDetail | null> {
  return unstable_cache(
    () => getAdminOrganizationDetailsRaw(slug),
    [`admin-org-detail-v2-${slug}`],
    {
      revalidate: 30, // 30 seconds TTL
      tags: [`admin-org:${slug}`, 'admin-organizations', 'organisations'],
    }
  )();
}

async function getAdminOrganizationDetailsRaw(slug: string): Promise<AdminOrganizationDetail | null> {
  try {
    const targetSlugNormalized = normalizeSlug(slug);

    // 1. Fetch all organisations with direct 1-level relations
    const strapiRes = await strapiGet('/organisations', {
      populate: {
        profile: { fields: ['id', 'username', 'email', 'profile_url'] },
        circle1_humans: { fields: ['id', 'username', 'email'] },
        circle2_humans: { fields: ['id', 'username', 'email'] },
        members: { fields: ['id', 'username', 'email'] },
        banner: { fields: ['url'] },
        induction_cycles: {
          fields: ['id', 'name', 'status', 'start_date', 'end_date', 'description', 'stats', 'deadline_extension', 'createdAt'],
        },
      },
      pagination: { page: 1, pageSize: 300 },
    });

    const rows = strapiRes?.data ?? [];
    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn('[getAdminOrganizationDetailsRaw] No organisations returned from Strapi');
      return null;
    }

    // 2. Find matching organization by slug, name, or id strictly within allowed clubs
    const orgEntry = rows.find((item: any) => {
      const a = attrs<any>(item);
      const itemId = String(item.id ?? a.id ?? item.documentId);
      const nameSlug = normalizeSlug(a.name);
      const rawSlug = normalizeSlug(a.slug);

      const profileRel = a.profile?.data ?? a.profile;
      const profileItem = Array.isArray(profileRel) ? profileRel[0] : profileRel;
      const profileAttrs = attrs<any>(profileItem);
      const orgEmail = profileAttrs.email || a.email || null;

      // Admin panel only has visibility for attached clubs
      if (!isAllowedAdminClub(a.name, a.slug, orgEmail)) {
        return false;
      }
      
      return (
        rawSlug === targetSlugNormalized ||
        nameSlug === targetSlugNormalized ||
        itemId === slug ||
        itemId === targetSlugNormalized ||
        (a.name && a.name.toLowerCase() === slug.toLowerCase()) ||
        nameSlug.replace(/-/g, '') === targetSlugNormalized.replace(/-/g, '')
      );
    });

    if (!orgEntry) {
      console.warn(`[getAdminOrganizationDetailsRaw] Org not found for slug: "${slug}" (normalized: "${targetSlugNormalized}")`);
      return null;
    }

    const a = attrs<any>(orgEntry);
    const orgId = Number(orgEntry.id ?? a.id ?? orgEntry.documentId);
    const orgName = a.name || 'Unknown Organization';
    const orgSlug = a.slug ? normalizeSlug(a.slug) : generateSlug(orgName, orgId);

    const profileRel = a.profile?.data ?? a.profile;
    const profileItem = Array.isArray(profileRel) ? profileRel[0] : profileRel;
    const profileAttrs = attrs<any>(profileItem);
    const orgEmail = profileAttrs.email || a.email || null;
    const logoUrl = formatImageUrl(profileAttrs.profile_url || a.logoUrl);
    const bannerUrl = formatImageUrl(a.banner?.data?.[0]?.attributes?.url || a.banner?.data?.attributes?.url || a.bannerUrl);

    // Leadership
    const c1 = a.circle1_humans?.data ?? a.circle1_humans ?? [];
    const leadershipTier1 = (Array.isArray(c1) ? c1 : []).map((m: any) => {
      const mA = attrs<any>(m);
      return {
        username: mA.username || 'Leadership Lead',
        email: mA.email || 'No email',
      };
    });

    const c2 = a.circle2_humans?.data ?? a.circle2_humans ?? [];
    const leadershipTier2 = (Array.isArray(c2) ? c2 : []).map((m: any) => {
      const mA = attrs<any>(m);
      return {
        username: mA.username || 'Core Member',
        email: mA.email || 'No email',
      };
    });

    const membersRel = a.members?.data ?? a.members ?? [];
    const membersCount = Array.isArray(membersRel) ? membersRel.length : 0;
    const teamSize = leadershipTier1.length + leadershipTier2.length + membersCount;

    // Process induction cycles & live stats
    let rawCycles = a.induction_cycles?.data ?? a.induction_cycles ?? [];
    let cyclesList: any[] = Array.isArray(rawCycles) ? rawCycles : [];

    // If no cycles in relation, fetch via listCyclesByOrg
    if (cyclesList.length === 0 && !isNaN(orgId) && orgId > 0) {
      try {
        const fetchedCycles = await listCyclesByOrg(orgId);
        cyclesList = fetchedCycles;
      } catch (err) {
        console.error('Error fetching cycles by org:', err);
      }
    }

    let totalAggOpens = 0;
    let totalAggFills = 0;
    let totalAggDrafts = 0;
    let totalAggRoles = 0;

    const processedCycles: AdminCycleDetail[] = [];

    for (const c of cyclesList) {
      const cAttrs = attrs<any>(c);
      const cycleId = String(c.id ?? cAttrs.id);
      const rawStatus = (cAttrs.status as CycleStatus) || 'draft';
      const startDate = cAttrs.start_date ?? c.startDate ?? null;
      const endDate = cAttrs.end_date ?? c.endDate ?? null;
      const derivedStatus = getDerivedCycleStatus(rawStatus, startDate, endDate);
      const cycleStats: CycleStats = {
        ...PLACEHOLDER_CYCLE_STATS,
        ...(cAttrs.stats ?? c.stats ?? {}),
      };

      // Fetch roles for this cycle
      let rolesForCycle: AdminRoleDetail[] = [];
      try {
        const inductionRoles = await listRolesByCycle(cycleId);
        rolesForCycle = inductionRoles.map((r) => {
          return {
            id: r.id,
            name: r.name,
            tier: r.tier,
            department: r.department,
            description: r.description,
            stats: r.stats || PLACEHOLDER_ROLE_STATS,
            pipelineRounds: [],
          };
        });
      } catch (err) {
        console.error(`Error fetching roles for cycle ${cycleId}:`, err);
      }

      // Build timeline for this cycle
      const timeline: AdminTimelineStep[] = [];
      if (startDate || endDate) {
        timeline.push({
          step: 'Applications Open',
          date: startDate ? new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Announced',
          status: 'completed',
        });
      }

      if (endDate) {
        const isPast = new Date(endDate).getTime() < Date.now();
        timeline.push({
          step: 'Applications Close',
          date: new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          status: isPast ? 'completed' : 'current',
        });
      } else if (timeline.length === 0) {
        timeline.push(
          { step: 'Applications Open', date: 'TBD', status: 'upcoming' },
          { step: 'Applications Close', date: 'TBD', status: 'upcoming' }
        );
      }

      totalAggOpens += cycleStats.totalOpens || 0;
      totalAggFills += cycleStats.totalFills || cycleStats.applicantsCount || 0;
      totalAggDrafts += cycleStats.totalDrafts || 0;
      totalAggRoles += rolesForCycle.length || cycleStats.rolesCount || 0;

      processedCycles.push({
        id: cycleId,
        name: cAttrs.name || c.name || 'Induction Cycle',
        status: derivedStatus,
        startDate,
        endDate,
        description: cAttrs.description ?? c.description ?? null,
        stats: cycleStats,
        roles: rolesForCycle,
        timeline,
      });
    }

    // If no cycles exist at all, construct a fallback cycle from legacy induction fields
    if (processedCycles.length === 0) {
      const isLegacyOpen = !!a.induction;
      const legacyEnd = a.induction_end ?? null;
      processedCycles.push({
        id: 'legacy-cycle',
        name: 'General Recruitment',
        status: isLegacyOpen ? 'active' : 'completed',
        startDate: null,
        endDate: legacyEnd,
        description: a.induction_description ?? null,
        stats: PLACEHOLDER_CYCLE_STATS,
        roles: [],
        timeline: [
          { step: 'Applications Open', date: 'Announced', status: 'completed' },
          {
            step: 'Applications Close',
            date: legacyEnd ? new Date(legacyEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD',
            status: legacyEnd && new Date(legacyEnd).getTime() < Date.now() ? 'completed' : 'current',
          },
        ],
      });
    }

    // Sort cycles: active first, then draft, then completed, then archived
    processedCycles.sort((a, b) => {
      const order = { active: 0, draft: 1, completed: 2, archived: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });

    const isInductionsActive = processedCycles.some((c) => c.status === 'active') || !!a.induction;

    const aggregateStats = {
      totalApplications: totalAggFills,
      totalOpens: totalAggOpens,
      totalDrafts: totalAggDrafts,
      totalRoles: totalAggRoles,
      completionRate: totalAggOpens > 0 ? Math.round((totalAggFills / totalAggOpens) * 1000) / 10 : 0,
    };

    return {
      id: String(orgId),
      name: orgName,
      slug: orgSlug,
      type: a.type || 'club',
      description: a.description || a.short_description || 'No description available.',
      logoUrl,
      bannerUrl,
      email: orgEmail,
      inductionsOpen: isInductionsActive,
      inductionEnd: a.induction_end ?? null,
      teamSize,
      leadershipTier1,
      leadershipTier2,
      membersCount,
      cycles: processedCycles,
      aggregateStats,
    };
  } catch (error) {
    console.error('Error in getAdminOrganizationDetailsRaw:', error);
    return null;
  }
}

export const getAdminOrganisations = getAdminOrganizations;
export const getAdminOrganisationDetails = getAdminOrganizationDetails;


