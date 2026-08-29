import 'server-only';

import { unstable_cache, revalidateTag } from 'next/cache';

/**
 * Server-only data access for induction cycles, roles, pipeline rounds, and applicants.
 * All Strapi API calls using STRAPI_API_TOKEN live here or in route handlers.
 */

import { strapiGet, strapiPost, strapiPut, strapiDelete, type StrapiFilters } from '@/lib/apis/strapi';
import type {
  InductionCycleSummary,
  InductionRole,
  PipelineRound,
  RoleTier,
  CycleStatus,
  PipelineRoundType,
} from '@/app/organisations/inductions/types';
import {
  PLACEHOLDER_CYCLE_STATS,
  PLACEHOLDER_ROLE_STATS,
  getDerivedCycleStatus,
} from '@/app/organisations/inductions/types';
import type { ApplicantRow, ApplicantStatus } from '@/app/organisations/inductions/_components/role-applicants';
import { createForm, getFormByUid } from '@/lib/forms/strapi-forms';
import { normalizeStartDateToStartOfDay, normalizeEndDateToEndOfDay } from '@/lib/date-utils';
import { syncOrganisationInductionCalendarEvent } from './calendar-sync';

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

function attrs<T = Record<string, unknown>>(entry: any): T {
  return (entry?.attributes ?? entry ?? {}) as T;
}

export function normalizeCycle(entry: any): InductionCycleSummary | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  const rawStatus = (a.status as CycleStatus) || 'draft';
  const startDate = a.start_date ?? null;
  const endDate = a.end_date ?? null;
  const derivedStatus = getDerivedCycleStatus(rawStatus, startDate, endDate);
  const stats = a.stats || PLACEHOLDER_CYCLE_STATS;
  const deadlineExtension = a.deadline_extension ?? stats?.deadlineExtension ?? null;

  return {
    id: id.toString(),
    name: a.name || 'Untitled Cycle',
    status: derivedStatus,
    startDate,
    endDate,
    description: a.description ?? null,
    stats,
    createdAt: a.createdAt || new Date().toISOString(),
    deadlineExtension,
  };
}

export function normalizeRole(entry: any): InductionRole | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  // Extract linked form IDs from pipeline_rounds if present
  const rounds = Array.isArray(a.pipeline_rounds?.data)
    ? a.pipeline_rounds.data
    : Array.isArray(a.pipeline_rounds)
      ? a.pipeline_rounds
      : [];

  const sortedRounds = [...rounds].sort((x: any, y: any) => {
    const xAttrs = x?.attributes ?? x;
    const yAttrs = y?.attributes ?? y;
    return (xAttrs.order ?? 0) - (yAttrs.order ?? 0);
  });

  const firstRound = sortedRounds[0];
  let roleStats = a.stats || PLACEHOLDER_ROLE_STATS;
  if (firstRound) {
    const rAttrs = firstRound?.attributes ?? firstRound;
    const formEntry = rAttrs?.form?.data ?? rAttrs?.form;
    const formAttrs = formEntry?.attributes ?? formEntry;
    if (formAttrs?.stats) {
      const fs = formAttrs.stats;
      const opens = fs.uniqueVisits ?? 0;
      const fills = fs.submissionCount ?? 0;
      const drafts = fs.draftCount ?? 0;
      roleStats = {
        opens,
        fills,
        drafts,
        completionRate: opens > 0 ? fills / opens : 0,
        topUtm: null,
      };
    }
  }

  const formIds = rounds
    .flatMap((r: any) => {
      const rAttrs = r?.attributes ?? r;
      return rAttrs?.form_ids ?? rAttrs?.formIds ?? (rAttrs?.form ? [rAttrs.form] : []);
    })
    .filter((fId: any) => typeof fId === 'string' && fId.trim() && fId !== '[object Object]');

  return {
    id: id.toString(),
    name: a.name || 'Untitled Role',
    tier: (a.tier as RoleTier) || 'tier-1',
    department: a.department || null,
    description: a.description || null,
    accessEmails: a.access_emails || a.accessEmails || [],
    formIds,
    primaryFormId: formIds[0] ?? null,
    sendResponseNotifications: a.send_response_notifications ?? a.sendResponseNotifications ?? true,
    stats: roleStats,
    createdAt: a.createdAt || new Date().toISOString(),
  };
}

export function normalizePipelineRound(entry: any): PipelineRound | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  // --- Backward-compat: read legacy single `form` relation as formIds[0] ---
  const formEntry = a.form?.data ?? a.form;
  const formAttrs = formEntry?.attributes ?? formEntry;
  const extractedFormId =
    formAttrs?.form_uid ??
    formAttrs?.uid ??
    formEntry?.id ??
    (typeof a.form === 'string' || typeof a.form === 'number' ? a.form : null);

  const legacyFormId =
    extractedFormId != null && typeof extractedFormId !== 'object'
      ? String(extractedFormId)
      : null;

  // New field: form_ids (JSON array of form uid strings)
  const rawFormIds: string[] | undefined = a.form_ids ?? a.formIds;
  const formIds: string[] = Array.isArray(rawFormIds)
    ? rawFormIds.filter((id: any) => typeof id === 'string' && id.trim() && id !== '[object Object]')
    : legacyFormId && legacyFormId !== '[object Object]'
      ? [legacyFormId]
      : [];

  return {
    id: id.toString(),
    type: (a.type as PipelineRoundType) || 'form',
    status: (a.status as any) || 'active',
    label: a.label || 'Round',
    formId: formIds[0] ?? null,
    formIds,
    deadline: a.deadline ?? null,
    description: a.description ?? null,
    order: typeof a.order === 'number' ? a.order : 0,
    interviewConfig: a.interview_config ?? a.interviewConfig ?? null,
    resultsConfig: a.results_config ?? a.resultsConfig ?? null,
  };
}

export function normalizeApplicant(entry: any): ApplicantRow | null {
  if (!entry) return null;
  const a = attrs<any>(entry);
  const id = entry.id ?? a.id;
  if (id == null) return null;

  // Never show draft form submissions to organisations
  if (a.state === 'draft') return null;

  const respondent = a.respondent?.data?.attributes ?? a.respondent ?? {};
  const respondentEmail = a.respondent_email || respondent.email || '';

  // Extract applicant name from user profile or form submission fields
  const formData = typeof a.data === 'object' && a.data !== null ? a.data : {};
  const formName =
    formData.name ||
    formData.fullName ||
    formData['full_name'] ||
    formData['Full Name'] ||
    formData['applicant_name'] ||
    (formData.first_name ? `${formData.first_name} ${formData.last_name || ''}`.trim() : null);

  const fallbackName = respondentEmail
    ? respondentEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Applicant';

  const respondentName = respondent.name || respondent.username || formName || fallbackName;

  let status: ApplicantStatus = 'submitted';
  if (a.application_status === 'approved') {
    status = 'approved';
  } else if (a.application_status === 'advanced') {
    status = 'advanced';
  } else if (a.application_status === 'rejected') {
    status = 'rejected';
  } else {
    status = 'submitted';
  }

  return {
    id: id.toString(),
    email: respondentEmail,
    name: respondentName,
    submittedAt: a.submitted_at || a.createdAt || null,
    status,
    currentRound: typeof a.current_round === 'number' ? a.current_round : 0,
  };
}

// ---------------------------------------------------------------------------
// Induction Cycles
// ---------------------------------------------------------------------------

export async function listCyclesByOrg(organisationId: number): Promise<InductionCycleSummary[]> {
  return unstable_cache(
    () => listCyclesByOrgRaw(organisationId),
    [`org-cycles-${organisationId}`],
    {
      revalidate: 15,
      tags: [`org-cycles:${organisationId}`],
    }
  )();
}

async function listCyclesByOrgRaw(organisationId: number): Promise<InductionCycleSummary[]> {
  const res = await strapiGet('/induction-cycles', {
    filters: {
      organisation: { id: { $eq: organisationId } },
    },
    populate: {
      roles: { fields: ['id'] },
    },
    sort: 'createdAt:desc',
    pagination: { pageSize: 100 },
  });

  const rows = res?.data ?? [];
  const cycles = rows
    .map(normalizeCycle)
    .filter(
      (c: InductionCycleSummary | null): c is InductionCycleSummary =>
        c !== null && c.status !== 'archived'
    );

  for (const cycle of cycles) {
    try {
      const roles = await listRolesByCycle(cycle.id);
      cycle.stats.rolesCount = roles.length;
      let totalOpens = 0;
      let totalFills = 0;
      let totalDrafts = 0;
      for (const r of roles) {
        totalOpens += r.stats?.opens || 0;
        totalFills += r.stats?.fills || 0;
        totalDrafts += r.stats?.drafts || 0;
      }
      cycle.stats.totalOpens = totalOpens;
      cycle.stats.totalFills = totalFills;
      cycle.stats.totalDrafts = totalDrafts;
      cycle.stats.applicantsCount = totalFills;
      cycle.stats.completionRate = totalOpens > 0 ? totalFills / totalOpens : 0;
    } catch (err) {
      console.error(`Error computing backend stats for cycle ${cycle.id}:`, err);
    }
  }

  return cycles;
}

export async function getCycleById(cycleId: string | number): Promise<InductionCycleSummary | null> {
  return unstable_cache(
    () => getCycleByIdRaw(cycleId),
    [`cycle-stats-${cycleId}`],
    {
      revalidate: 15,
      tags: [`cycle-stats:${cycleId}`],
    }
  )();
}

async function getCycleByIdRaw(cycleId: string | number): Promise<InductionCycleSummary | null> {
  const res = await strapiGet(`/induction-cycles/${cycleId}`, {
    populate: {
      organisation: { fields: ['id', 'name'] },
      roles: { fields: ['id', 'name', 'tier', 'department'] },
    },
  });

  const cycle = normalizeCycle(res?.data);
  if (cycle) {
    try {
      const roles = await listRolesByCycle(cycle.id);
      cycle.stats.rolesCount = roles.length;
      let totalOpens = 0;
      let totalFills = 0;
      let totalDrafts = 0;
      for (const r of roles) {
        totalOpens += r.stats?.opens || 0;
        totalFills += r.stats?.fills || 0;
        totalDrafts += r.stats?.drafts || 0;
      }
      cycle.stats.totalOpens = totalOpens;
      cycle.stats.totalFills = totalFills;
      cycle.stats.totalDrafts = totalDrafts;
      cycle.stats.applicantsCount = totalFills;
      cycle.stats.completionRate = totalOpens > 0 ? totalFills / totalOpens : 0;
    } catch (err) {
      console.error(`Error computing backend stats for cycle ${cycleId}:`, err);
    }
  }
  return cycle;
}

export async function createCycle(input: {
  organisationId: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}): Promise<InductionCycleSummary | null> {
  const derivedStatus = getDerivedCycleStatus('draft', input.startDate, input.endDate);
  const cleanStartDate = input.startDate ? (input.startDate.includes('T') ? input.startDate.split('T')[0] : input.startDate) : undefined;
  const cleanEndDate = input.endDate ? (input.endDate.includes('T') ? input.endDate.split('T')[0] : input.endDate) : undefined;

  const res = await strapiPost('/induction-cycles', {
    data: {
      name: input.name,
      status: derivedStatus,
      start_date: cleanStartDate,
      end_date: cleanEndDate,
      description: input.description || undefined,
      stats: PLACEHOLDER_CYCLE_STATS,
      organisation: input.organisationId,
    },
  });

  const created = normalizeCycle(res?.data);
  if (created) {
    revalidateTag(`org-cycles:${input.organisationId}`);
    syncOrganisationInductionCalendarEvent(input.organisationId).catch((e) =>
      console.error('Calendar sync error on createCycle:', e)
    );
  }
  return created;
}

export async function updateCycle(
  cycleId: string | number,
  patch: Partial<{
    name: string;
    status: CycleStatus;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    stats: any;
  }>,
): Promise<InductionCycleSummary | null> {
  const existingRes = await strapiGet(`/induction-cycles/${cycleId}`);
  const existingAttrs = attrs<any>(existingRes?.data);

  const cleanStartDate = patch.startDate !== undefined
    ? (patch.startDate ? (patch.startDate.includes('T') ? patch.startDate.split('T')[0] : patch.startDate) : null)
    : undefined;
  const cleanEndDate = patch.endDate !== undefined
    ? (patch.endDate ? (patch.endDate.includes('T') ? patch.endDate.split('T')[0] : patch.endDate) : null)
    : undefined;

  const data: Record<string, any> = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (cleanStartDate !== undefined) data.start_date = cleanStartDate;
  if (cleanEndDate !== undefined) data.end_date = cleanEndDate;
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.stats !== undefined) data.stats = patch.stats;

  const rawStatus = patch.status !== undefined ? patch.status : (existingAttrs?.status as CycleStatus) || 'draft';
  const effectiveStart = cleanStartDate !== undefined ? cleanStartDate : (existingAttrs?.start_date ?? null);
  const effectiveEnd = cleanEndDate !== undefined ? cleanEndDate : (existingAttrs?.end_date ?? null);
  data.status = getDerivedCycleStatus(rawStatus, effectiveStart, effectiveEnd);

  const res = await strapiPut(`/induction-cycles/${cycleId}`, { data });
  const updated = normalizeCycle(res?.data);
  if (updated) {
    revalidateTag(`cycle-stats:${cycleId}`);
    const orgId =
      res?.data?.attributes?.organisation?.data?.id ??
      res?.data?.organisation?.id ??
      existingAttrs?.organisation?.data?.id ??
      existingAttrs?.organisation?.id;
    if (orgId) {
      revalidateTag(`org-cycles:${orgId}`);
      syncOrganisationInductionCalendarEvent(orgId).catch((e) =>
        console.error('Calendar sync error on updateCycle:', e)
      );
    }
  }
  return updated;
}

export async function deleteCycle(cycleId: string | number): Promise<void> {
  // Soft-delete: set status to 'archived' so all roles, rounds, and applicant data remain in Strapi
  const res = await strapiPut(`/induction-cycles/${cycleId}`, {
    data: {
      status: 'archived',
    },
  });
  revalidateTag(`cycle-stats:${cycleId}`);
  const orgId = res?.data?.attributes?.organisation?.data?.id ?? res?.data?.organisation?.id;
  if (orgId) {
    revalidateTag(`org-cycles:${orgId}`);
  }
}

// ---------------------------------------------------------------------------
// Induction Roles
// ---------------------------------------------------------------------------

export async function listRolesByCycle(cycleId: string | number): Promise<InductionRole[]> {
  return unstable_cache(
    () => listRolesByCycleRaw(cycleId),
    [`cycle-roles-${cycleId}`],
    {
      revalidate: 15,
      tags: [`cycle-roles:${cycleId}`],
    }
  )();
}

async function listRolesByCycleRaw(cycleId: string | number): Promise<InductionRole[]> {
  const res = await strapiGet('/induction-roles', {
    filters: {
      induction_cycle: { id: { $eq: cycleId } },
    },
    populate: {
      pipeline_rounds: {
        populate: {
          form: true,
        },
      },
    },
    sort: 'createdAt:asc',
    pagination: { pageSize: 100 },
  });

  const rows = res?.data ?? [];
  return rows.map(normalizeRole).filter((r: InductionRole | null): r is InductionRole => r !== null);
}

export async function getRoleById(roleId: string | number): Promise<InductionRole | null> {
  const res = await strapiGet(`/induction-roles/${roleId}`, {
    populate: {
      induction_cycle: { fields: ['id', 'name'] },
      pipeline_rounds: {
        populate: {
          form: true,
        },
      },
    },
  });

  return normalizeRole(res?.data);
}

export async function createRole(input: {
  cycleId: string | number;
  name: string;
  tier: RoleTier;
  department?: string | null;
  description?: string | null;
  accessEmails?: string[];
  sendResponseNotifications?: boolean;
}): Promise<InductionRole | null> {
  const res = await strapiPost('/induction-roles', {
    data: {
      name: input.name,
      tier: input.tier || 'tier-1',
      department: input.department || undefined,
      description: input.description || undefined,
      access_emails: input.accessEmails || [],
      send_response_notifications: input.sendResponseNotifications ?? true,
      stats: PLACEHOLDER_ROLE_STATS,
      induction_cycle: input.cycleId,
    },
  });

  const created = normalizeRole(res?.data);
  if (created) {
    // 1. Try to fetch cycle to get organisationId and auto-create the application form
    let formDbId: number | undefined = undefined;
    try {
      const cycleRaw = await strapiGet(`/induction-cycles/${input.cycleId}`, {
        populate: { organisation: { fields: ['id'] } },
      });
      const orgId =
        cycleRaw?.data?.attributes?.organisation?.data?.id ??
        cycleRaw?.data?.organisation?.id ??
        cycleRaw?.data?.organisation;

      if (orgId) {
        const formRecord = await createForm(`${input.name} Application Form`, Number(orgId), 'active');
        if (formRecord?.id) {
          formDbId = formRecord.id;
        }
      }
    } catch (err) {
      console.error('Failed to auto-create form for role:', err);
    }

    // 2. Create single default pipeline round (Application Form) linked to the created form
    await strapiPost('/pipeline-rounds', {
      data: {
        label: 'Application Form',
        type: 'form',
        order: 0,
        description: 'Initial application form for candidates.',
        form: formDbId ?? null,
        role: created.id,
      },
    });

    revalidateTag(`cycle-roles:${input.cycleId}`);
    revalidateTag(`cycle-stats:${input.cycleId}`);

    // Sync updated roles to Google Calendar event
    getCycleOwnerOrgId(input.cycleId).then((ownerOrgId) => {
      if (ownerOrgId) {
        syncOrganisationInductionCalendarEvent(ownerOrgId).catch((e) =>
          console.error('Calendar sync error on createRole:', e)
        );
      }
    }).catch(console.error);
  }

  return created;
}

export async function updateRole(
  roleId: string | number,
  patch: Partial<{
    name: string;
    tier: RoleTier;
    department: string | null;
    description: string | null;
    accessEmails: string[];
    sendResponseNotifications: boolean;
    stats: any;
  }>,
): Promise<InductionRole | null> {
  const data: Record<string, any> = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.tier !== undefined) data.tier = patch.tier;
  if (patch.department !== undefined) data.department = patch.department;
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.accessEmails !== undefined) data.access_emails = patch.accessEmails;
  if (patch.sendResponseNotifications !== undefined) data.send_response_notifications = patch.sendResponseNotifications;
  if (patch.stats !== undefined) data.stats = patch.stats;

  const res = await strapiPut(`/induction-roles/${roleId}`, { data });
  const updated = normalizeRole(res?.data);
  if (updated) {
    const cycleId = res?.data?.attributes?.induction_cycle?.data?.id ?? res?.data?.induction_cycle?.id;
    if (cycleId) {
      revalidateTag(`cycle-roles:${cycleId}`);
      revalidateTag(`cycle-stats:${cycleId}`);
    }
  }
  return updated;
}

export async function deleteRole(roleId: string | number): Promise<void> {
  try {
    const roleRaw = await strapiGet(`/induction-roles/${roleId}`, {
      populate: { induction_cycle: { fields: ['id'] } },
    });
    const cycleId =
      roleRaw?.data?.attributes?.induction_cycle?.data?.id ??
      roleRaw?.data?.induction_cycle?.id ??
      roleRaw?.data?.induction_cycle;
    if (cycleId) {
      revalidateTag(`cycle-roles:${cycleId}`);
      revalidateTag(`cycle-stats:${cycleId}`);
    }
  } catch (err) {
    console.error('Failed to resolve cycleId during role delete:', err);
  }

  // Clean up pipeline rounds
  const rounds = await listPipelineByRole(roleId);
  for (const r of rounds) {
    await strapiDelete(`/pipeline-rounds/${r.id}`);
  }
  await strapiDelete(`/induction-roles/${roleId}`);
}

// ---------------------------------------------------------------------------
// Pipeline Rounds
// ---------------------------------------------------------------------------

export async function listPipelineByRole(roleId: string | number): Promise<PipelineRound[]> {
  const res = await strapiGet('/pipeline-rounds', {
    filters: {
      role: { id: { $eq: roleId } },
    },
    populate: {
      form: { fields: ['id', 'form_uid', 'title'] },
    },
    sort: 'order:asc',
    pagination: { pageSize: 50 },
  });

  const rows = res?.data ?? [];
  return rows.map(normalizePipelineRound).filter((r: PipelineRound | null): r is PipelineRound => r !== null);
}

export async function syncPipeline(roleId: string | number, rounds: PipelineRound[]): Promise<PipelineRound[]> {
  const existing = await listPipelineByRole(roleId);
  const existingIds = new Set(existing.map((r) => r.id));
  const nextIds = new Set(rounds.map((r) => r.id));

  // Delete removed rounds
  for (const ex of existing) {
    if (!nextIds.has(ex.id)) {
      await strapiDelete(`/pipeline-rounds/${ex.id}`);
    }
  }

  // Upsert rounds — type is user-chosen, no enforcement
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    const roundType = round.type || 'form';

    // Resolve first formId for legacy single-relation `form` field
    const formIds = round.formIds ?? (round.formId ? [round.formId] : []);
    let formDbId: number | null = null;
    if (roundType === 'form' && formIds.length > 0) {
      const firstId = formIds[0];
      if (firstId && firstId !== 'none' && firstId !== '[object Object]') {
        if (!isNaN(Number(firstId)) && !firstId.includes('-')) {
          formDbId = Number(firstId);
        } else {
          const formRecord = await getFormByUid(firstId);
          if (formRecord?.id) {
            formDbId = formRecord.id;
          }
        }
      }
    }

    const data = {
      label: round.label,
      type: roundType,
      status: round.status || 'active',
      order: i,
      deadline: round.deadline ? normalizeEndDateToEndOfDay(round.deadline) : undefined,
      description: round.description || undefined,
      form: roundType === 'form' ? formDbId ?? null : null,
      form_ids: roundType === 'form' ? formIds : [],
      role: parseInt(roleId.toString(), 10),
      interview_config: roundType === 'interview' ? round.interviewConfig ?? null : null,
      results_config: roundType === 'results' ? round.resultsConfig ?? null : null,
    };

    if (existingIds.has(round.id)) {
      await strapiPut(`/pipeline-rounds/${round.id}`, { data });
    } else {
      await strapiPost('/pipeline-rounds', { data });
    }
  }

  return listPipelineByRole(roleId);
}

// ---------------------------------------------------------------------------
// Interview Scheduling Data Access
// ---------------------------------------------------------------------------

export interface PopulatedPipelineRound extends PipelineRound {
  role?: {
    id: string;
    name: string;
    tier: string;
    department?: string | null;
  } | null;
  cycle?: {
    id: string;
    name: string;
  } | null;
  organisation?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    email?: string | null;
    /**
     * Every address that can represent the organisation running this cycle
     * (org record, official profile account, circle-1 leads). The candidate's
     * calendar invite always includes these.
     */
    emails?: string[];
  } | null;
}

/**
 * The organisation's own addresses, from its `profile` account relation.
 *
 * The organisation type has no `email` attribute — the address lives on the
 * linked profile account. Circle-1/circle-2 members are individual leads, not
 * the organisation, so they are deliberately excluded.
 */
function collectOrgEmails(orgAttrs: any): string[] {
  const seen = new Set<string>();
  const rel = orgAttrs?.profile?.data ?? orgAttrs?.profile;
  const entries = Array.isArray(rel) ? rel : rel ? [rel] : [];
  for (const entry of entries) {
    const raw = entry?.attributes?.email ?? entry?.email;
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim().toLowerCase();
    if (trimmed.includes('@')) seen.add(trimmed);
  }
  return Array.from(seen);
}

/**
 * The organisation's own contact addresses. Used to pre-fill interview
 * invitees so the org running a cycle is always on its candidates' invites.
 */
export async function getOrganisationEmails(organisationId: number | string): Promise<string[]> {
  try {
    // No top-level `fields`: the organisation type has no `email` attribute and
    // asking for it makes Strapi reject the request with 400.
    const res = await strapiGet(`/organisations/${organisationId}`, {
      populate: { profile: { fields: ['email', 'username'] } },
    });
    return collectOrgEmails(attrs<any>(res?.data ?? res));
  } catch (err) {
    console.error('Failed to resolve organisation emails for:', organisationId, err);
    return [];
  }
}

export async function getPipelineRoundDetails(roundId: string | number): Promise<PopulatedPipelineRound | null> {
  try {
    const res = await strapiGet(`/pipeline-rounds/${roundId}`, {
      populate: {
        form: { fields: ['id', 'form_uid', 'title'] },
        role: {
          populate: {
            induction_cycle: {
              populate: {
                organisation: {
                  fields: ['id', 'name'],
                  // Logo and contact address both live on the profile account.
                  populate: {
                    profile: { fields: ['email', 'username', 'profile_url'] },
                  },
                },
              },
            },
          },
        },
      },
    });

    const entry = res?.data;
    if (!entry) return null;

    const baseRound = normalizePipelineRound(entry);
    if (!baseRound) return null;

    const a = attrs<any>(entry);
    const roleEntry = a.role?.data ?? a.role;
    const roleAttrs = roleEntry?.attributes ?? roleEntry;

    const cycleEntry = roleAttrs?.induction_cycle?.data ?? roleAttrs?.induction_cycle;
    const cycleAttrs = cycleEntry?.attributes ?? cycleEntry;

    const orgEntry = cycleAttrs?.organisation?.data ?? cycleAttrs?.organisation;
    const orgAttrs = orgEntry?.attributes ?? orgEntry;
    const orgProfileRel = orgAttrs?.profile?.data ?? orgAttrs?.profile;
    const orgProfileEntry = Array.isArray(orgProfileRel) ? orgProfileRel[0] : orgProfileRel;
    const orgProfile = orgProfileEntry?.attributes ?? orgProfileEntry;
    const orgEmails = collectOrgEmails(orgAttrs);

    return {
      ...baseRound,
      role: roleEntry?.id
        ? {
            id: roleEntry.id.toString(),
            name: roleAttrs?.name || 'Role',
            tier: roleAttrs?.tier || 'tier-1',
            department: roleAttrs?.department || null,
          }
        : null,
      cycle: cycleEntry?.id
        ? {
            id: cycleEntry.id.toString(),
            name: cycleAttrs?.name || 'Induction Cycle',
          }
        : null,
      organisation: orgEntry?.id
        ? {
            id: orgEntry.id.toString(),
            name: orgAttrs?.name || 'Organisation',
            logoUrl: orgProfile?.profile_url || null,
            email: orgEmails[0] ?? null,
            emails: orgEmails,
          }
        : null,
    };
  } catch (err) {
    console.error('Error fetching pipeline round details for ID:', roundId, err);
    return null;
  }
}

// Mutex map for atomic interview slot reservations per round
const bookingLockMap = new Map<string, Promise<any>>();

export async function bookInterviewSlot(
  roundId: string | number,
  booking: {
    slotKey: string;
    candidateEmail: string;
    candidateName?: string;
  },
): Promise<{ success: boolean; round?: PipelineRound | null; error?: string }> {
  const roundKey = String(roundId);
  const currentLock = bookingLockMap.get(roundKey) || Promise.resolve();

  const nextLock = currentLock.then(async () => {
    try {
      // Direct raw Strapi fetch to bypass any cached response state
      const resRound = await strapiGet(`/pipeline-rounds/${roundId}`, {
        populate: { interview_config: true },
      });
      const rawRound = resRound?.data;
      if (!rawRound) {
        return { success: false, error: 'Interview round not found' };
      }

      const normalized = normalizePipelineRound(rawRound);
      if (!normalized || normalized.type !== 'interview') {
        return { success: false, error: 'This round is not configured for interview scheduling' };
      }

      const currentConfig = normalized.interviewConfig || {
        eventTitle: normalized.label,
        eventDescription: normalized.description || '',
        invitees: [],
        dateMode: 'dates',
        slotMode: 'default',
        slotDuration: 30,
        selectedSlots: [],
        bookings: [],
      };

      const existingBookings = currentConfig.bookings || [];

      // Concurrency Check: Check if slot is already booked by another candidate
      const isAlreadyBooked = existingBookings.some(
        (b) =>
          b.slotKey === booking.slotKey &&
          b.candidateEmail.toLowerCase() !== booking.candidateEmail.toLowerCase(),
      );

      if (isAlreadyBooked) {
        return {
          success: false,
          error: 'This time slot has already been booked by another candidate. Please select a different time slot.',
        };
      }

      // Add booking (or update if candidate is re-scheduling in this round)
      const filteredBookings = existingBookings.filter(
        (b) => b.candidateEmail.toLowerCase() !== booking.candidateEmail.toLowerCase(),
      );

      const newBooking = {
        slotKey: booking.slotKey,
        candidateEmail: booking.candidateEmail,
        candidateName: booking.candidateName || undefined,
        bookedAt: new Date().toISOString(),
      };

      const updatedConfig = {
        ...currentConfig,
        bookings: [...filteredBookings, newBooking],
      };

      const putRes = await strapiPut(`/pipeline-rounds/${roundId}`, {
        data: {
          interview_config: updatedConfig,
        },
      });

      return {
        success: true,
        round: normalizePipelineRound(putRes?.data),
      };
    } catch (err: any) {
      console.error('Error booking interview slot for round:', roundId, err);
      return { success: false, error: err.message || 'Failed to book slot' };
    }
  });

  bookingLockMap.set(roundKey, nextLock);
  return nextLock;
}

// ---------------------------------------------------------------------------
// Applicants (Form Responses linked to a role)
// ---------------------------------------------------------------------------

export async function listApplicantsByRole(roleId: string | number): Promise<ApplicantRow[]> {
  try {
    const rounds = await listPipelineByRole(roleId);
    const sortedRounds = [...rounds].sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
    const firstRound = sortedRounds[0];

    const numericFormIds: number[] = [];
    const uidFormIds: string[] = [];

    if (firstRound) {
      const allFormIds = firstRound.formIds ?? (firstRound.formId ? [firstRound.formId] : []);
      for (const fid of allFormIds) {
        if (fid && fid !== 'none' && fid !== '[object Object]') {
          if (!isNaN(Number(fid)) && !String(fid).includes('-')) {
            numericFormIds.push(Number(fid));
          } else {
            uidFormIds.push(fid);
            const formRecord = await getFormByUid(fid);
            if (formRecord?.id && !numericFormIds.includes(formRecord.id)) {
              numericFormIds.push(formRecord.id);
            }
          }
        }
      }
    }

    const allEntries: any[] = [];
    const seenIds = new Set<string | number>();

    // 1. Fetch by numeric form IDs directly (guaranteed to match foreign key)
    for (const formId of numericFormIds) {
      const res = await strapiGet('/form-responses', {
        filters: {
          form: { id: { $eq: formId } },
          state: { $eq: 'submitted' },
        },
        populate: {
          respondent: { fields: ['id', 'username', 'email', 'name'] },
          form: { fields: ['id', 'title', 'form_uid'] },
        },
        sort: 'submitted_at:desc,updatedAt:desc',
        pagination: { pageSize: 200 },
      });
      const data = res?.data ?? [];
      for (const item of data) {
        const id = item.id ?? item.attributes?.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          allEntries.push(item);
        }
      }
    }

    // 2. Fetch by direct role relation if any
    const roleRes = await strapiGet('/form-responses', {
      filters: {
        role: { id: { $eq: Number(roleId) || roleId } },
        state: { $eq: 'submitted' },
      },
      populate: {
        respondent: { fields: ['id', 'username', 'email', 'name'] },
        form: { fields: ['id', 'title', 'form_uid'] },
      },
      sort: 'submitted_at:desc,updatedAt:desc',
      pagination: { pageSize: 200 },
    });
    const roleData = roleRes?.data ?? [];
    for (const item of roleData) {
      const id = item.id ?? item.attributes?.id;
      if (id && !seenIds.has(id)) {
        const formEntry = item.attributes?.form?.data ?? item.form;
        const formAttrs = formEntry?.attributes ?? formEntry;
        const formDbId = formEntry?.id ?? formAttrs?.id;
        if (!formDbId || numericFormIds.includes(Number(formDbId))) {
          seenIds.add(id);
          allEntries.push(item);
        }
      }
    }

    return allEntries
      .map(normalizeApplicant)
      .filter((a: ApplicantRow | null): a is ApplicantRow => a !== null);
  } catch (err) {
    console.error('Error fetching applicants for role:', roleId, err);
    return [];
  }
}

export async function updateApplicantStatus(
  responseId: string | number,
  patch: {
    application_status: 'pending' | 'approved' | 'rejected' | 'advanced';
    status_message?: string;
    rejection_reason?: string;
    current_round?: number;
  },
): Promise<ApplicantRow | null> {
  const res = await strapiPut(`/form-responses/${responseId}`, {
    data: patch,
  });

  return normalizeApplicant(res?.data);
}

/**
 * Resolves the induction role and all pipeline rounds associated with a given form.
 */
export async function getPipelineForForm(formId: number | string): Promise<{
  role: { id: string; name: string; tier: string; department?: string | null } | null;
  rounds: PipelineRound[];
  cycle: InductionCycleSummary | null;
} | null> {
  try {
    const isNum = !isNaN(Number(formId)) && !String(formId).includes('-');
    const filters: any = isNum
      ? { form: { id: { $eq: Number(formId) } } }
      : { form: { form_uid: { $eq: String(formId) } } };

    const res = await strapiGet('/pipeline-rounds', {
      filters,
      populate: {
        role: {
          populate: {
            pipeline_rounds: true,
            // The relation is `induction_cycle` everywhere else in this file;
            // populating `cycle` silently returned nothing, so every
            // application resolved with a null cycle (and no deadline).
            induction_cycle: true,
          },
        },
      },
      pagination: { pageSize: 1 },
    });

    const roundEntry = res?.data?.[0];
    if (!roundEntry) return null;

    const a = attrs<any>(roundEntry);
    const roleEntry = a.role?.data ?? a.role;
    const roleAttrs = roleEntry?.attributes ?? roleEntry;

    if (!roleEntry) return null;

    const roleId = roleEntry.id ?? roleAttrs?.id;
    if (!roleId) return null;

    const cycleEntry =
      roleAttrs?.induction_cycle?.data ??
      roleAttrs?.induction_cycle ??
      roleAttrs?.cycle?.data ??
      roleAttrs?.cycle;
    const cycle = cycleEntry ? normalizeCycle(cycleEntry) : null;

    const allRounds = await listPipelineByRole(roleId);
    return {
      role: {
        id: roleId.toString(),
        name: roleAttrs?.name || 'Role',
        tier: roleAttrs?.tier || 'tier-1',
        department: roleAttrs?.department ?? null,
      },
      rounds: allRounds,
      cycle,
    };
  } catch (err) {
    console.error('Error fetching pipeline for form:', formId, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Ownership lookups (see lib/inductions/access.ts for the guards that use them)
// ---------------------------------------------------------------------------

/** Reads a relation that may arrive as `{ data: … }` (v4) or inline (v5). */
function relation(value: any): any {
  const rel = value?.data ?? value;
  return Array.isArray(rel) ? rel[0] : rel;
}

/**
 * The id of the organisation that owns a cycle, or null if the cycle is gone.
 * Every cycle-scoped guard funnels through this — a cycle whose organisation
 * relation is missing is treated as owned by nobody, so nothing can reach it.
 */
export async function getCycleOwnerOrgId(cycleId: string | number): Promise<number | null> {
  try {
    const res = await strapiGet(`/induction-cycles/${cycleId}`, {
      populate: { organisation: { fields: ['id', 'name'] } },
    });
    const a = attrs<any>(res?.data);
    const org = relation(a.organisation);
    const id = org?.id ?? org?.attributes?.id;
    return id == null ? null : Number(id);
  } catch (err) {
    console.error('[inductions] Failed to resolve owner org for cycle', cycleId, err);
    return null;
  }
}

export interface RoleOwnership {
  roleId: string;
  cycleId: string | null;
  organisationId: number | null;
  /** Lower-cased emails the organisation has explicitly shared this role with. */
  accessEmails: string[];
}

/**
 * Resolves a role to its cycle, owning organisation, and shared-with emails in
 * a single request, so role guards never need a second round trip.
 */
export async function getRoleOwnership(roleId: string | number): Promise<RoleOwnership | null> {
  try {
    const res = await strapiGet(`/induction-roles/${roleId}`, {
      populate: {
        induction_cycle: {
          fields: ['id', 'name'],
          populate: { organisation: { fields: ['id', 'name'] } },
        },
      },
    });
    const entry = res?.data;
    if (!entry) return null;
    const a = attrs<any>(entry);
    const id = entry.id ?? a.id;
    if (id == null) return null;

    const cycle = relation(a.induction_cycle);
    const cycleAttrs = cycle?.attributes ?? cycle;
    const cycleId = cycle?.id ?? cycleAttrs?.id ?? null;
    const org = relation(cycleAttrs?.organisation);
    const orgId = org?.id ?? org?.attributes?.id ?? null;

    const rawEmails = a.access_emails ?? a.accessEmails ?? [];
    const accessEmails = (Array.isArray(rawEmails) ? rawEmails : [])
      .filter((e: unknown): e is string => typeof e === 'string')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean);

    return {
      roleId: String(id),
      cycleId: cycleId == null ? null : String(cycleId),
      organisationId: orgId == null ? null : Number(orgId),
      accessEmails,
    };
  } catch (err) {
    console.error('[inductions] Failed to resolve ownership for role', roleId, err);
    return null;
  }
}

/**
 * The organisation whose `profile` account is this email — i.e. the org the
 * caller *is*, not one they merely lead.
 *
 * `getOrganisationIdByUserId` also matches circle-1/circle-2 membership, so it
 * can hand back a different organisation than the one the account owns. Cycle
 * management resolves through here instead.
 */
export async function getOrganisationIdForAccount(email: string): Promise<number | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  try {
    const res = await strapiGet('/organisations', {
      filters: { profile: { email: { $eq: normalized } } },
      fields: ['name'],
      pagination: { pageSize: 1 },
    });
    const row = (res?.data ?? [])[0];
    const id = row?.id ?? row?.attributes?.id;
    return id == null ? null : Number(id);
  } catch (err) {
    console.error('[inductions] Failed to resolve organisation for account', normalized, err);
    return null;
  }
}

export interface SharedRoleSummary {
  roleId: string;
  roleName: string;
  cycleId: string | null;
  cycleName: string | null;
  organisationName: string | null;
}

/**
 * Every role an organisation has explicitly shared with `email`.
 *
 * `access_emails` is a JSON column, which Strapi cannot filter on reliably, so
 * this pulls the (small, campus-sized) role table and matches in memory. If the
 * number of roles ever grows past the page size below, move the access list to
 * a real relation and filter server-side instead.
 */
export async function listRolesSharedWith(email: string): Promise<SharedRoleSummary[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];

  try {
    const res = await strapiGet('/induction-roles', {
      populate: {
        induction_cycle: {
          fields: ['id', 'name', 'status'],
          populate: { organisation: { fields: ['id', 'name'] } },
        },
      },
      pagination: { pageSize: 500 },
    });

    const rows: any[] = res?.data ?? [];
    const shared: SharedRoleSummary[] = [];

    for (const row of rows) {
      const a = attrs<any>(row);
      const rawEmails = a.access_emails ?? a.accessEmails ?? [];
      const emails = (Array.isArray(rawEmails) ? rawEmails : [])
        .filter((e: unknown): e is string => typeof e === 'string')
        .map((e: string) => e.trim().toLowerCase());
      if (!emails.includes(normalized)) continue;

      const cycle = relation(a.induction_cycle);
      const cycleAttrs = cycle?.attributes ?? cycle;
      // Archived cycles are hidden from the org's own list, so hide them here too.
      if (cycleAttrs?.status === 'archived') continue;
      const org = relation(cycleAttrs?.organisation);
      const orgAttrs = org?.attributes ?? org;

      shared.push({
        roleId: String(row.id ?? a.id),
        roleName: a.name || 'Untitled Role',
        cycleId: cycle?.id != null ? String(cycle.id) : null,
        cycleName: cycleAttrs?.name ?? null,
        organisationName: orgAttrs?.name ?? null,
      });
    }

    return shared;
  } catch (err) {
    console.error('[inductions] Failed to list roles shared with', normalized, err);
    return [];
  }
}

/**
 * Checks whether a given user email belongs strictly to an organization account (profile)
 * and NOT an individual human member in circle1_humans or circle2_humans.
 */
export async function isOrganisationAccount(
  userEmail: string,
  organisationId?: number | string,
): Promise<boolean> {
  if (!userEmail) return false;
  const normalizedEmail = userEmail.trim().toLowerCase();

  // 1. Admin emails can always manage for testing & platform governance
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.includes(normalizedEmail)) {
    return true;
  }

  // 2. Platform-governance accounts. NOTE: these pass the ownership check for
  // *every* organisation, not just their own — a deliberate escape hatch, and
  // the one exception to "only the organisation account gets in".
  const orgAdminEmails = [
    'technology.ministry@ashoka.edu.in',
    'sg@ashoka.edu.in',
  ];
  if (orgAdminEmails.includes(normalizedEmail)) {
    return true;
  }

  const { getUserIdByEmail } = await import('@/lib/userid');
  const userId = await getUserIdByEmail(normalizedEmail);
  if (!userId) return false;

  // 3. Direct query: Check if an organization exists where profile.id === userId
  try {
    const directMatch = await strapiGet('/organisations', {
      filters: {
        profile: {
          id: {
            $eq: userId,
          },
        },
      },
      populate: {
        profile: true,
      },
    });

    const orgs = directMatch?.data || (Array.isArray(directMatch) ? directMatch : []);
    if (Array.isArray(orgs) && orgs.length > 0) {
      // Being *an* organisation account is not the question — being *this*
      // organisation's account is. Without the id comparison every org account
      // would pass every other org's ownership check.
      if (!organisationId) return true;
      const matched = orgs.find(
        (o: any) =>
          o.id === Number(organisationId) ||
          o.attributes?.id === Number(organisationId) ||
          String(o.id) === String(organisationId),
      );
      if (matched) return true;
      return false;
    }
  } catch (err) {
    console.error('[isOrganisationAccount] Direct query failed:', err);
  }

  // 4. Fetch the target organisation and check if its profile matches
  if (organisationId) {
    try {
      const orgRes = await strapiGet(`/organisations/${organisationId}`, {
        populate: {
          profile: true,
        },
      });

      const raw = orgRes?.data || orgRes;
      const a = raw?.attributes || raw;
      const profile = a?.profile?.data || a?.profile;
      const profileAttrs = profile?.attributes || profile;

      const profileId = profile?.id ?? profileAttrs?.id ?? null;
      const profileEmail = (profileAttrs?.email ?? profile?.email ?? '').toLowerCase().trim();

      if (profileId && Number(profileId) === Number(userId)) {
        return true;
      }
      if (profileEmail && profileEmail === normalizedEmail) {
        return true;
      }
    } catch (err) {
      console.error('[isOrganisationAccount] Org fetch failed:', err);
    }
  }

  return false;
}

